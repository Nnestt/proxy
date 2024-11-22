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

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] === 'https') {
      return res.redirect('http://' + req.headers.host + req.url);
    }
    next();
  });
}

app.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the quiz data from Firebase using the id
    const response = await axios.get(`${FIREBASE_URL}/quizzes/${id}/questions.json?auth=${FIREBASE_AUTH}`);

    if (response.data) {
      res.json(response.data); // Forward the specific quiz data to the client
    } else {
      res.status(404).send("Quiz not found");
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).send("Error fetching data");
  }
});

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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
