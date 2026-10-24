import axios from 'axios';

const request = axios.create({
    // 🆕 直接把你的公网穿透地址写死在这里
    baseURL: 'https://ripe-revisions-observer-reads.trycloudflare.com/api', 
    timeout: 15000, // 跨公网请求，超时时间稍微设长一点
    headers: {
        'Content-Type': 'application/json',
        // 🆕 跳过 Cloudflare 的跨域安全拦截（防 405）
        'cf-skip-browser-warning': 'true'
    }
});

export default request;