const express = require("express");
const OpenAI = require("openai");

const app = express();

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

    // รับเฉพาะข้อความตัวอักษร
    if (event.type === "message" && event.message.type === "text") {
      const replyToken = event.replyToken;
      const userMessage = event.message.text;

      console.log("User:", userMessage);

      // ส่งข้อความไปให้ OpenAI
      const aiResponse = await openai.responses.create({
        model: "gpt-5.6-luna",
        instructions: `
คุณคือ AI Assistant ของคลินิก

หน้าที่:
- ตอบคำถามด้านสุขภาพและโภชนาการเบื้องต้น
- ใช้ภาษาที่สุภาพ เป็นมิตร และเข้าใจง่าย
- ตอบกระชับ ไม่ยาวเกินความจำเป็น

ข้อจำกัด:
- ห้ามวินิจฉัยโรค
- ห้ามสั่ง หยุด หรือปรับยา
- ห้ามแทนที่แพทย์หรือบุคลากรทางการแพทย์
- หากคำถามมีความเสี่ยงสูงหรือเกี่ยวข้องกับอาการรุนแรง ให้แนะนำให้ติดต่อบุคลากรทางการแพทย์
        `,
        input: userMessage
      });

      const aiText = aiResponse.output_text;

      console.log("AI:", aiText);

      // ส่งคำตอบกลับไป LINE
      const response = await fetch(
        "https://api.line.me/v2/bot/message/reply",
        {
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
                text: aiText
              }
            ]
          })
        }
      );

      const result = await response.text();

      console.log("LINE Reply Status:", response.status);
      console.log("LINE Reply Response:", result);
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