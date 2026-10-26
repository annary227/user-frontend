import axios from 'axios';

const request = axios.create({
    // 你的公网穿透地址
    baseURL: 'https://ripe-revisions-observer-reads.trycloudflare.com/api', 
    timeout: 15000, 
    headers: {
        'Content-Type': 'application/json',
        // 跳过 Cloudflare 的跨域安全拦截
        'cf-skip-browser-warning': 'true',
        // 🆕 绕过部分内网穿透工具的强制验证页
        'bypass-tunnel-reminder': 'true'
    }
});

export default request;