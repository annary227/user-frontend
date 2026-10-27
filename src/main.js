import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// 🆕 引入 Element Plus 及其核心样式
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);

app.use(router);

// 🆕 注册 Element Plus 到全局
app.use(ElementPlus);

app.mount('#app');