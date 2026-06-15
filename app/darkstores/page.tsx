// app/darkstores/page.tsx - Location-aware fulfillment network
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  LocateFixed,
  MapPin,
  Navigation,
  PackageCheck,
  RotateCcw,
  Route,
  Warehouse,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/store/useAppStore';
import {
  getLocationForPinCode,
  getNearbyDarkStores,
} from '@/lib/dark-store-utils';

type LocationState = 'idle' | 'locating' | 'ready' | 'denied';

const MAP_BOUNDS = {
  west: 76.94,
  south: 10.985,
  east: 77.045,
  north: 11.04,
};
const MAP_ZOOM = 13;

function longitudeToTileX(longitude: number) {
  return ((longitude + 180) / 360) * 2 ** MAP_ZOOM;
}

function latitudeToTileY(latitude: number) {
  const radians = latitude * Math.PI / 180;
  return (
    (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) /
    2 *
    2 ** MAP_ZOOM
  );
}

const MAP_TILE_BOUNDS = {
  left: longitudeToTileX(MAP_BOUNDS.west),
  right: longitudeToTileX(MAP_BOUNDS.east),
  top: latitudeToTileY(MAP_BOUNDS.north),
  bottom: latitudeToTileY(MAP_BOUNDS.south),
};

const MAP_TILES = Array.from(
  {
    length:
      (Math.ceil(MAP_TILE_BOUNDS.right) - Math.floor(MAP_TILE_BOUNDS.left)) *
      (Math.ceil(MAP_TILE_BOUNDS.bottom) - Math.floor(MAP_TILE_BOUNDS.top)),
  },
  (_, index) => {
    const columns = Math.ceil(MAP_TILE_BOUNDS.right) - Math.floor(MAP_TILE_BOUNDS.left);
    return {
      x: Math.floor(MAP_TILE_BOUNDS.left) + index % columns,
      y: Math.floor(MAP_TILE_BOUNDS.top) + Math.floor(index / columns),
    };
  }
);

function getMapPosition(latitude: number, longitude: number) {
  const x =
    ((longitudeToTileX(longitude) - MAP_TILE_BOUNDS.left) /
      (MAP_TILE_BOUNDS.right - MAP_TILE_BOUNDS.left)) *
    100;
  const y =
    ((latitudeToTileY(latitude) - MAP_TILE_BOUNDS.top) /
      (MAP_TILE_BOUNDS.bottom - MAP_TILE_BOUNDS.top)) *
    100;
  return {
    left: `${Math.min(95, Math.max(5, x))}%`,
    top: `${Math.min(92, Math.max(8, y))}%`,
  };
}

