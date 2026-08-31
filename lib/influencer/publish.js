// IG Graph API + TikTok + Telegram - free, auto
export async function publishInstagram({ imageUrl, videoUrl, caption }) {
  const token = process.env.IG_ACCESS_TOKEN;
  const igUserId = process.env.IG_USER_ID;
  if (!token || !igUserId) return { skipped: true, reason: "IG not configured" };
  const isVideo = Boolean(videoUrl);
  const mediaUrl = videoUrl || imageUrl;
  const createRes = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(isVideo ? { media_type: "VIDEO", video_url: mediaUrl, caption } : { image_url: mediaUrl, caption }),
  });
  const cj = await createRes.json().catch(() => ({}));
  if (!createRes.ok) throw new Error(`IG create ${createRes.status}: ${JSON.stringify(cj).slice(0, 300)}`);
  const creationId = cj.id;
  // poll status for video
  if (isVideo) {
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const s = await fetch(`https://graph.facebook.com/v18.0/${creationId}?fields=status_code&access_token=${token}`);
      const sj = await s.json().catch(() => ({}));
      if (sj.status_code === "FINISHED") break;
    }
  }
  const pubRes = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: creationId, access_token: token }),
  });
  const pj = await pubRes.json().catch(() => ({}));
  if (!pubRes.ok) throw new Error(`IG publish ${pubRes.status}: ${JSON.stringify(pj).slice(0, 300)}`);
  return { id: pj.id };
}

export async function notifyTelegram(text) {
  const bot = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!bot || !chat) return;
  await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML" }),
  }).catch(() => {});
}
