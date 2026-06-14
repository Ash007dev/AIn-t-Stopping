/**
 * Pipeline Test Runner — IntentCart
 * Runs all 5 scenarios + modifications 3 times each, logs structured results.
 */

const BASE = "http://localhost:3000";
const RUNS = 3;

const DEFAULT_PROFILE = {
  pinCode: "560001",
  servingCount: 2,
  budget: 0,
  dietary: "No restriction",
};

const SCENARIOS = [
  {
    id: "S1",
    label: "Movie night for 5 people tonight",
    body: {
      intentText: "Movie night for 5 people tonight",
      householdProfile: DEFAULT_PROFILE,
      mode: "intent",
    },
  },
  {
    id: "S2",
    label: "Breakfast for 8 guests tomorrow morning",
    body: {
      intentText: "Breakfast for 8 guests tomorrow morning",
      householdProfile: DEFAULT_PROFILE,
      mode: "intent",
    },
  },
  {
    id: "S3",
    label: "Aglio olio for 3 people (cooking mode)",
    body: {
      intentText: "Aglio olio for 3 people",
      householdProfile: DEFAULT_PROFILE,
      mode: "cooking",
    },
  },
  {
    id: "S4",
    label: "Diwali party for 20 people",
    body: {
      intentText: "Diwali party for 20 people",
      householdProfile: DEFAULT_PROFILE,
      mode: "intent",
    },
  },
  {
    id: "S5",
    label: 'Add spaghetti (frictionless/addon) + check suggested add-ons',
    body: {
      intentText: "spaghetti",
      householdProfile: DEFAULT_PROFILE,
      mode: "addon",
    },
  },
];

const MODIFICATIONS = [
  {
    id: "M1",
    label: "Make it vegetarian",
    text: "Make it vegetarian",
    targetScenario: "S1",
  },
  {
    id: "M2",
    label: "Switch Pepsi to Sprite",
    text: "Switch Pepsi to Sprite",
    targetScenario: "S1",
  },
  {
    id: "M3",
    label: "8 people not 5",
    text: "8 people not 5",
    targetScenario: "S2",
  },
];

async function callGenerateCart(body) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}/api/generate-cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const latency = Date.now() - start;
    const json = await res.json();
    return { ok: res.ok, status: res.status, latency, data: json, error: null };
  } catch (e) {
    return { ok: false, status: 0, latency: Date.now() - start, data: null, error: e.message };
  }
}

async function callModify(modificationText, currentCart) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}/api/modify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modificationText, currentCart }),
    });
    const latency = Date.now() - start;
    const json = await res.json();
    return { ok: res.ok, status: res.status, latency, data: json, error: null };
  } catch (e) {
    return { ok: false, status: 0, latency: Date.now() - start, data: null, error: e.message };
  }
}

function analyzeCart(cart, scenarioLabel, personCount) {
  const issues = [];

  // Check for dynamic (fallback) products
  const dynamicItems = cart.filter((p) => p.id && p.id.startsWith("dynamic-"));
  if (dynamicItems.length > 0) {
    issues.push({
      type: "FUSE_MISS",
      severity: "c",
      detail: `${dynamicItems.length}/${cart.length} items are dynamic fallbacks: [${dynamicItems.map((p) => p.name).join(", ")}]`,
    });
  }

  // Check quantity sanity
  for (const item of cart) {
    if (item.quantity <= 0) {
      issues.push({ type: "BAD_QUANTITY", severity: "b", detail: `${item.name} has qty ${item.quantity}` });
    }
    // For per-person drinks: qty should roughly equal person_count
    const isPerPersonDrink = item.name.toLowerCase().match(/pepsi|sprite|cola|juice|water|soda|drink/);
    if (isPerPersonDrink && personCount && item.quantity > personCount * 2) {
      issues.push({ type: "OVERQUANTITY", severity: "b", detail: `${item.name} qty=${item.quantity} for ${personCount} people (suspiciously high)` });
    }
    if (isPerPersonDrink && personCount && item.quantity < Math.ceil(personCount / 3)) {
      issues.push({ type: "UNDERQUANTITY", severity: "b", detail: `${item.name} qty=${item.quantity} for ${personCount} people (possibly too low)` });
    }
  }

  // Check for placeholder image
  const placeholders = cart.filter((p) => p.image_url === "/placeholder-product.png");
  if (placeholders.length > 0) {
    issues.push({
      type: "PLACEHOLDER_IMAGE",
      severity: "d",
      detail: `${placeholders.length} items use placeholder image`,
    });
  }

  // Check for budget trim essentials (cooking mode: spaghetti)
  const scenarioLower = scenarioLabel.toLowerCase();
  if (scenarioLower.includes("aglio") || scenarioLower.includes("spaghetti")) {
    const hasSpaghetti = cart.some(
      (p) => p.name.toLowerCase().includes("spaghetti") || p.name.toLowerCase().includes("pasta")
    );
    if (!hasSpaghetti) {
      issues.push({
        type: "ESSENTIAL_TRIMMED",
        severity: "b",
        detail: `Spaghetti/pasta not found in aglio olio cart — possibly budget-trimmed`,
      });
    }
  }

  return { dynamicCount: dynamicItems.length, issues };
}

