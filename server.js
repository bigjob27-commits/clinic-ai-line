const express = require("express");
const crypto = require("crypto");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Clinic AI Backend is running!");
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("LINE Webhook:");
    console.log(JSON.stringify(req.body, null, 2));

    const event = req.body.events?.[0];

    if (!event) {
      return res.sendStatus(200);
    }

    // ตอบเฉพาะข้อความ Text
    if (event.type === "message" && event.message.type === "text") {
      const replyToken = event.replyToken;
      const userMessage = event.message.text;

      await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          replyToken: replyToken,
          messages: [
            {
              type: "text",
              text: `ได้รับข้อความแล้วครับ 👋\nคุณพิมพ์ว่า: ${userMessage}`
            }
          ]
        })
      });
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("ERROR:", error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});