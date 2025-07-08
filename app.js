import express from "express";
import { connectToDatabase } from "./db/index.js";
import { ObjectId } from "mongodb";

const app = express();
const PORT = process.env.PORT || 3000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      "Failed to start the server due to MongoDB connection issue",
      err
    );
  });

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/products", async (req, res) => {
  try {
    const db = getDb();
    const products = await db.collection("products").find().toArray();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const db = getDb();
    const productId = req.params.id;

    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const product = await db
      .collection("product")
      .findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const db = getDB();
    const product = req.body;

    if (!product.name || !product.price || !product.description) {
      return res
        .status(400)
        .json({ error: "Name, price and description are required" });
    }

    const result = await db.collection("products").insertOne(product);
    res.status(201).json(result.ops[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});
