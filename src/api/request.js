import axios from 'axios';

const request = axios.create({
    // 🆕 直接写死最新的隧道地址，带上 /api 后缀，彻底绕过 Vercel 代理！
    baseURL: 'https://qualified-contacting-rom-dover.trycloudflare.com ',
    timeout: 15000, 
    headers: {
        'Content-Type': 'application/json',
        // 绕过 Cloudflare 隧道的警告页
        'bypass-tunnel-reminder': '1',
        'cf-skip-browser-warning': 'true'
    }
});

export default request;