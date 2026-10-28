<!-- src/components/MlbCard.vue -->
<template>
  <!-- 去掉了 is-disabled 和 @click="handleMlbClick" -->
  <div class="mlb-game-card" @click="goToMlbRoom">
    <!-- 红色角标：改成 LIVE -->
    <div class="mlb-live-badge">
      <span class="dot"></span> LIVE
    </div>
    
    <div class="mlb-icon">⚾</div>
    
    <div class="mlb-info">
      <div class="mlb-title-row">
        <h4>MLB リアルタイム予想</h4>
      </div>
      <p class="mlb-desc">メジャーリーグのリアルタイムスコアで高配当を狙え！</p>
      <div class="mlb-bottom-row">
        <span class="mlb-price">最低 30,000 pt</span>
        <!-- 按钮恢复正常 -->
        <button class="mlb-btn">挑戦する ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

// 点击跳转到 MLBRoom 页面
const goToMlbRoom = () => {
  // 假设你的路由路径配置的是 /mlb，如果不是请修改
  router.push('/mlb'); 
};
</script>

<style scoped>
/* 恢复正常的卡片样式 */
.mlb-game-card {
  background: #0f172a;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 15px;
  position: relative;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.15);
  border: 2px solid #ef4444;
  transition: all 0.3s ease;
  overflow: hidden;
  margin-bottom: 30px; 
}

.mlb-game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(239, 68, 68, 0.3);
  border-color: #f87171;
}

.mlb-game-card:hover .mlb-btn {
  background: #dc2626;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
}

/* 红色 角标 */
.mlb-live-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  padding: 4px 12px;
  border-bottom-left-radius: 12px;
  font-size: 12px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 6px;
}
.mlb-live-badge .dot {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: pulse-dot 1s infinite alternate;
}
@keyframes pulse-dot {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.5; transform: scale(1.5); }
}

.mlb-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  flex-shrink: 0;
}

.mlb-info { flex: 1; display: flex; flex-direction: column; }
.mlb-title-row h4 { margin: 0 0 5px; color: #f8fafc; font-size: 16px; font-weight: bold; }
.mlb-desc { color: #94a3b8; font-size: 12px; margin: 0 0 15px; line-height: 1.4; }
.mlb-bottom-row { margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
.mlb-price { color: #fbbf24; font-size: 14px; font-weight: bold; }
.mlb-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}
</style>