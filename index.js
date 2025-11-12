import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// 🧩 Khi GitHub gửi sự kiện push
app.post("/github", async (req, res) => {
  const payload = req.body;

  if (!payload || !payload.commits || payload.commits.length === 0) {
    return res.status(200).send("No commits found");
  }

  const repo = payload.repository?.full_name || "Unknown Repo";
  const pusher = payload.pusher?.name || "Unknown User";
  const branch = payload.ref?.replace("refs/heads/", "") || "unknown-branch";

  // Hiển thị từng commit chi tiết
  const commitList = payload.commits
    .map(c => `> 📝 **${c.message}**\n> 🔗 [Xem commit](${c.url})\n> 👤 ${c.author?.name}\n`)
    .join("\n");

  const embed = {
    username: "GitHub Updates",
    avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    embeds: [
      {
        title: `📦 Cập nhật mới trong **${repo}** (${branch})`,
        description: `${pusher} vừa đẩy code lên GitHub 🚀\n\n${commitList}`,
        color: 0x00b0f4,
        footer: {
          text: "GitHub Auto Notify Bot • DHawk Edition",
          icon_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axios.post(DISCORD_WEBHOOK_URL, embed);
    res.status(200).send("✅ Discord notified successfully");
  } catch (err) {
    console.error("❌ Lỗi gửi Discord:", err.message);
    res.status(500).send("Failed to send message to Discord");
  }
});

app.get("/", (req, res) => res.send("✅ Bot is running"));
app.listen(PORT, () => console.log(`🚀 Bot đang chạy tại cổng ${PORT}`));
