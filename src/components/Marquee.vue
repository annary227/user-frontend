<template>
  <div class="marquee-container">
    <div class="marquee-label">
      <span class="live-dot"></span> 当せん速報
    </div>
    <div class="marquee-track">
      <!-- 使用 v-for 渲染两遍数据，实现无缝循环滚动 -->
      <div class="marquee-content" v-for="n in 2" :key="n">
        <div v-for="(notice, index) in notices" :key="index" class="notice-item">
          <span class="time">{{ notice.time }}</span>
          <span class="user">{{ notice.user }}</span> さんが
          <span class="game">{{ notice.game }}</span> で
          <span class="prize">{{ notice.prize }}</span> を獲得しました！
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 假数据池
const japaneseNames = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤', '山田', 'マリア', 'ケビン'];
const games = ['金魚すくい', 'ダーツチャレンジ', 'クレーンゲーム', 'ガチャポン'];

// 🆕 根据你的真实 15 个中奖档位配置，去除“不中奖”
const prizes = [
  '10円', '10円', '10円', '10円', '10円',
  '50円', '50円', '50円', '50円',
  '100円', '100円', '100円',
  '200円', '200円',
  '700円',
  '1500円',
  '7700円',
  '27000円',
  '87000円',
  '500万円'
];

const notices = ref([]);

// 生成随机公告
const generateNotice = () => {
  const name = japaneseNames[Math.floor(Math.random() * japaneseNames.length)];
  const game = games[Math.floor(Math.random() * games.length)];
  const prize = prizes[Math.floor(Math.random() * prizes.length)];
  
  // 模拟时间
  const now = new Date();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  return { user: name, game, prize, time };
};

onMounted(() => {
  // 初始化生成 8 条假公告
  for (let i = 0; i < 8; i++) {
    notices.value.push(generateNotice());
  }
});
</script>

<style scoped>
.marquee-container {
  display: flex;
  align-items: center;
  background: #1e293b;
  border-radius: 50px;
  overflow: hidden;
  height: 40px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.1);
  border: 1px solid #334155;
}

.marquee-label {
  background: linear-gradient(135deg, #ef4444, #f43f5e);
  color: white;
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 1px;
  white-space: nowrap;
  z-index: 2;
  box-shadow: 4px 0 10px rgba(0,0,0,0.3);
}

/* 呼吸灯效果 */
.live-dot {
  width: 8px;
  height: 8px;
  background-color: #fff;
  border-radius: 50%;
  margin-right: 8px;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}

.marquee-track {
  display: flex;
  white-space: nowrap;
  animation: scroll 25s linear infinite;
}

.marquee-track:hover {
  animation-play-state: paused; /* 鼠标悬停时暂停滚动 */
}

.marquee-content {
  display: flex;
}

.notice-item {
  color: #cbd5e1;
  font-size: 13px;
  margin-right: 40px;
  display: flex;
  align-items: center;
}

.notice-item .time { color: #64748b; margin-right: 10px; font-size: 12px; }
.notice-item .user { color: #fcd34d; font-weight: bold; }
.notice-item .game { color: #38bdf8; margin: 0 4px; }
.notice-item .prize { color: #ef4444; font-weight: 900; font-size: 14px; margin-left: 4px; text-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); } /* 滚动到一半（因为是两份一模一样的data） */
}
</style>