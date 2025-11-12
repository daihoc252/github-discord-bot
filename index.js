import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Khi GitHub gửi event push
app.post("/github", async (req, res) => {
  const data = req.body;

  if (!data.commits || data.commits.length === 0) {
    return res.status(200).send("No commits to process");
  }

  // Lấy thông tin commit
  const pusher = data.pusher?.name || "Unknown";
  const repo = data.repository?.name || "Unknown repo";
  const commitMessages = data.commits.map(c => `• ${c.message} (${c.id.substring(0,7)})`).join("\n");

  // Gửi tin nhắn sang Discord
  const embed = {
    username: "GitHub Bot",
    embeds: [
      {
        title: `📦 Cập nhật mới trên ${repo}`,
        description: `👤 **${pusher}** vừa đẩy code lên GitHub!\n\n**Chi tiết commit:**\n${commitMessages}`,
        color: 0x00ff99,
        timestamp: new Date()
      }
    ]
  };

  try {
    await axios.post(DISCORD_WEBHOOK_URL, embed);
    res.status(200).send("Notification sent!");
  } catch (error) {
    console.error("❌ Lỗi gửi Discord:", error.message);
    res.status(500).send("Failed to send message to Discord");
  }
});

app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => console.log(`🚀 Webhook đang chạy tại cổng ${PORT}`));
