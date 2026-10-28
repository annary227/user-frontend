// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import GachaRoom from '../views/GachaRoom.vue';
import Profile from '../views/Profile.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import History from '../views/History.vue';
// 🆕 引入合规页面
import CommerceDisclosure from '../views/CommerceDisclosure.vue';
// 🆕 引入社交/私聊页面
import SocialChat from '../views/SocialChat.vue';
// 🆕 引入 MLB 竞猜页面
import MLBRoom from '../views/MLBRoom.vue'; 
// 🆕 引入 MLB 比赛房间详情页面（请确保您之后创建了这个文件）
import MlbMatchDetail from '../views/MlbMatchDetail.vue'; 

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/login', component: Login },
        { path: '/register', component: Register },
        { path: '/', component: Home },
        { path: '/gacha', component: GachaRoom },
        { path: '/profile', component: Profile },
        { path: '/history', component: History },
        // 🆕 添加合规页面路由
        { path: '/legal/commerce', component: CommerceDisclosure },
        // 🆕 添加社交/私聊路由
        { path: '/social', component: SocialChat },
        // 🆕 添加 MLB 竞猜大厅路由
        { path: '/mlb', component: MLBRoom },
        // 🆕 添加 MLB 比赛房间详情路由
        { path: '/mlb/room/:id', component: MlbMatchDetail } 
    ]
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
    const user = localStorage.getItem('user');
    
    // 定义不需要登录就能访问的“白名单”页面
    // 🆕 把 '/mlb' 加进去，允许游客查看比分
    // 🆕 判断 'to.path.startsWith('/mlb')' 可以兼容包括房间详情页 /mlb/room/123 在内的所有 MLB 页面
    const whiteList = ['/login', '/register', '/legal/commerce', '/mlb'];
    
    // 检查是否是白名单路径，或者是否以 /mlb 开头（包含房间详情页）
    const isWhiteListed = whiteList.includes(to.path) || to.path.startsWith('/mlb');
    
    if (isWhiteListed) {
        // 如果去的是登录页，且已经登录了，直接踢回首页
        if (user && to.path === '/login') {
            next('/'); 
        } else {
            next();
        }
    } else {
        // 如果去的是需要权限的页面，但没登录，强制去登录页
        if (!user) {
            next('/login'); 
        } else {
            next();
        }
    }
});

export default router;