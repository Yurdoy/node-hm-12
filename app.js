import express from "express";
import { connectToDatabase } from "./db/index.js";

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
