import express from "express";
import { getAiNames } from "./ai-names.js";

const app = express();
const port = 3000;

// Step 6: Serve your HTML file
app.use(express.static("public"));

app.get("/ais", async (req, res) => {
  console.log("GET /ais");
  try {
    const names = await getAiNames();
    res.json(names);
  } catch (e) {
    res.status(500).send("An error occurred");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
