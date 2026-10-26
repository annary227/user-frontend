import axios from 'axios';

const request = axios.create({
    // 🆕 改回相对路径，由 Vercel 服务器自动帮你转发到公网地址
    baseURL: '/api', 
    timeout: 15000, 
    headers: {
        'Content-Type': 'application/json'
    }
});

export default request;