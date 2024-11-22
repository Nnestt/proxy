import express from "express";
import axios from "axios";

// Firebase Realtime Database URL
const FIREBASE_URL = "https://kaahoot-5e80b-default-rtdb.asia-southeast1.firebasedatabase.app";

// Option 1: If Firebase rules are public (no authentication)
const response = await axios.get(`${FIREBASE_URL}/quizzes.json`);

// Option 2: If you need authentication (replace with your Firebase secret)
const FIREBASE_AUTH = process.env.FIREBASE_AUTH; // Get the Firebase auth token from environment variables
// const response = await axios.get(`${FIREBASE_URL}/quizzes.json?auth=${FIREBASE_AUTH}`);

// Initialize Express
const app = express();
app.use(express.json());


app.post("/quizzes/:id/player_score", async (req, res) => {
  const { id } = req.params;  // Quiz ID from the URL parameters
  const { playerId, score } = req.body;  // Destructure playerId and score from req.body

  if (!playerId || !score) {
    return res.status(400).json({ message: "Player ID and score are required" });
  }

  try {
    // Use PUT to set the score directly for the specified playerId under player_score
    const response = await axios.put(
      `${FIREBASE_URL}/quizzes/${id}/player_score/${playerId}.json?auth=${FIREBASE_AUTH}`,
      JSON.stringify(score)  // The new score to set for the playerId
    );

    // Return success message
    res.status(201).json({
      message: "Player score added successfully",
      playerId: playerId,
      newScore: score
    });

  } catch (error) {
    console.error("Error posting player score to Firebase:", error.message);
    res.status(500).send("Error posting player score");
  }
});

// Redirect to HTTP in production
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

// Route to handle POST request to add player scores to a specific quiz
app.post("/quizzes/:id/player_score", async (req, res) => {
  const { id } = req.params;
  const playerScore = req.body; // Get the player score data from the request body

  try {
    // Send POST request to Firebase Realtime Database to add the player score
    const response = await axios.post(
      `${FIREBASE_URL}/quizzes/${id}/player_score.json?auth=${FIREBASE_AUTH}`,
      playerScore// Send the player score data to Firebase
    );

    // Firebase returns a unique key for the new data
    res.status(201).json({ message: "Player score added successfully", id: response.data.name }); // Response includes the new player score's ID
  } catch (error) {
    console.error("Error posting player score to Firebase:", error.message);
    res.status(500).send("Error posting player score");
  }
});

// Redirect to HTTP in production
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

//test
app.get("/:id/current", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the quiz data from Firebase using the id
    const response = await axios.get(`${FIREBASE_URL}/quizzes/${id}/current_question.json?auth=${FIREBASE_AUTH}`);
    
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
