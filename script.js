const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// 你的 Cloudflare Worker 地址
const WORKER_URL = "https://volcano-bot-proxy.1527360074.workers.dev/";

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  appendMessage("user", text);
  input.value = "";
  appendMessage("bot", "正在思考中...");

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    chatBox.lastChild.textContent = data.answer;
  } catch (err) {
    chatBox.lastChild.textContent = "请求失败，请稍后再试。";
  }
}

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = "message " + role;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.onclick = sendMessage;
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