export default function DarkStoresPage() {
  const router = useRouter();
  const pinCode = useAppStore(s => s.pinCode);
  const customerLocation = useAppStore(s => s.customerLocation);
  const setCustomerLocation = useAppStore(s => s.setCustomerLocation);
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (customerLocation?.source === 'device') setLocationState('ready');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveLocation = customerLocation || getLocationForPinCode(pinCode);
  const stores = useMemo(
    () => getNearbyDarkStores(customerLocation, pinCode),
    [customerLocation, pinCode]
  );
  const selectedStore = stores.find(store => store.id === selectedStoreId) || stores[0];
  const activeStores = stores.filter(store => store.in_service_area);
  const fastestEta = activeStores[0]?.eta_minutes || stores[0]?.eta_minutes || 18;

  // Avoid hydration mismatch: location comes from localStorage, so render a
  // stable placeholder on the server / first client paint, then the real page.
  if (!mounted) {
    return (
      <main className="bg-[#F0F2F2] min-h-screen pb-12">
        <Navbar />
        <section className="bg-gradient-to-br from-[#131A22] via-[#232F3E] to-[#37475A] text-white">
          <div className="max-w-screen-xl mx-auto px-4 py-8">
            <div className="h-4 w-16 rounded bg-white/10" />
            <div className="mt-4 h-9 w-2/3 rounded bg-white/10" />
            <div className="mt-3 h-4 w-1/2 rounded bg-white/10" />
          </div>
        </section>
        <div className="max-w-screen-xl mx-auto px-4 py-7">
          <div className="h-[420px] rounded-2xl border border-[#D5D9D9] bg-white animate-pulse" />
        </div>
      </main>
    );
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setLocationState('denied');
      return;
    }

    setLocationState('locating');
    navigator.geolocation.getCurrentPosition(
      position => {
        setCustomerLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'device',
          label: 'Current location',
        });
        setLocationState('ready');
      },
      () => setLocationState('denied'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }

  function usePinCodeLocation() {
    setCustomerLocation(null);
    setLocationState('idle');
  }

  return (
    <main className="bg-[#F0F2F2] min-h-screen pb-12">
      <Navbar />

      <section className="bg-gradient-to-br from-[#131A22] via-[#232F3E] to-[#37475A] text-white">
        <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
          <button
            onClick={() => router.back()}
            className="text-[13px] font-medium text-white/80 hover:text-[#FFB84D] transition-colors"
          >
            &larr; Back
          </button>

          <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#FF9900]/40 bg-[#FF9900]/10 px-3 py-1 text-[11px] font-bold text-[#FFD814]">
                <Route size={13} />
                Multi-store fulfillment
              </div>
              <h1 className="mt-3 text-[28px] sm:text-[36px] leading-tight font-bold">
                Your nearby Amazon Now network
              </h1>
              <p className="mt-2 text-[14px] sm:text-[15px] leading-6 text-[#D5DBDB]">
                We rank hubs by distance, inventory, traffic, and picking load, then split only the items that arrive faster from another store.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={useDeviceLocation}
                disabled={locationState === 'locating'}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF9900] px-4 py-2.5 text-[13px] font-bold text-[#131A22] hover:bg-[#F3A847] disabled:opacity-60"
              >
                <LocateFixed size={16} />
                {locationState === 'locating' ? 'Finding you...' : 'Use my location'}
              </button>
              {customerLocation && (
                <button
                  onClick={usePinCodeLocation}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-4 py-2.5 text-[13px] font-semibold hover:bg-white/10"
                >
                  Use pincode {pinCode}
                </button>
              )}
            </div>
          </div>

          {locationState === 'denied' && (
            <p className="mt-3 text-[12px] text-[#FFD814]">
              Location was not available. We are using delivery pincode {pinCode}, so the demo still works.
            </p>
          )}
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-4 py-5 sm:py-7">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
          <Metric label="Fastest ETA" value={`${fastestEta} min`} />
          <Metric label="Serviceable hubs" value={`${activeStores.length || stores.length}`} />
          <Metric label="Fulfillment radius" value="8.5 km" />
          <Metric label="Return counters" value={`${stores.filter(store => store.return_center).length}`} />
        </section>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5 items-start">
          <section className="bg-white border border-[#D5D9D9] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-5 py-4 border-b border-[#D5D9D9] flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-bold text-[#0F1111]">Live service map</h2>
                <p className="mt-0.5 text-[12px] text-[#565959]">
                  {customerLocation?.source === 'device'
                    ? `Device location accuracy: about ${Math.round(customerLocation.accuracy || 0)} m`
                    : `Estimated from delivery pincode ${pinCode}`}
                </p>
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${effectiveLocation.latitude}&mlon=${effectiveLocation.longitude}#map=14/${effectiveLocation.latitude}/${effectiveLocation.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-[12px] font-semibold text-[#007185] hover:underline"
              >
                Open map <Navigation size={13} />
              </a>
            </div>

            <div className="relative h-[330px] sm:h-[420px] overflow-hidden bg-[#E9EFE8]">
              <div className="absolute inset-0 overflow-hidden" aria-label="OpenStreetMap showing nearby fulfillment hubs">
                {MAP_TILES.map(tile => (
                  // Map tiles must keep their exact coordinates and bypass image optimization.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${tile.x}-${tile.y}`}
                    src={`https://tile.openstreetmap.org/${MAP_ZOOM}/${tile.x}/${tile.y}.png`}
                    alt=""
                    draggable={false}
                    className="absolute max-w-none select-none"
                    style={{
                      left: `${((tile.x - MAP_TILE_BOUNDS.left) / (MAP_TILE_BOUNDS.right - MAP_TILE_BOUNDS.left)) * 100}%`,
                      top: `${((tile.y - MAP_TILE_BOUNDS.top) / (MAP_TILE_BOUNDS.bottom - MAP_TILE_BOUNDS.top)) * 100}%`,
                      width: `${100 / (MAP_TILE_BOUNDS.right - MAP_TILE_BOUNDS.left)}%`,
                      height: `${100 / (MAP_TILE_BOUNDS.bottom - MAP_TILE_BOUNDS.top)}%`,
                    }}
                  />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[#146EB4]/[0.03]" />

              <div
                style={getMapPosition(effectiveLocation.latitude, effectiveLocation.longitude)}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                aria-label="Your delivery location"
              >
                <span className="absolute inset-0 -m-4 rounded-full bg-[#146EB4]/20 animate-ping" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-[#146EB4] text-white shadow-lg">
                  <LocateFixed size={20} />
                </span>
                <span className="absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap rounded bg-[#131A22] px-2 py-1 text-[10px] font-bold text-white shadow">
                  You are here
                </span>
              </div>

              {stores.map(store => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStoreId(store.id)}
                  style={getMapPosition(store.latitude, store.longitude)}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
                  aria-label={`Select ${store.name}`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white shadow-lg transition-transform group-hover:scale-110 ${
                    selectedStore.id === store.id ? 'bg-[#FF9900] text-[#131A22]' : 'bg-[#232F3E] text-white'
                  }`}>
                    <Warehouse size={18} />
                  </span>
                  <span className="absolute left-1/2 top-11 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[10px] font-bold text-[#0F1111] shadow-md">
                    {store.eta_minutes} min ETA
                  </span>
                </button>
              ))}
              <span className="absolute bottom-1.5 right-2 z-20 rounded bg-white/90 px-1.5 py-0.5 text-[9px] text-[#565959] shadow-sm">
                Map data © OpenStreetMap contributors
              </span>
            </div>

            <div className="p-4 sm:p-5 border-t border-[#D5D9D9]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-[15px] font-bold text-[#0F1111]">{selectedStore.name}</p>
                  <p className="text-[12px] text-[#565959]">{selectedStore.address}</p>
                </div>
                <div className="flex gap-2">
                  <StatusChip icon={MapPin} text={`${selectedStore.distance_km} km`} />
                  <StatusChip icon={Clock} text={`${selectedStore.eta_minutes} min`} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedStore.specialties.map(specialty => (
                  <span key={specialty} className="rounded-full bg-[#F0F2F2] px-2.5 py-1 text-[11px] text-[#565959]">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <section className="bg-white border border-[#D5D9D9] rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <PackageCheck size={19} className="text-[#007600]" />
                <h2 className="text-[17px] font-bold text-[#0F1111]">How sourcing works</h2>
              </div>
              <div className="mt-4 space-y-4">
                <FlowStep number="1" title="Check the closest hub" text="Reserve everyday essentials from the nearest store with stock." />
                <FlowStep number="2" title="Split only when faster" text="A charger or baby item can come from a specialist hub without delaying milk and produce." />
                <FlowStep number="3" title="One customer delivery" text="The app shows one consolidated ETA and tracks every source hub." />
              </div>
            </section>

            <section className="bg-white border border-[#D5D9D9] rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <RotateCcw size={19} className="text-[#007185]" />
                <h2 className="text-[17px] font-bold text-[#0F1111]">Returns and quality</h2>
              </div>
              <div className="mt-3 grid gap-2.5">
                <PolicyRow
                  title="Packaged goods and electronics"
                  text="7-day return or replacement at any return-enabled hub."
                />
                <PolicyRow
                  title="Fresh, dairy, and frozen"
                  text="Not physically returned. Report a quality issue for refund or replacement."
                />
                <PolicyRow
                  title="Wrong or damaged item"
                  text="Photo verification, instant resolution, and source-hub traceability."
                />
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#D5D9D9] bg-white p-3 sm:p-4">
      <p className="text-[11px] text-[#565959]">{label}</p>
      <p className="mt-1 text-[18px] sm:text-[22px] font-bold text-[#0F1111]">{value}</p>
    </div>
  );
}

function StatusChip({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF3E0] px-2.5 py-1 text-[11px] font-bold text-[#8A4B00]">
      <Icon size={12} /> {text}
    </span>
  );
}

function FlowStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#FF9900] text-[12px] font-bold text-[#131A22]">
        {number}
      </span>
      <div>
        <p className="text-[13px] font-bold text-[#0F1111]">{title}</p>
        <p className="mt-0.5 text-[12px] leading-5 text-[#565959]">{text}</p>
      </div>
    </div>
  );
}

function PolicyRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-2.5 rounded-xl bg-[#F7F7F7] p-3">
      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-[#007600]" />
      <div>
        <p className="text-[12px] font-bold text-[#0F1111]">{title}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-[#565959]">{text}</p>
      </div>
    </div>
  );
}
