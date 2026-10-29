<!-- src/App.vue -->
<template>
  <div class="app-wrapper">
    <!-- 页面路由出口 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

// 🆕 全局注入 Tawk.to 网页客服
onMounted(() => {
  // 🚨 防止 Vue 热更新导致重复注入多个客服图标
  if (document.getElementById('tawk-script')) return;

  // 1. 初始化全局变量
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  // 2. 动态创建 script 标签
  const s1 = document.createElement("script");
  const s0 = document.getElementsByTagName("script")[0];
  
  s1.id = 'tawk-script';
  s1.async = true;
  // 🚨 这里是你刚才发给我的真实 Tawk 链接
  s1.src = 'https://embed.tawk.to/6ae34d713b61283478b5ac67/1k63ud1bt';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  
  // 3. 插入到文档中
  s0.parentNode.insertBefore(s1, s0);
});
</script>

<style>
/* 全局强制重置，清除默认边距 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 外层容器 */
.app-wrapper {
  min-height: 100vh;
  background-color: #f2f5f8;
  display: flex;
  flex-direction: column;
}

/* 🆕 确保 Tawk.to 的 iframe 悬浮在最顶层，不被你的暗黑 UI 遮挡 */
#tawk-bubble-container {
  z-index: 99999 !important;
}
</style>