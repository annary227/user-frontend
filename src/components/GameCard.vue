<template>
  <div class="game-card">
    <div class="card-top">
      <div class="card-icon" :style="{ background: color }">{{ icon }}</div>
      <div class="card-info">
        <h4>{{ title }}</h4>
        <p>{{ desc }}</p>
        <span class="price">1枚 <strong>¥{{ price }}</strong></span>
      </div>
      <div class="card-max-prize">最高 {{ maxPrize }}</div>
    </div>
    <div class="card-bottom">
      <a href="#" class="prize-table-link">📋 当せん金表</a>
      <button class="action-btn" :style="{ background: btnColor }" @click="$emit('play')">挑戦する ＞</button>
    </div>
  </div>
</template>

<script setup>
// 接收父组件 Home.vue 传进来的数据
defineProps({
  title: String,
  desc: String,
  price: Number,
  maxPrize: String,
  icon: String,
  color: String,
  btnColor: String
});

// 定义向外抛出的事件（点击挑战按钮时触发）
defineEmits(['play']);
</script>

<style scoped>
.game-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; border: 1px solid #f0f0f0; }
.card-top { display: flex; position: relative; margin-bottom: 20px; }
.card-icon { width: 50px; height: 50px; border-radius: 10px; display: flex; justify-content: center; align-items: center; font-size: 24px; margin-right: 15px; color: white; }
.card-info h4 { margin: 0 0 5px; font-size: 16px; }
.card-info p { margin: 0 0 8px; font-size: 12px; color: #888; }
.price { font-size: 12px; color: #333; }
.price strong { font-size: 16px; color: #e83862; margin-left: 3px; }
.card-max-prize { position: absolute; right: 0; top: 0; background: #fff8e1; color: #d32f2f; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
.card-bottom { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; padding-top: 15px; margin-top: auto; }
.prize-table-link { font-size: 12px; color: #888; display: flex; align-items: center; gap: 5px; text-decoration: none; }
.action-btn { border: none; padding: 10px 20px; border-radius: 25px; color: white; font-weight: bold; font-size: 14px; cursor: pointer; transition: opacity 0.2s; }
.action-btn:hover { opacity: 0.9; }
</style>