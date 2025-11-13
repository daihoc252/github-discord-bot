import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// 🧩 Route GitHub
app.post("/github", async (req, res) => {
  const payload = req.body;
  if (!payload || !payload.commits) return res.sendStatus(200);

  const repo = payload.repository?.full_name || "Unknown Repo";
  const branch = payload.ref?.replace("refs/heads/", "") || "main";
  const pusher = payload.pusher?.name || "Unknown";
  const avatar = payload.sender?.avatar_url || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";

  // Lặp qua từng commit để tạo phần mô tả chi tiết
  const commitDetails = payload.commits
    .map((c) => {
      const added = c.added?.map(f => `➕ \`${f}\``).join("\n") || "";
      const modified = c.modified?.map(f => `✏️ \`${f}\``).join("\n") || "";
      const removed = c.removed?.map(f => `❌ \`${f}\``).join("\n") || "";

      const fileChanges = [added, modified, removed].filter(Boolean).join("\n");
      return `📝 **${c.message}**  
> 📁 **Files:**  
${fileChanges || "_(Không có thay đổi file cụ thể)_"}  
> 🔗 [Xem commit](${c.url})  
> 👤 ${c.author?.name}`;
    })
    .join("\n\n");

  const msg = {
    username: "GitHub Bot",
    avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    embeds: [
      {
        author: { name: `${pusher} cập nhật trong ${repo}`, icon_url: avatar },
        title: `📂 Branch: ${branch}`,
        description: commitDetails,
        color: 0x00b0f4,
        footer: { text: "GitHub → Discord via DHawk Bot" },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await axios.post(DISCORD_WEBHOOK_URL, msg);
  res.status(200).send("GitHub event OK");
});


// 🧩 Route GitLab
app.post("/gitlab", async (req, res) => {
  const payload = req.body;
  if (!payload || !payload.commits) return res.sendStatus(200);

  const repo = payload.project?.path_with_namespace || "Unknown Repo";
  const branch = payload.ref?.replace("refs/heads/", "") || "main";
  const user = payload.user_name || "Unknown";
  const avatar = payload.user_avatar || "https://about.gitlab.com/images/press/logo/png/gitlab-logo-gray-rgb.png";

  const commitDetails = payload.commits
    .map((c) => {
      const added = c.added?.map(f => `➕ \`${f}\``).join("\n") || "";
      const modified = c.modified?.map(f => `✏️ \`${f}\``).join("\n") || "";
      const removed = c.removed?.map(f => `❌ \`${f}\``).join("\n") || "";

      const fileChanges = [added, modified, removed].filter(Boolean).join("\n");
      return `📝 **${c.message}**  
> 📁 **Files:**  
${fileChanges || "_(Không có thay đổi file cụ thể)_"}  
> 🔗 [Xem commit](${c.url})  
> 👤 ${c.author?.name}`;
    })
    .join("\n\n");

  const msg = {
    username: "GitLab Bot",
    avatar_url: "https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png",
    embeds: [
      {
        author: { name: `${user} vừa cập nhật trong ${repo}`, icon_url: avatar },
        title: `🦊 Branch: ${branch}`,
        description: commitDetails,
        color: 0xfc6d26,
        footer: { text: "GitLab → Discord via DHawk Bot" },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axios.post(DISCORD_WEBHOOK_URL, msg);
    res.status(200).send("GitLab event OK");
  } catch (err) {
    console.error("❌ Lỗi gửi Discord:", err.message);
    res.status(500).send("Failed to send to Discord");
  }
});

app.get("/", (req, res) => res.send("✅ DHawk Bot is running"));
app.listen(PORT, () => console.log(`🚀 DHawk Bot đang chạy tại cổng ${PORT}`));
