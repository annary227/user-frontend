<template>
  <div class="app-wrapper">
    <!-- 页面路由出口 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
// 已移除重复的全局 Marquee 组件
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
</style>