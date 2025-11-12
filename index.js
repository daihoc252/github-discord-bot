import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Nhận sự kiện push từ GitHub
app.post("/github", async (req, res) => {
  const data = req.body;

  if (!data.commits || data.commits.length === 0) {
    return res.status(200).send("No commits to process");
  }

  const repo = data.repository?.name || "unknown-repo";
  const pusher = data.pusher?.name || "Unknown user";
  const commits = data.commits.map(c => `• ${c.message} (${c.id.slice(0,7)})`).join("\n");

  const embed = {
    username: "GitHub Bot",
    embeds: [
      {
        title: `📦 Cập nhật mới trong ${repo}`,
        description: `👤 **${pusher}** vừa đẩy code!\n\n**Chi tiết:**\n${commits}`,
        color: 0x00ff99,
        timestamp: new Date()
      }
    ]
  };

  try {
    await axios.post(DISCORD_WEBHOOK_URL, embed);
    res.status(200).send("Notification sent to Discord");
  } catch (err) {
    console.error("❌ Lỗi gửi Discord:", err.message);
    res.status(500).send("Failed to send message to Discord");
  }
});

app.get("/", (req, res) => res.send("✅ Bot is running"));
app.listen(PORT, () => console.log(`🚀 Bot đang chạy tại cổng ${PORT}`));
