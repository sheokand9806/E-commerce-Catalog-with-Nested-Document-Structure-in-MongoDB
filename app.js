import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// ===== MongoDB Connection =====
const mongoURI = process.env.MONGODB_URI || "your_mongodb_connection_string_here";

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ===== Schema & Model =====
const variantSchema = new mongoose.Schema({
  color: String,
  size: String,
  stock: Number,
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  variants: [variantSchema],
});

const Product = mongoose.model("Product", productSchema);

// ===== Routes =====

// Homepage (HTML + CSS + JS all in one)
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>E-commerce Catalog</title>
<style>
  body {
    font-family: Arial, sans-serif;
    background: #101010;
    color: #f5f5f5;
    text-align: center;
    padding: 30px;
  }
  button {
    margin: 10px;
    padding: 10px 20px;
    background: #28a745;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 5px;
  }
  button:hover {
    background: #218838;
  }
  #output {
    text-align: left;
    background: #222;
    padding: 20px;
    margin-top: 20px;
    border-radius: 8px;
    white-space: pre-wrap;
    overflow-x: auto;
  }
</style>
</head>
<body>
  <div class="container">
    <h1>🛍️ E-commerce Catalog</h1>
    <button onclick="loadAll()">Get All Products</button>
    <button onclick="loadCategory('Electronics')">Get Electronics</button>
    <button onclick="loadCategory('Apparel')">Get Apparel</button>
    <button onclick="seedData()">Seed Sample Data</button>
    <div id="output">Click a button to load data.</div>
  </div>

  <script>
    async function loadAll() {
      const res = await fetch('/products');
      const data = await res.json();
      document.getElementById('output').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    }

    async function loadCategory(category) {
      const res = await fetch('/products/category/' + category);
      const data = await res.json();
      document.getElementById('output').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    }

    async function seedData() {
      const res = await fetch('/seed');
      const text = await res.text();
      document.getElementById('output').innerHTML = text;
    }
  </script>
</body>
</html>
  `);
});

// Get all products
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get products by category
app.get("/products/category/:category", async (req, res) => {
  const products = await Product.find({ category: req.params.category });
  res.json(products);
});

// Seed sample data
app.get("/seed", async (req, res) => {
  await Product.deleteMany();

  const sampleProducts = [
    {
      name: "Winter Jacket",
      price: 200,
      category: "Apparel",
      variants: [
        { color: "Black", size: "S", stock: 8 },
        { color: "Gray", size: "M", stock: 12 },
      ],
    },
    {
      name: "Smartphone",
      price: 699,
      category: "Electronics",
      variants: [],
    },
  ];

  await Product.insertMany(sampleProducts);
  res.send("✅ Sample products inserted successfully!");
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
