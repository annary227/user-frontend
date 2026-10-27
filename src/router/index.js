import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import GachaRoom from '../views/GachaRoom.vue';
import Profile from '../views/Profile.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import History from '../views/History.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/login', component: Login },
        { path: '/register', component: Register },
        { path: '/', component: Home },
        { path: '/gacha', component: GachaRoom },
        { path: '/profile', component: Profile },
        { path: '/history', component: History }
    ]
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
    const user = localStorage.getItem('user');
    
    // 定义不需要登录就能访问的“白名单”页面
    const whiteList = ['/login', '/register'];
    
    if (whiteList.includes(to.path)) {
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
            // 有登录信息，正常放行（不在这里做实名拦截，实名由账户层和出金动作把控）
            next();
        }
    }
});

export default router;