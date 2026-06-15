// app/darkstores/page.tsx - Location-aware fulfillment network
'use client';

import { useMemo, useState } from 'react';
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

export default function DarkStoresPage() {
  const router = useRouter();
  const pinCode = useAppStore(s => s.pinCode);
  const customerLocation = useAppStore(s => s.customerLocation);
  const setCustomerLocation = useAppStore(s => s.setCustomerLocation);
  const [locationState, setLocationState] = useState<LocationState>(
    customerLocation?.source === 'device' ? 'ready' : 'idle'
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const effectiveLocation = customerLocation || getLocationForPinCode(pinCode);
  const stores = useMemo(
    () => getNearbyDarkStores(customerLocation, pinCode),
    [customerLocation, pinCode]
  );
  const selectedStore = stores.find(store => store.id === selectedStoreId) || stores[0];
  const activeStores = stores.filter(store => store.in_service_area);
  const fastestEta = activeStores[0]?.eta_minutes || stores[0]?.eta_minutes || 18;

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

            <div className="relative h-[330px] sm:h-[420px] overflow-hidden bg-[#E9EFE8] dark-store-map">
              <div className="map-road map-road-one" />
              <div className="map-road map-road-two" />
              <div className="map-road map-road-three" />
              <div className="map-road map-road-four" />
              <span className="map-label left-[7%] top-[14%]">RS Puram</span>
              <span className="map-label left-[50%] top-[9%]">Gandhipuram</span>
              <span className="map-label right-[8%] top-[28%]">Peelamedu</span>
              <span className="map-label right-[12%] bottom-[12%]">Singanallur</span>

              <div
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 left-[46%] top-[54%]"
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

              {stores.map((store, index) => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStoreId(store.id)}
                  style={{ left: `${store.map_x}%`, top: `${store.map_y}%` }}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
                  aria-label={`Select ${store.name}`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white shadow-lg transition-transform group-hover:scale-110 ${
                    selectedStore.id === store.id ? 'bg-[#FF9900] text-[#131A22]' : 'bg-[#232F3E] text-white'
                  }`}>
                    <Warehouse size={18} />
                  </span>
                  <span className="absolute left-1/2 top-11 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[10px] font-bold text-[#0F1111] shadow-md">
                    {index + 1}. {store.eta_minutes} min
                  </span>
                </button>
              ))}
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

            <section className="rounded-2xl bg-[#232F3E] p-4 sm:p-5 text-white shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FFB84D]">SDM-ready architecture</p>
              <p className="mt-2 text-[15px] font-bold">Distance + inventory + capacity + returns</p>
              <p className="mt-1 text-[12px] leading-5 text-[#D5DBDB]">
                This prototype now demonstrates the decision layer behind quick commerce, not only a list of nearby stores.
              </p>
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