function analyzeModification(diff, modText, cart) {
  const issues = [];

  if (diff.error) {
    issues.push({ type: "MOD_ERROR", severity: "a", detail: `Modification returned error: ${diff.error}` });
  }

  if (modText.toLowerCase().includes("vegetarian")) {
    const nonVegKeywords = ["chicken", "fish", "egg", "meat", "prawn", "mutton"];
    const removedIds = diff.remove || [];
    const keptNonVeg = cart.filter(
      (p) =>
        !removedIds.includes(p.id) &&
        nonVegKeywords.some((k) => p.name.toLowerCase().includes(k))
    );
    if (keptNonVeg.length > 0) {
      issues.push({
        type: "INCOMPLETE_VEG_FILTER",
        severity: "b",
        detail: `Make vegetarian missed: [${keptNonVeg.map((p) => p.name).join(", ")}]`,
      });
    }
  }

  if (modText.toLowerCase().includes("pepsi") && modText.toLowerCase().includes("sprite")) {
    const pepsiInCart = cart.find((p) => p.name.toLowerCase().includes("pepsi"));
    if (!pepsiInCart) {
      issues.push({
        type: "SWITCH_NO_SOURCE",
        severity: "b",
        detail: `"Switch Pepsi to Sprite": Pepsi not found in cart — mod may have silently failed or operated on wrong item`,
      });
    }
    const addedSprite = (diff.add || []).some(
      (p) => p.name && p.name.toLowerCase().includes("sprite")
    );
    if (!addedSprite && !((diff.add || []).length > 0)) {
      issues.push({
        type: "SWITCH_NO_SPRITE",
        severity: "b",
        detail: `"Switch Pepsi to Sprite": No Sprite added in diff.add`,
      });
    }
    const spriteInCatalog = false; // We know from analysis Sprite is not in catalog
    if (!spriteInCatalog) {
      issues.push({
        type: "FUSE_MISS_SPRITE",
        severity: "c",
        detail: `Sprite is not in catalog — will be created as dynamic product or fail to swap`,
      });
    }
  }

  return issues;
}

// ---- MAIN ----

const results = {};

console.log("=".repeat(70));
console.log("  IntentCart Pipeline Test Runner");
console.log("  " + new Date().toISOString());
console.log("=".repeat(70) + "\n");

// Store one cart from each scenario for modification tests
const scenarioCarts = {};

