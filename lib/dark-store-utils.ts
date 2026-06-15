import darkStores from "../data/dark-stores.json";
import type { CartProduct, CustomerLocation, ProductCategory } from "./types";

export type DarkStoreId = keyof typeof darkStores;

export interface DarkStoreInfo {
  name: string;
  zone: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  base_eta_minutes: number;
  service_radius_km: number;
  capacity_percent: number;
  categories: string[];
  specialties: string[];
  return_center: boolean;
  map_x: number;
  map_y: number;
}

export interface NearbyDarkStore extends DarkStoreInfo {
  id: DarkStoreId;
  distance_km: number;
  eta_minutes: number;
  in_service_area: boolean;
}

const STORE_ENTRIES = Object.entries(darkStores) as [DarkStoreId, DarkStoreInfo][];
const DEFAULT_LOCATION = { latitude: 11.0122, longitude: 76.9568 };

const PIN_LOCATIONS: Record<string, { latitude: number; longitude: number }> = {
  "641001": { latitude: 11.0018, longitude: 76.9629 },
  "641002": { latitude: 11.0087, longitude: 76.9558 },
  "641006": { latitude: 11.0268, longitude: 76.9661 },
  "641012": { latitude: 11.0183, longitude: 76.9674 },
  "641014": { latitude: 11.0301, longitude: 77.0391 },
  "641015": { latitude: 10.9985, longitude: 77.0296 },
  "641018": { latitude: 11.0127, longitude: 76.9747 }
};

export function getDarkStoreInfo(storeId: string): DarkStoreInfo | null {
  return (darkStores as Record<string, DarkStoreInfo>)[storeId] || null;
}

export function getLocationForPinCode(pinCode?: string): CustomerLocation {
  const point = (pinCode && PIN_LOCATIONS[pinCode]) || DEFAULT_LOCATION;
  return {
    ...point,
    accuracy: 1200,
    source: "pincode",
    label: pinCode ? `Pincode ${pinCode}` : "Coimbatore"
  };
}

export function haversineDistanceKm(
  from: Pick<CustomerLocation, "latitude" | "longitude">,
  to: Pick<CustomerLocation, "latitude" | "longitude">
): number {
  const earthRadiusKm = 6371;
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const deltaLat = radians(to.latitude - from.latitude);
  const deltaLng = radians(to.longitude - from.longitude);
  const lat1 = radians(from.latitude);
  const lat2 = radians(to.latitude);
  const value =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function getNearbyDarkStores(
  customerLocation?: CustomerLocation | null,
  pinCode?: string
): NearbyDarkStore[] {
  const location = customerLocation || getLocationForPinCode(pinCode);

  return STORE_ENTRIES
    .map(([id, store]) => {
      const distance = haversineDistanceKm(location, store);
      const trafficMinutes = Math.max(0, Math.round(distance * 1.7));
      const loadMinutes = store.capacity_percent >= 75 ? 3 : store.capacity_percent >= 60 ? 1 : 0;
      const eta = Math.max(store.base_eta_minutes, 8 + trafficMinutes + loadMinutes);

      return {
        ...store,
        id,
        distance_km: Number(distance.toFixed(1)),
        eta_minutes: eta,
        in_service_area: distance <= store.service_radius_km
      };
    })
    .sort((a, b) => a.distance_km - b.distance_km);
}

function productInventoryCategory(product: CartProduct): string {
  const text = `${product.name} ${product.brand} ${(product.keywords || []).join(" ")}`.toLowerCase();
  if (/\b(charger|charging|cable|adapter|power bank|earphone|electronics)\b/.test(text)) {
    return "electronics";
  }
  return product.category;
}

function supportsCategory(store: NearbyDarkStore, category: ProductCategory | string): boolean {
  return store.categories.includes(category);
}

export function sourceCartFromNearbyStores(
  cart: CartProduct[],
  customerLocation?: CustomerLocation | null,
  pinCode?: string
): CartProduct[] {
  const stores = getNearbyDarkStores(customerLocation, pinCode);
  const allocations = new Map<DarkStoreId, number>();

  return cart.map((product) => {
    const category = productInventoryCategory(product);
    const eligible = stores.filter((store) => supportsCategory(store, category));
    const candidates = eligible.length ? eligible : stores;
    const selected = [...candidates].sort((a, b) => {
      const aLoad = allocations.get(a.id) || 0;
      const bLoad = allocations.get(b.id) || 0;
      return (a.distance_km + aLoad * 0.55) - (b.distance_km + bLoad * 0.55);
    })[0];

    allocations.set(selected.id, (allocations.get(selected.id) || 0) + 1);
    return {
      ...product,
      dark_store: selected.id,
      eta_minutes: selected.eta_minutes
    };
  });
}

export function groupCartByDarkStore(cart: CartProduct[]): Record<string, CartProduct[]> {
  const groups: Record<string, CartProduct[]> = {};
  for (const item of cart) {
    const storeId = item.dark_store || "DS-Central";
    if (!groups[storeId]) groups[storeId] = [];
    groups[storeId].push(item);
  }
  return groups;
}

export function getConsolidatedEta(cart: CartProduct[]): number {
  if (!cart.length) return 0;
  return Math.max(...cart.map((item) => item.eta_minutes || 18));
}
