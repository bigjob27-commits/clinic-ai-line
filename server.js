const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Clinic AI Backend is running!");
});

app.post("/webhook", (req, res) => {
  console.log("LINE Webhook:");
  console.log(JSON.stringify(req.body, null, 2));

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});