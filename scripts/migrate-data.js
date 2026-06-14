import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';

// The input paths from the user's Downloads folder
const INPUT_JSON_PATH = "c:/Users/Ashish/Downloads/Syntax_HackonWithAmazon_6.0-main/Syntax_HackonWithAmazon_6.0-main/Amazon products.json";
const INPUT_CSV_PATH = "c:/Users/Ashish/Downloads/Syntax_HackonWithAmazon_6.0-main/Syntax_HackonWithAmazon_6.0-main/zepto_v2.csv";
const OUTPUT_PATH = path.join(process.cwd(), "data", "products.json");

// Helper to generate a random number
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(1);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

const EXTRACTED_PRODUCTS = [];

function generateProductId() {
  return `prod-${Math.random().toString(36).substring(2, 10)}`;
}

async function processCSV() {
  return new Promise((resolve, reject) => {
    let count = 0;
    fs.createReadStream(INPUT_CSV_PATH)
      .pipe(csvParser())
      .on('data', (row) => {
        if (count >= 500) return; // We want about 500 from CSV
        // Mapping zepto columns to our structure
        // assuming typical columns: name, brand, category, price, image_url
        const name = row.name || row.title || row.ProductName;
        const brand = row.brand || row.BrandName || "Generic";
        const category = row.category || row.Category || "snacks"; // default
        const price = parseFloat(row.price || row.mrp || "99");
        const image_url = row.image_url || row.image || "/placeholder-product.png";

        if (name && !isNaN(price)) {
          EXTRACTED_PRODUCTS.push({
            id: generateProductId(),
            name: name,
            brand: brand,
            category: mapCategory(category),
            price: price,
            rating: parseFloat(randomFloat(3.5, 4.9)),
            review_count: randomInt(10, 5000),
            is_bestseller: Math.random() > 0.8,
            serving_size: randomInt(1, 4),
            image_url: image_url,
            occasion_tags: [],
            region_tags: [],
            in_stock: true,
            eta_minutes: randomInt(10, 30),
            expiry_months: randomChoice([null, 3, 6, 12]),
            keywords: name.toLowerCase().split(" ").filter(w => w.length > 3),
            sample_reviews: [
              { author: "Verified Buyer", text: "Great quality for the price." },
              { author: "Amazon Customer", text: "Delivered fast, as expected." }
            ]
          });
          count++;
        }
      })
      .on('end', () => {
        resolve();
      })
      .on('error', reject);
  });
}

function processJSON() {
  try {
    const data = JSON.parse(fs.readFileSync(INPUT_JSON_PATH, 'utf-8'));
    let count = 0;
    // Assuming data is an array
    for (const item of data) {
      if (count >= 500) break; // We want about 500 from JSON
      const name = item.name || item.title || item.ProductName;
      const brand = item.brand || item.BrandName || "Generic";
      const category = item.category || item.Category || "fresh produce";
      // extract numbers from price strings like "₹ 199" or "$19"
      let price = 99;
      if (item.price) {
          const match = String(item.price).match(/[\d.]+/);
          if (match) price = parseFloat(match[0]);
      }
      const image_url = item.image_url || item.image || item.img || "/placeholder-product.png";

      if (name) {
        EXTRACTED_PRODUCTS.push({
          id: generateProductId(),
          name: name,
          brand: brand,
          category: mapCategory(category),
          price: price,
          rating: parseFloat(randomFloat(3.8, 4.9)),
          review_count: randomInt(100, 10000),
          is_bestseller: Math.random() > 0.85,
          serving_size: randomInt(1, 6),
          image_url: image_url,
          occasion_tags: [],
          region_tags: [],
          in_stock: true,
          eta_minutes: randomInt(10, 25),
          expiry_months: randomChoice([null, 1, 6]),
          keywords: name.toLowerCase().split(" ").filter(w => w.length > 3),
          sample_reviews: [
            { author: "Verified Buyer", text: "Very good product." },
            { author: "Amazon Customer", text: "Will buy again." }
          ]
        });
        count++;
      }
    }
  } catch (error) {
    console.error("Error processing JSON:", error);
  }
}

function mapCategory(rawCat) {
    const c = String(rawCat).toLowerCase();
    if (c.includes('snack') || c.includes('biscuit') || c.includes('chip')) return 'snacks';
    if (c.includes('drink') || c.includes('beverage') || c.includes('juice') || c.includes('tea')) return 'beverages';
    if (c.includes('veg') || c.includes('fruit') || c.includes('fresh')) return 'fresh produce';
    if (c.includes('milk') || c.includes('dairy') || c.includes('egg') || c.includes('cheese')) return 'dairy';
    if (c.includes('clean') || c.includes('wash') || c.includes('detergent')) return 'cleaning supplies';
    return 'pantry staples';
}

async function run() {
  console.log("Processing CSV...");
  await processCSV();
  console.log("Processing JSON...");
  processJSON();
  
  console.log(`Total products extracted: ${EXTRACTED_PRODUCTS.length}`);
  
  // ensure the data directory exists
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(EXTRACTED_PRODUCTS, null, 2), 'utf-8');
  console.log(`Data saved to ${OUTPUT_PATH}`);
}

run();
