// Retry just the 3 failed tests with delays between them
const BASE = "http://localhost:3000";
const PROFILE = { pinCode: "110001", servingCount: 2, dietary: "No restriction", budget: null };

async function testCart(mode, intentText, label) {
  console.log(`\n=== ${label} ===`);
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}/api/generate-cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intentText, householdProfile: PROFILE, mode }),
    });
    const ms = Date.now() - start;
    if (!res.ok) {
      const err = await res.json();
      console.log(`  FAIL ❌ - ${res.status}: ${err.error} (${ms}ms)`);
      return false;
    }
    const data = await res.json();
    const products = data.cart || [];
    const suggestions = products.filter(p => p.is_suggestion);
    const main = products.filter(p => !p.is_suggestion);
    const subtotal = main.reduce((s, i) => s + (i.price * i.quantity), 0);
    console.log(`  Status: ${res.status} | Time: ${ms}ms`);
    console.log(`  Main items (${main.length}): ${main.map(i => `${i.name} x${i.quantity}`).join(", ")}`);
    if (suggestions.length > 0) console.log(`  Suggestions (${suggestions.length}): ${suggestions.map(i => i.name).join(", ")}`);
    console.log(`  Subtotal: Rs.${subtotal.toFixed(0)} | Dark store: ${main.some(i=>i.dark_store) ? "YES":"NO"} | Return policy: ${main.some(i=>i.return_policy) ? "YES":"NO"}`);
    console.log(`  PASS ✅`);
    return true;
  } catch (e) {
    console.log(`  FAIL ❌ - ${e.message}`);
    return false;
  }
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log("=== RETRY: Failed Tests (with 5s spacing) ===");
  
  const r1 = await testCart("cooking", "Aglio olio for 3 people", "TEST 3: Cooking - Aglio Olio");
  await delay(5000);
  
  const r2 = await testCart("predictive", "New baby at home", "TEST 4: Predictive - New Baby");
  await delay(5000);
  
  const r3 = await testCart("addon", "Spaghetti", "TEST 5: Frictionless - Spaghetti");
  
  console.log(`\n=== RETRY RESULT: ${[r1,r2,r3].filter(Boolean).length}/3 passed ===`);
}

main().catch(console.error);
