import express from "express";
import { connectToDatabase, getDb } from "./db/index.js";
import { ObjectId } from "mongodb";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

connectToDatabase()
  .then(() => {
    console.log("Database connection established");

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
          return res.status(400).json({ error: "Invalid product ID" });
        }

        const product = await db.collection("products").findOne({
          _id: new ObjectId(productId),
        });

        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch product" });
      }
    });

    app.post("/products", async (req, res) => {
      try {
        const db = getDb();
        const product = req.body;

        if (!product.name || !product.price || !product.description) {
          return res
            .status(400)
            .json({ error: "Name, price and description are required" });
        }

        const result = await db.collection("products").insertOne(product);
        const newProduct = {
          _id: result.insertedId,
          ...product,
        };

        res.status(201).json(newProduct);
      } catch (err) {
        res.status(500).json({ error: "Failed to create product" });
      }
    });

    app.put("/products/:id", async (req, res) => {
      try {
        const db = getDb();
        const productId = req.params.id;
        const updateData = req.body;

        if (!ObjectId.isValid(productId)) {
          return res.status(400).json({ error: "Invalid product ID" });
        }

        const result = await db
          .collection("products")
          .updateOne({ _id: new ObjectId(productId) }, { $set: updateData });

        if (result.matchedCount === 0) {
          return res
            .status(404)
            .json({ message: "Product updated successfully" });
        }
        res.status(200).json({ message: "Product updated successfully" });
      } catch (err) {
        res.status(500).json({ error: "Failed to update product" });
      }
    });

    app.delete("/delete-products/:id", async (req, res) => {
      try {
        const db = getDb();
        const productId = req.params.id;

        if (!ObjectId.isValid(productId)) {
          return res.status(400).json({ error: "Invalid product ID" });
        }
        const result = await db.collection("products").deleteOne({
          _id: new ObjectId(productId),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfullly" });
      } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
      }
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      "Failed to start the server due to MongoDB connection issue",
      err
    );
    process.exit(1);
  });
