// 前端 JavaScript 脚本 (script.js) - 终极修复版

// ⚠️ 替换为您的 Cloudflare Worker 的 HTTPS URL！
const API_PROXY_URL = 'https://volcano-bot-proxy.1527360074.workers.dev/'; 

document.addEventListener('DOMContentLoaded', () => {
    // 确保元素存在后再绑定事件
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');

    if (sendButton) {
        sendButton.onclick = sendMessage;
    } else {
        console.error("Error: sendButton element not found.");
    }

    if (userInput) {
        userInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    } else {
         console.error("Error: userInput element not found.");
    }
});

function appendMessage(sender, text) {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) {
        console.error("Error: chatBox element not found.");
        return;
    }
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
            const status = response.status;
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                // Worker 返回的非 JSON 格式错误
                errorData = { error: '未知错误或响应格式错误' };
            }
            
            let errorMessage = `出错了：API 代理失败 (${status})`;
            if (errorData && errorData.error) {
                errorMessage = `${errorMessage} - ${errorData.error}`;
            } else if (status === 401) {
                errorMessage = `出错了：API 代理失败 (${status}) - 认证失败，请检查 Worker 密钥。`;
            }

            appendMessage('bot', errorMessage);
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
