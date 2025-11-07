// 前端 JavaScript 脚本 (script.js)

// ⚠️ 确保这里是您的 Cloudflare Worker 的 HTTPS URL！
// 请替换成您的真实 Worker URL
const API_PROXY_URL = 'https://volcano-bot-proxy.1527360074.workers.dev/'; 

document.addEventListener('DOMContentLoaded', () => {
    // 绑定事件
    document.getElementById('sendButton').onclick = sendMessage;
    document.getElementById('userInput').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});

function appendMessage(sender, text) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


async function sendMessage() {
    const input = document.getElementById('userInput');
    const query = input.value.trim();

    if (query === "") return;

    appendMessage('user', query);
    input.value = ''; // 清空输入框

    try {
        const response = await fetch(API_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query }),
        });

        // 检查HTTP状态码
        if (!response.ok) {
            // Worker 返回了非 2xx 状态码 (例如 401, 400, 500)
            const errorData = await response.json().catch(() => ({error: '未知错误或响应格式错误'}));
            const status = response.status;
            
            let errorMessage = `出错了：API 代理失败 (${status})`;
            if (errorData && errorData.error) {
                errorMessage = `${errorMessage} - ${errorData.error}`;
            }

            appendMessage('bot', errorMessage);
            console.error(`API Error: Status ${status}`, errorData);
            return;
        }

        // 成功响应 (200 OK)
        const data = await response.json();
        const botReply = data.reply_text || "抱歉，我没有收到回复。";
        appendMessage('bot', botReply);

    } catch (error) {
        // 网络层错误 (Failed to fetch, CORS, etc.)
        appendMessage('bot', '出错了：无法连接到服务 (Failed to fetch)');
        console.error('Fetch error:', error);
    }
}