for (const scenario of SCENARIOS) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`SCENARIO ${scenario.id}: ${scenario.label}`);
  console.log(`${"─".repeat(60)}`);

  const runResults = [];

  for (let run = 1; run <= RUNS; run++) {
    process.stdout.write(`  Run ${run}/${RUNS} ... `);
    const result = await callGenerateCart(scenario.body);
    const personCount = scenario.body.householdProfile.servingCount;

    const runData = {
      run,
      ok: result.ok,
      status: result.status,
      latency: result.latency,
      error: result.error,
      cart: null,
      cartSize: 0,
      subtotal: null,
      parsedPersonCount: null,
      parsedMode: null,
      parsedOccasion: null,
      dynamicCount: 0,
      issues: [],
      rawError: null,
    };

    if (result.ok && result.data && result.data.cart) {
      const cart = result.data.cart;
      runData.cart = cart;
      runData.cartSize = cart.length;
      runData.subtotal = result.data.subtotal;
      runData.parsedPersonCount = result.data.parsedIntent?.person_count;
      runData.parsedMode = result.data.parsedIntent?.mode_override || scenario.body.mode;
      runData.parsedOccasion = result.data.parsedIntent?.occasion;

      const analysis = analyzeCart(cart, scenario.label, result.data.parsedIntent?.person_count || personCount);
      runData.dynamicCount = analysis.dynamicCount;
      runData.issues = analysis.issues;

      // Save first run cart for later modification tests
      if (run === 1) scenarioCarts[scenario.id] = cart;

      console.log(
        `✓ ${cart.length} items, ₹${result.data.subtotal?.toFixed(0)}, ${runData.dynamicCount} dynamic, ${result.latency}ms`
      );
    } else if (result.data?.clarifying_question) {
      runData.rawError = `CLARIFYING_QUESTION: ${result.data.clarifying_question}`;
      console.log(`⚠ Clarifying Q: ${result.data.clarifying_question}`);
    } else {
      runData.rawError = result.data?.error || result.error || `HTTP ${result.status}`;
      console.log(`✗ FAILED: ${runData.rawError}`);
      runData.issues.push({
        type: "HARD_FAILURE",
        severity: "a",
        detail: runData.rawError,
      });
    }

    runResults.push(runData);
    // Small delay between runs to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1500));
  }

  results[scenario.id] = { scenario, runs: runResults };

  // Print per-run summary
  if (runResults.some(r => r.cart)) {
    const cartSizes = runResults.filter(r => r.cart).map(r => r.cartSize);
    const dynamicCounts = runResults.filter(r => r.cart).map(r => r.dynamicCount);
    const subtotals = runResults.filter(r => r.subtotal).map(r => r.subtotal);

    console.log(`\n  SUMMARY:`);
    console.log(`    Cart sizes:       [${cartSizes.join(", ")}]  (variance: ${Math.max(...cartSizes) - Math.min(...cartSizes)})`);
    console.log(`    Dynamic (fuse miss): [${dynamicCounts.join(", ")}]`);
    console.log(`    Subtotals (₹):    [${subtotals.map(x => x.toFixed(0)).join(", ")}]`);

    // Print all carts from run 1 with items
    const run1 = runResults[0];
    if (run1.cart) {
      console.log(`\n  CART (Run 1):`);
      run1.cart.forEach((p, i) => {
        const tag = p.id?.startsWith("dynamic-") ? " [DYNAMIC]" : " [CATALOG]";
        console.log(`    ${i + 1}. ${p.name} x${p.quantity} @ ₹${p.price}${tag}  [${p.dark_store || "?"}] [${p.return_policy || "?"}] ${p.is_suggestion ? "[SUGGESTION]" : ""}`);
      });
    }

    // Print all issues found across runs
    const allIssues = runResults.flatMap(r => r.issues);
    if (allIssues.length > 0) {
      console.log(`\n  ISSUES:`);
      allIssues.forEach(issue => {
        const runIdx = runResults.findIndex(r => r.issues.includes(issue)) + 1;
        console.log(`    [Run ${runIdx}] [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.detail}`);
      });
    }

    // Check for non-determinism
    if (new Set(cartSizes).size > 1) {
      console.log(`\n  ⚠️  NON-DETERMINISM: Cart sizes differ across runs`);
    }
  }
}

// ---- MODIFICATION TESTS ----

console.log(`\n\n${"=".repeat(70)}`);
console.log(`MODIFICATION TESTS`);
console.log(`${"=".repeat(70)}`);

const modResults = {};

