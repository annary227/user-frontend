import axios from 'axios';

const request = axios.create({
    // 🆕 去掉了末尾的空格，并正确加上了 /api 后缀
    baseURL: 'https://qualified-contacting-rom-dover.trycloudflare.com/api',
    timeout: 15000, 
    headers: {
        'Content-Type': 'application/json',
        // 绕过 Cloudflare 隧道的警告页
        'bypass-tunnel-reminder': '1',
        'cf-skip-browser-warning': 'true'
    }
});

export default request;