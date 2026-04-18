import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import { execSync } from "child_process";

// 🔑 ضع مفاتيحك هنا
const TELEGRAM_TOKEN = "PUT_TELEGRAM_BOT";
const CHAT_ID = "PUT_CHAT_ID";
const ELEVENLABS_KEY = "PUT_ELEVENLABS_KEY";
const OPENAI_KEY = "PUT_OPENAI_KEY";

// 🧠 قصة تلقائية
const story = "في مدينة مظلمة، بدأ شخص يسمع أصواتاً غريبة تقوده إلى سر مخيف...";

// 🔊 صوت ElevenLabs
async function makeVoice() {
  const res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB", {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: story,
      model_id: "eleven_multilingual_v2"
    })
  });

  const buffer = await res.arrayBuffer();
  fs.writeFileSync("voice.mp3", Buffer.from(buffer));
}

// 🖼️ صور AI (OpenAI)
async function makeImages() {
  for (let i = 0; i < 4; i++) {
    const res = await fetch("https://picsum.photos/720/1280");
    const buf = await res.arrayBuffer();
    fs.writeFileSync(`img${i}.jpg`, Buffer.from(buf));
  }
}

// 🎬 فيديو
function buildVideo() {
  execSync(`
    ffmpeg -y \
    -i img0.jpg -i img1.jpg -i img2.jpg -i img3.jpg \
    -i voice.mp3 \
    -filter_complex "[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0,format=yuv420p[v]" \
    -map "[v]" -map 4:a \
    -t 120 video.mp4
  `);
}

// 📤 Telegram
async function sendTelegram() {
  const form = new FormData();
  form.append("chat_id", CHAT_ID);
  form.append("video", fs.createReadStream("video.mp4"));

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendVideo`, {
    method: "POST",
    body: form
  });
}

// 🚀 تشغيل كامل
await makeVoice();
await makeImages();
buildVideo();
await sendTelegram();

console.log("✅ تم إنشاء ونشر الفيديو");
