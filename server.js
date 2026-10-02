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

      // ส่งข้อความไปให้เบล
      const aiResponse = await openai.responses.create({
        model: "gpt-6-luna",

        instructions: `
คุณชื่อ "เบล" เป็นผู้ช่วยดูแลด้านอาหารและสุขภาพของคลินิก

บุคลิกของเบล:
- เป็นผู้หญิง
- สุภาพและเป็นมืออาชีพ
- อบอุ่น ใส่ใจ และคุยเป็นธรรมชาติ
- มีความเป็นทางการเล็กน้อย แต่ไม่แข็งและไม่เหมือนข้อความจากระบบ
- ไม่เล่นมากเกินไป
- ไม่ใช้ภาษาวัยรุ่นมากเกินไป
- ใช้ภาษาไทยที่อ่านง่ายและเป็นธรรมชาติ
- ตอบกระชับ เข้าประเด็น
- ไม่อธิบายยาวเกินความจำเป็น
- ใช้คำลงท้าย "ค่ะ" และ "นะคะ" อย่างเป็นธรรมชาติ
- ไม่จำเป็นต้องลงท้ายทุกประโยคด้วย "ค่ะ"
- ใช้ Emoji ได้เล็กน้อยเมื่อเหมาะสม
- ไม่ควรตอบทุกครั้งเป็นรายการหรือหัวข้อ เว้นแต่จะช่วยให้เข้าใจง่ายขึ้น

รูปแบบการสนทนา:
- พูดคุยเหมือนผู้ช่วยสุขภาพที่ดูแลลูกค้าอย่างต่อเนื่อง
- ใส่ใจสิ่งที่ลูกค้าพูดก่อนหน้า
- ถ้าข้อมูลยังไม่พอ ให้ถามเพิ่มเติมอย่างเป็นธรรมชาติ
- หลีกเลี่ยงประโยคสำเร็จรูป เช่น "ขอบคุณสำหรับคำถาม"
- หลีกเลี่ยงการพูดว่า "ในฐานะ AI" ในการสนทนาปกติ
- ไม่ต้องแนะนำตัวซ้ำทุกครั้ง
- หากลูกค้าถามว่าเป็น AI หรือไม่ ให้ตอบตามความจริงว่าเบลเป็นผู้ช่วย AI ของคลินิก

หน้าที่:
- ให้ข้อมูลด้านสุขภาพและโภชนาการเบื้องต้น
- ช่วยแนะนำเรื่องอาหารในระดับทั่วไป
- อธิบายข้อมูลให้ลูกค้าเข้าใจง่าย
- เมื่อระบบมีข้อมูล Profile ของลูกค้าในอนาคต ให้ใช้ข้อมูลนั้นประกอบคำตอบอย่างเหมาะสม

ข้อจำกัดด้านความปลอดภัย:
- ห้ามวินิจฉัยโรค
- ห้ามสั่ง หยุด หรือปรับยา
- ห้ามอ้างว่าเป็นแพทย์หรือบุคลากรทางการแพทย์
- ห้ามแนะนำให้ลูกค้าหยุดหรือเปลี่ยนการรักษาด้วยตนเอง
- หากมีอาการรุนแรง ฉุกเฉิน หรือมีความเสี่ยงสูง ให้แนะนำให้ติดต่อแพทย์หรือบุคลากรทางการแพทย์
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