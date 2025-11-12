import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

app.post("/github", async (req, res) => {
  const payload = req.body;

  if (!payload || !payload.commits || payload.commits.length === 0) {
    return res.status(200).send("No commits found");
  }

  const repo = payload.repository?.full_name || "Unknown Repo";
  const branch = payload.ref?.replace("refs/heads/", "") || "main";
  const pusher = payload.pusher?.name || "Unknown";
  const avatar = payload.sender?.avatar_url || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";

  // Tạo danh sách commit hiển thị đẹp
  const commitDetails = payload.commits
    .map(
      (c) =>
        `📝 **${c.message}**\n> 🔗 [Xem commit](${c.url})\n> 👤 ${c.author?.name} (${c.id.slice(0,7)})`
    )
    .join("\n\n");

  // Embed Discord siêu đẹp, chuẩn như ảnh mẫu
  const discordMessage = {
    username: "Thanh Tra Code",
    avatar_url: "https://cdn.discordapp.com/attachments/1438117416671383613/1438117467581841488/df570bc7c008c926985f84219eebda53.jpg?ex=6915b6c3&is=69146543&hm=6ccaefce79766f0cbf868f680bf7362ca3129733d8c1c5a628d6c9c5d8a24fd5&",
    embeds: [
      {
        author: {
          name: `${pusher} vừa cập nhật trong ${repo}`,
          icon_url: avatar,
        },
        title: `📂 Branch: ${branch}`,
        description: commitDetails,
        color: 0x5865f2, // màu xanh Discord
        footer: {
          text: "GitHub Auto Notify Bot • DHawk Edition",
          icon_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axios.post(DISCORD_WEBHOOK_URL, discordMessage);
    res.status(200).send("✅ Embed sent to Discord");
  } catch (err) {
    console.error("❌ Lỗi gửi Discord:", err.message);
    res.status(500).send("Failed to send embed");
  }
});

app.get("/", (req, res) => res.send("✅ Bot is running"));
app.listen(PORT, () => console.log(`🚀 Bot đang chạy tại cổng ${PORT}`));
