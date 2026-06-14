// Integration test script - run with: node tests/integration-test.mjs
const BASE = "http://localhost:3000";
const PROFILE = { pinCode: "110001", servingCount: 2, dietary: "No restriction", budget: null };

async function testReplenishables() {
  console.log("\n=== TEST 1: Replenishables API ===");
  const start = Date.now();
  const res = await fetch(`${BASE}/api/replenishables`);
  const data = await res.json();
  const ms = Date.now() - start;
  const count = data.replenishables?.length || 0;
  console.log(`  Status: ${res.status} | Items: ${count} | Time: ${ms}ms`);
  console.log(`  Items: ${data.replenishables?.map(r => r.name).join(", ")}`);
  console.log(`  RESULT: ${res.status === 200 && count >= 6 ? "PASS ✅" : "FAIL ❌"}`);
  return res.status === 200 && count >= 6;
}

async function testGenerateCart(mode, intentText, label, checks) {
  console.log(`\n=== TEST: ${label} ===`);
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
      console.log(`  Status: ${res.status} | Error: ${err.error} | Time: ${ms}ms`);
      console.log(`  RESULT: FAIL ❌`);
      return false;
    }
    const data = await res.json();
    const cartCount = data.cart?.length || 0;
    const subtotal = data.cart?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0;
    const hasDarkStore = data.cart?.some(i => i.dark_store);
    const hasReturnPolicy = data.cart?.some(i => i.return_policy);
    console.log(`  Status: ${res.status} | Cart items: ${cartCount} | Time: ${ms}ms`);
    console.log(`  Occasion: ${data.occasionTitle}`);
    console.log(`  Products: ${data.cart?.map(i => `${i.name} (x${i.quantity})`).join(", ")}`);
    console.log(`  Subtotal: Rs.${subtotal.toFixed(0)}`);
    console.log(`  Dark store on items: ${hasDarkStore ? "YES" : "NO"} | Return policy: ${hasReturnPolicy ? "YES" : "NO"}`);
    console.log(`  Response time: ${ms < 4000 ? "FAST ✅" : ms < 8000 ? "OK ⚠️" : "SLOW ❌"} (${ms}ms)`);
    
    let pass = res.status === 200 && cartCount >= 3;
    if (checks) pass = pass && checks(data);
    console.log(`  RESULT: ${pass ? "PASS ✅" : "FAIL ❌"}`);
    return pass;
  } catch (e) {
    console.log(`  Error: ${e.message}`);
    console.log(`  RESULT: FAIL ❌`);
    return false;
  }
}

async function runAll() {
  console.log("========================================");
  console.log("IntentCart Integration Tests");
  console.log("========================================");
  
  const results = [];

  // Test 1: Replenishables
  results.push(await testReplenishables());

  // Test 2: Shopping by Intent - Movie night
  results.push(await testGenerateCart("intent", "Movie night for 5 people tonight", "TEST 2: Intent - Movie Night for 5", (data) => {
    return data.cart.length >= 4 && data.cart.length <= 10;
  }));

  // Test 3: Cooking Mode - Aglio olio
  results.push(await testGenerateCart("cooking", "Aglio olio for 3 people", "TEST 3: Cooking - Aglio Olio for 3", (data) => {
    const names = data.cart.map(i => i.name.toLowerCase()).join(" ");
    return names.includes("spaghet") || names.includes("pasta") || names.includes("olive");
  }));

  // Test 4: Predictive Mode - New baby
  results.push(await testGenerateCart("predictive", "New baby at home", "TEST 4: Predictive - New Baby", (data) => {
    return data.cart.length >= 4;
  }));

  // Test 5: Frictionless - Spaghetti
  results.push(await testGenerateCart("addon", "Spaghetti", "TEST 5: Frictionless - Spaghetti", (data) => {
    const hasSuggestions = data.cart.some(i => i.is_suggestion);
    return data.cart.length >= 2;
  }));

  // Summary
  const passed = results.filter(Boolean).length;
  const total = results.length;
  console.log("\n========================================");
  console.log(`FINAL: ${passed}/${total} tests passed ${passed === total ? "✅ ALL CLEAR" : "⚠️ SOME FAILED"}`);
  console.log("========================================");
}

runAll().catch(console.error);
