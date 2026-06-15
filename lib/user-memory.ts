// lib/user-memory.ts - Persistent user memory for personalized cart curation
// Tracks: removed items, preferred brands, past occasions, disliked products

export interface UserMemory {
  removedItems: string[];          // Product names the user has removed from carts
  preferredBrands: string[];       // Brands the user frequently keeps in cart
  pastOccasions: string[];         // Recent occasion types
  dislikedCategories: string[];    // Categories user tends to remove
  lastUpdated: string;
}

const MEMORY_KEY = "intentcart_user_memory";
const MAX_ITEMS = 30; // Keep last 30 entries per category

function getMemory(): UserMemory {
  if (typeof window === "undefined") {
    return { removedItems: [], preferredBrands: [], pastOccasions: [], dislikedCategories: [], lastUpdated: "" };
  }
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { removedItems: [], preferredBrands: [], pastOccasions: [], dislikedCategories: [], lastUpdated: "" };
}

function saveMemory(memory: UserMemory) {
  if (typeof window === "undefined") return;
  memory.lastUpdated = new Date().toISOString();
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch {}
}

/** Record that a user removed a product from their cart */
export function recordRemovedItem(productName: string, category?: string) {
  const memory = getMemory();
  memory.removedItems = [productName, ...memory.removedItems.filter(n => n !== productName)].slice(0, MAX_ITEMS);
  if (category) {
    const catCount = memory.dislikedCategories.filter(c => c === category).length;
    // Only mark as disliked if removed 3+ times from same category
    if (catCount >= 2 && !memory.dislikedCategories.includes(category)) {
      memory.dislikedCategories.push(category);
    }
    memory.dislikedCategories = [...memory.dislikedCategories, category].slice(0, MAX_ITEMS);
  }
  saveMemory(memory);
}

/** Record that a user kept/purchased a brand */
export function recordPreferredBrand(brand: string) {
  const memory = getMemory();
  memory.preferredBrands = [brand, ...memory.preferredBrands.filter(b => b !== brand)].slice(0, MAX_ITEMS);
  saveMemory(memory);
}

/** Record a past occasion */
export function recordOccasion(occasion: string) {
  const memory = getMemory();
  memory.pastOccasions = [occasion, ...memory.pastOccasions.filter(o => o !== occasion)].slice(0, 10);
  saveMemory(memory);
}

/** Get memory context as a string for AI prompt injection */
export function getMemoryContext(): string {
  const memory = getMemory();
  const parts: string[] = [];

  if (memory.removedItems.length > 0) {
    parts.push(`Previously removed items (AVOID these): ${memory.removedItems.slice(0, 10).join(", ")}`);
  }
  if (memory.preferredBrands.length > 0) {
    parts.push(`Preferred brands (FAVOR these): ${memory.preferredBrands.slice(0, 10).join(", ")}`);
  }
  if (memory.dislikedCategories.length > 0) {
    const uniqueCats = [...new Set(memory.dislikedCategories)];
    parts.push(`User tends to remove items from these categories: ${uniqueCats.slice(0, 5).join(", ")}`);
  }
  if (memory.pastOccasions.length > 0) {
    parts.push(`Recent shopping occasions: ${memory.pastOccasions.slice(0, 5).join(", ")}`);
  }

  return parts.length > 0
    ? `\n\nUSER PREFERENCE MEMORY (personalize based on this):\n${parts.join("\n")}`
    : "";
}

/** Get the raw memory object (for UI display) */
export function getUserMemory(): UserMemory {
  return getMemory();
}

/** Clear all memory */
export function clearUserMemory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MEMORY_KEY);
}
