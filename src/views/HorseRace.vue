<template>
  <div class="real-race-container">
    <!-- 🆕 真实赛马场比赛视频外链（免版权素材） -->
    <video 
      class="race-video"
      src="https://cdn.coverr.co/videos/coverr-horse-racing-1573/1080p.mp4" 
      autoplay 
      loop 
      muted 
      playsinline
    ></video>

    <!-- 黑色渐变遮罩，让 UI 看得清 -->
    <div class="video-mask"></div>

    <!-- 你的游戏 UI 层 -->
    <div class="game-ui">
      <div class="top-bar">
        <button class="back-btn">‹ 返回大厅</button>
        <div class="balance">残高: ¥ 10,000</div>
      </div>

      <div class="bottom-panel">
        <h2>选择你的赛马</h2>
        <div class="horse-list">
          <div class="horse-card">1号 赤兔</div>
          <div class="horse-card">2号 乌骓</div>
          <div class="horse-card">3号 的卢</div>
        </div>
        <button class="bet-btn">下注 ¥500 挑战</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 这里可以接入你的游戏逻辑
</script>

<style scoped>
.real-race-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  font-family: 'Noto Sans JP', sans-serif;
}

/* 视频铺满全屏 */
.race-video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  object-fit: cover;
}

/* 顶部和底部的黑色渐变，这是游戏 UI 设计的标配 */
.video-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom, 
    rgba(5, 5, 8, 0.9) 0%, 
    rgba(5, 5, 8, 0.2) 20%, 
    rgba(5, 5, 8, 0.2) 70%, 
    rgba(5, 5, 8, 0.95) 100%
  );
  pointer-events: none;
}

/* UI 层 */
.game-ui {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  z-index: 10;
}

/* 顶部信息 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  backdrop-filter: blur(10px);
}
.balance {
  background: rgba(15, 23, 42, 0.8);
  color: #38bdf8;
  padding: 8px 16px;
  border-radius: 12px;
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

/* 底部下注面板 */
.bottom-panel {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}
.bottom-panel h2 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #e2e8f0;
}
.horse-list {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.horse-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px;
  text-align: center;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
}
.horse-card:hover {
  background: rgba(232, 56, 98, 0.2);
  border-color: #e83862;
}
.bet-btn {
  width: 100%;
  background: linear-gradient(135deg, #e83862, #f43f5e);
  color: white;
  border: none;
  padding: 18px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 900;
  box-shadow: 0 10px 20px rgba(232, 56, 98, 0.3);
}
</style>