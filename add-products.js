const fs = require('fs');

const path = './data/products.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const newProducts = [
  {
    "id": "brkf-001",
    "name": "iD Fresh Idli & Dosa Batter 1kg",
    "brand": "iD",
    "category": "fresh produce",
    "price": 95,
    "rating": 4.6,
    "review_count": 12400,
    "is_bestseller": true,
    "serving_size": 4,
    "image_url": "/placeholder-product.png",
    "occasion_tags": ["breakfast", "cooking", "dinner", "dosa", "idli"],
    "region_tags": ["Bangalore", "Chennai", "Hyderabad", "Mumbai", "Delhi"],
    "in_stock": true,
    "eta_minutes": 15,
    "expiry_months": 1,
    "keywords": ["batter", "dosa batter", "idli batter", "south indian", "breakfast"],
    "sample_reviews": [
      { "author": "Anitha S.", "text": "Perfectly fermented, makes crispy dosas!" },
      { "author": "Raj K.", "text": "Super convenient for busy mornings." }
    ]
  },
  {
    "id": "brkf-002",
    "name": "Fresh Grated Coconut 200g",
    "brand": "Local Farm",
    "category": "fresh produce",
    "price": 45,
    "rating": 4.3,
    "review_count": 3400,
    "is_bestseller": false,
    "serving_size": 4,
    "image_url": "/placeholder-product.png",
    "occasion_tags": ["cooking", "chutney", "breakfast"],
    "region_tags": ["Bangalore", "Chennai", "Hyderabad", "Mumbai", "Delhi"],
    "in_stock": true,
    "eta_minutes": 15,
    "expiry_months": null,
    "keywords": ["coconut", "grated coconut", "chutney", "nariyal"],
    "sample_reviews": [
      { "author": "Lakshmi R.", "text": "Fresh and sweet, perfect for chutney." },
      { "author": "Priya V.", "text": "Saves so much time scraping coconut." }
    ]
  },
  {
    "id": "brkf-003",
    "name": "MTR Sambar Powder 200g",
    "brand": "MTR",
    "category": "pantry staples",
    "price": 75,
    "rating": 4.8,
    "review_count": 15000,
    "is_bestseller": true,
    "serving_size": 20,
    "image_url": "/placeholder-product.png",
    "occasion_tags": ["cooking", "lunch", "dinner", "breakfast"],
    "region_tags": ["Bangalore", "Chennai", "Hyderabad", "Mumbai", "Delhi"],
    "in_stock": true,
    "eta_minutes": 15,
    "expiry_months": 12,
    "keywords": ["sambar", "powder", "masala", "mtr", "south indian"],
    "sample_reviews": [
      { "author": "Swati M.", "text": "Authentic taste." },
      { "author": "Karthik P.", "text": "Best sambar powder in the market." }
    ]
  }
];

data.unshift(...newProducts); // Put them at the top
fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Products added successfully!');
