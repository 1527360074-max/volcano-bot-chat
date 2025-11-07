// Worker 代理脚本 (index.js) - 硬编码修复版

const VOLCANO_API_URL = "https://ark.cn-beijing.volces.com/api/v3/bots/chat/completions";

// ⚠️ 最终修复：硬编码密钥，绕过环境变量读取失败的问题
const API_KEY = "67a06514-c30d-4a37-9cab-3729ff6293db"; // <-- 替换成您的 VOLCANO_API_KEY 真实值
const BOT_ID = "bot-20251106211905-bncwb";   // <-- 替换成您的 VOLCANO_BOT_ID 真实值


// 使用 export default 语法确保 Worker 启动
export default {
    async fetch(request) { // 注意：这里不再需要 env 参数，因为密钥是硬编码的
        return handleRequest(request);
    }
};


async function handleRequest(request) {
    if (request.method === 'OPTIONS') {
        return handleOptions(request);
    }

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: {'Access-Control-Allow-Origin': '*'} });
    }

    try {
        // 确保密钥已被替换
        if (API_KEY === "YOUR_API_KEY" || !BOT_ID) {
             return new Response('Server config error: API Key not set in script.', { status: 500, headers: {'Access-Control-Allow-Origin': '*'} });
        }
        
        let frontendData;
        try {
            frontendData = await request.json(); 
        } catch (e) {
            return new Response('Invalid JSON from frontend.', { status: 400, headers: {'Access-Control-Allow-Origin': '*'} });
        }
        
        const userQuery = frontendData?.query; 
        
        if (!userQuery) {
            return new Response('Missing query in request body.', { status: 400, headers: {'Access-Control-Allow-Origin': '*'} });
        }
        
        const requestBody = {
            api_key: API_KEY, 
            bot_id: BOT_ID,   
            query: userQuery,
            stream: false, 
        };

        const botResponse = await fetch(VOLCANO_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!botResponse.ok) {
            const errorText = await botResponse.text();
            console.error(`Volcano API Status: ${botResponse.status}, Error Body: ${errorText.substring(0, 200)}`); 
            
            return new Response(`Volcano API Error: ${botResponse.statusText}. Check Logs.`, { status: botResponse.status, headers: {'Access-Control-Allow-Origin': '*'} });
        }

        const responseData = await botResponse.json();
        const botReplyText = responseData?.result?.reply_text; 
        
        if (!botReplyText) {
            return new Response('Bot returned unexpected format or empty reply.', { status: 500, headers: {'Access-Control-Allow-Origin': '*'} });
        }

        const finalResponse = { reply_text: botReplyText };

        let headers = new Headers();
        headers.set('Content-Type', 'application/json');
        headers.set('Access-Control-Allow-Origin', '*'); 
        headers.set('Access-Control-Allow-Methods', 'POST');

        return new Response(JSON.stringify(finalResponse), { status: 200, headers: headers });

    } catch (e) {
        console.error("Final Catch Error:", e.message);
        return new Response(`Internal Proxy Error: ${e.message}. Check Logs.`, { 
            status: 500,
            headers: {'Access-Control-Allow-Origin': '*'}
        });
    }
}

function handleOptions(request) {
    let respHeaders = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || 'Content-Type',
        'Access-Control-Max-Age': '86400', 
    });
    return new Response(null, { status: 204, headers: respHeaders }); 
}
