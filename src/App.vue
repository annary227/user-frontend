<template>
  <div class="app-wrapper">
    <!-- 全局滚动公告跑马灯（固定在屏幕最顶端） -->
    <div class="global-marquee-wrapper">
      <Marquee />
    </div>
    
    <!-- 占位符：防止页面内容被悬浮的跑马灯遮挡 -->
    <div class="marquee-placeholder"></div>

    <!-- 页面路由出口 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
// 引入刚才写好的跑马灯组件
import Marquee from './components/Marquee.vue';
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

/* 跑马灯外层：强制悬浮固定在顶部，层级拉到最高 */
.global-marquee-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #ffffff;
  padding: 8px 20px;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  z-index: 9999; /* 绝对不被任何元素遮挡 */
}

/* 占位符：高度和跑马灯高度保持一致（大概 56px） */
.marquee-placeholder {
  height: 56px; 
  width: 100%;
  flex-shrink: 0;
}
</style>