for (const mod of MODIFICATIONS) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`MOD ${mod.id}: "${mod.label}" (on ${mod.targetScenario} cart)`);
  console.log(`${"─".repeat(60)}`);

  const sourceCart = scenarioCarts[mod.targetScenario];
  if (!sourceCart || sourceCart.length === 0) {
    console.log(`  ✗ SKIPPED: No cart available from scenario ${mod.targetScenario}`);
    modResults[mod.id] = { skipped: true, reason: "No cart" };
    continue;
  }

  console.log(`  Source cart: ${sourceCart.length} items — [${sourceCart.map(p => p.name).join(", ")}]`);

  const modRunResults = [];

  for (let run = 1; run <= RUNS; run++) {
    process.stdout.write(`  Run ${run}/${RUNS} ... `);
    const result = await callModify(mod.text, sourceCart);

    const runData = {
      run,
      ok: result.ok,
      latency: result.latency,
      diff: result.data,
      issues: [],
    };

    if (result.ok && result.data) {
      const issues = analyzeModification(result.data, mod.text, sourceCart);
      runData.issues = issues;

      console.log(
        `✓ add=${result.data.add?.length || 0}, remove=${result.data.remove?.length || 0}, modify=${result.data.modify?.length || 0}, err=${result.data.error || "null"}, ${result.latency}ms`
      );

      if (run === 1) {
        if (result.data.add?.length) {
          console.log(`    ADD:    [${result.data.add.map(p => p.name + " x" + p.quantity).join(", ")}]`);
        }
        if (result.data.remove?.length) {
          const removedNames = result.data.remove.map(id => {
            const p = sourceCart.find(c => c.id === id);
            return p ? p.name : `(unknown id: ${id})`;
          });
          console.log(`    REMOVE: [${removedNames.join(", ")}]`);
        }
        if (result.data.modify?.length) {
          const modNames = result.data.modify.map(m => {
            const p = sourceCart.find(c => c.id === m.id);
            return (p ? p.name : m.id) + ` qty→${m.quantity}`;
          });
          console.log(`    MODIFY: [${modNames.join(", ")}]`);
        }
      }
    } else {
      runData.issues.push({ type: "HARD_FAILURE", severity: "a", detail: result.error || `HTTP ${result.status}` });
      console.log(`✗ FAILED: ${result.error}`);
    }

    modRunResults.push(runData);
    await new Promise((r) => setTimeout(r, 1500));
  }

  modResults[mod.id] = { mod, runs: modRunResults };

  const allIssues = modRunResults.flatMap(r => r.issues);
  if (allIssues.length > 0) {
    console.log(`\n  ISSUES:`);
    allIssues.forEach(issue => {
      const runIdx = modRunResults.findIndex(r => r.issues.includes(issue)) + 1;
      console.log(`    [Run ${runIdx}] [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.detail}`);
    });
  }
}

// ---- FINAL BUG SUMMARY ----

console.log(`\n\n${"=".repeat(70)}`);
console.log(`FINAL BUG RANKING SUMMARY`);
console.log(`${"=".repeat(70)}\n`);

const allIssues = [];

// Collect from scenarios
for (const [sid, data] of Object.entries(results)) {
  for (const run of data.runs) {
    for (const issue of run.issues) {
      allIssues.push({ source: `${sid} Run${run.run}`, ...issue });
    }
  }
}

// Collect from mods
for (const [mid, data] of Object.entries(modResults)) {
  if (data.skipped) continue;
  for (const run of data.runs) {
    for (const issue of run.issues) {
      allIssues.push({ source: `${mid} Run${run.run}`, ...issue });
    }
  }
}

const severityOrder = ["a", "b", "c", "d"];
const severityLabels = {
  a: "(a) HARD FAILURES / CRASHES",
  b: "(b) WRONG QUANTITIES / MISSING ESSENTIAL ITEMS",
  c: "(c) FUZZY-MATCH MISSES (Dynamic fallbacks)",
  d: "(d) COSMETIC / MINOR ISSUES",
};

for (const sev of severityOrder) {
  const issues = allIssues.filter(i => i.severity === sev);
  if (issues.length === 0) continue;
  console.log(`\n${severityLabels[sev]}`);
  console.log("─".repeat(60));
  issues.forEach(issue => {
    console.log(`  [${issue.source}] ${issue.type}: ${issue.detail}`);
  });
}

console.log(`\n${"=".repeat(70)}`);
console.log(`Test run complete — ${new Date().toISOString()}`);
console.log(`${"=".repeat(70)}\n`);
