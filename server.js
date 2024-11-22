import express from "express";
import axios from "axios";

// Firebase Realtime Database URL
const FIREBASE_URL = "https://kaahoot-5e80b-default-rtdb.asia-southeast1.firebasedatabase.app";

// Option 1: If Firebase rules are public (no authentication)
const response = await axios.get(`${FIREBASE_URL}/quizzes.json`);

// Option 2: If you need authentication (replace with your Firebase secret)
const FIREBASE_AUTH = "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"; // Replace with your database secret
// const response = await axios.get(`${FIREBASE_URL}/quizzes.json?auth=${FIREBASE_AUTH}`);

// Initialize Express
const app = express();

// Proxy route to fetch data from Firebase
app.get("/quizzes", async (req, res) => {
  try {
    const response = await axios.get(`${FIREBASE_URL}/quizzes.json?auth=${FIREBASE_AUTH}`);
    res.json(response.data); // Forward the Firebase data to the client
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).send("Error fetching data");
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
