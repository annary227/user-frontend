<template>
  <header class="top-header-wrapper">
    <!-- 🆕 顶部滚动播报条 -->
    <div class="ticker-banner">
      <div class="ticker-label">
        <span class="dot"></span> 当せん速報
      </div>
      <div class="ticker-content">
        <Transition name="slide-up" mode="out-in">
          <div class="news-item" :key="currentNews.id">
            <span class="time">{{ currentNews.time }}</span>
            <span class="name">{{ currentNews.name }} さん</span> が 
            <span class="game">{{ currentNews.game }}</span> で 
            <span class="prize">{{ currentNews.prize }}</span> を獲得しました！
          </div>
        </Transition>
      </div>
    </div>

    <!-- 原有的 Header 内容 -->
    <div class="top-header">
      <div class="logo-area" @click="$router.push('/')">
        <div class="logo-icon">Q</div>
        <div class="logo-text">
          <h1>クイックワン <span class="online-badge">ONLINE</span></h1>
          <p>ネット専用いつでも秒で当たる宝くじ</p>
        </div>
      </div>
      
      <div class="user-area">
        <div class="sound-icon">🔊</div>
        
        <!-- 动态余额 -->
        <div class="balance-box">
          <span class="balance-label">残高</span>
          <span class="balance-amount">¥{{ userBalance.toLocaleString() }}</span>
        </div>
        
        <!-- 入金 和 出金 -->
        <button class="charge-btn deposit-btn" @click="$router.push('/profile')">入金</button>
        <button class="charge-btn withdraw-btn" @click="$router.push('/profile')">出金</button>

        <!-- 个人中心 -->
        <div class="user-profile">
          <span class="username" @click="$router.push('/profile')">
            {{ username }} 様
          </span>
          <button class="profile-btn" @click="$router.push('/profile')">マイページ</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request'; 

const router = useRouter();
const userBalance = ref(0);
const username = ref('ゲスト');

// ==========================================
// 🆕 播报系统逻辑
// ==========================================
const currentNews = ref({ id: 0, time: '14:03', name: 'ゲスト', game: 'ゲーム', prize: '10円' });
let timer = null;

// 日文随机昵称
const randomNames = ['タカシ', 'ユウキ', 'ミキ', 'サクラ', 'リョウ', 'アヤ', 'ケンタ', 'ユナ', 'ソウタ', 'ハルカ', 'ケビン', 'マイケル', 'ジョン', 'エミリ'];
// 你的游戏列表
const gameNames = ['金魚すくい', 'ダーツチャレンジ', 'クレーンゲーム', 'ガチャポン', 'スクラッチ', 'ルーレット', '宝探し', 'スロット'];

// 🎯 真实奖池分布（根据你提供的奖池，极小奖最容易出）
const prizeWeights = [
  { name: '10円', weight: 40 },     // 40% 概率
  { name: '50円', weight: 25 },     // 25% 概率
  { name: '100円', weight: 15 },    // 15% 概率
  { name: '200円', weight: 8 },     
  { name: '500円', weight: 5 },     
  { name: '1,000円', weight: 3 },   
  { name: '10,000円', weight: 1.5 }, 
  { name: '100,000円', weight: 0.5 },
  { name: '200万円', weight: 0.01 }, // 极小概率出大奖
  { name: '500万円', weight: 0.005 }
];

const getRandomPrize = () => {
  const totalWeight = prizeWeights.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < prizeWeights.length; i++) {
    if (random < prizeWeights[i].weight) {
      return prizeWeights[i].name;
    }
    random -= prizeWeights[i].weight;
  }
  return prizeWeights[0].name;
};

const generateNews = () => {
  const now = new Date();
  // 生成 HH:mm 格式的时间
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  currentNews.value = {
    id: Date.now(), // 用于触发 Vue 过渡动画
    time: timeStr,
    name: randomNames[Math.floor(Math.random() * randomNames.length)],
    game: gameNames[Math.floor(Math.random() * gameNames.length)],
    prize: getRandomPrize()
  };
};

// ==========================================
// 获取用户信息
// ==========================================
onMounted(async () => {
  // 启动播报，每 3.5 秒切换一次
  generateNews();
  timer = setInterval(generateNews, 3500);

  // 获取用户数据
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  
  const user = JSON.parse(storedUser);
  username.value = user.username;
  
  try {
    const infoRes = await request.get(`/user/info/${user.id}`);
    if (infoRes.data.success) {
      userBalance.value = infoRes.data.user.balance;
    }
  } catch (error) {
    console.error("获取余额失败", error);
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
/* 🆕 滚动播报条整体样式 */
.top-header-wrapper {
  position: sticky; top: 0; z-index: 100;
}

.ticker-banner {
  background: #0f172a; /* 深色背景 */
  display: flex;
  align-items: center;
  height: 40px;
  overflow: hidden;
  color: white;
  font-size: 13px;
  font-weight: 500;
}

.ticker-label {
  background: #e83862; /* 红色标签 */
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-weight: 900;
  font-size: 14px;
  clip-path: polygon(0 0, 100% 0, 95% 100%, 0% 100%); /* 右侧斜切角效果 */
  z-index: 2;
  white-space: nowrap;
}

.ticker-label .dot {
  width: 8px; height: 8px; background: white; border-radius: 50%; margin-right: 8px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.ticker-content {
  flex: 1;
  padding-left: 20px;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.news-item {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.news-item .time { color: #64748b; font-size: 12px; }
.news-item .name { color: #38bdf8; font-weight: bold; }
.news-item .game { color: #cbd5e1; }
.news-item .prize { color: #fde047; font-weight: bold; font-size: 14px; } /* 金色高亮金额 */

/* 动画效果：从下往上滑入 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* ================= 原有的 Header ================= */
.top-header {
  background: #fff; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eaeaea;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  font-family: 'Noto Sans JP', sans-serif;
}
.logo-area { display: flex; align-items: center; gap: 15px; cursor: pointer; }
.logo-icon { width: 40px; height: 40px; background: #e83862; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 24px; font-weight: bold; font-family: serif; flex-shrink: 0; }
.logo-text h1 { margin: 0; font-size: 20px; color: #e83862; display: flex; align-items: center; gap: 8px; font-weight: 900; white-space: nowrap; }
.online-badge { font-size: 10px; background: #fce4e8; color: #e83862; padding: 2px 6px; border-radius: 4px; }
.logo-text p { margin: 3px 0 0; font-size: 12px; color: #888; }

/* 右侧区域 */
.user-area { display: flex; align-items: center; gap: 12px; }
.sound-icon { background: #f0f0f0; width: 35px; height: 35px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: #666; cursor: pointer; flex-shrink: 0; }

.balance-box { background: #0f172a; color: #fff; padding: 8px 15px; border-radius: 25px; display: flex; align-items: center; gap: 10px; font-size: 14px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2); flex-shrink: 0; }
.balance-label { font-size: 10px; color: #94a3b8; }
.balance-amount { font-weight: 900; font-size: 16px; color: #38bdf8; font-family: monospace; }

/* 入金/出金按钮 */
.charge-btn { border: none; padding: 8px 20px; border-radius: 20px; font-weight: 900; cursor: pointer; transition: 0.2s; white-space: nowrap; font-size: 14px; }
.deposit-btn { background: linear-gradient(180deg, #10b981, #059669); color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.withdraw-btn { background: linear-gradient(180deg, #ffcc00, #ffb300); color: #333; box-shadow: 0 4px 10px rgba(255, 204, 0, 0.3); }
.charge-btn:hover { transform: translateY(-2px); }

/* 个人中心入口 */
.user-profile { display: flex; align-items: center; gap: 12px; margin-left: 10px; padding-left: 15px; border-left: 1px solid #eaeaea; flex-shrink: 0; }
.username { font-size: 14px; font-weight: bold; color: #1e293b; cursor: pointer; transition: color 0.2s; white-space: nowrap; }
.username:hover { color: #e83862; text-decoration: underline; }

/* 个人中心按钮 */
.profile-btn { 
  background: #1e293b; color: #ffffff; border: none; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer; transition: 0.2s; white-space: nowrap; box-shadow: 0 4px 10px rgba(30, 41, 59, 0.2);
}
.profile-btn:hover { background: #0f172a; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(30, 41, 59, 0.3); }

/* ================= 📱 手机端 ================= */
@media (max-width: 768px) {
  .ticker-label { padding: 0 10px; font-size: 12px; clip-path: none; } /* 手机端取消斜角 */
  .ticker-content { padding-left: 10px; font-size: 12px; }
  .news-item { gap: 5px; }
  .news-item .prize { font-size: 13px; }

  .top-header { padding: 10px 15px; flex-direction: column; gap: 12px; }
  .logo-area { width: 100%; justify-content: center; }
  .logo-text p { display: none; }
  .logo-text h1 { font-size: 18px; }
  .user-area { width: 100%; justify-content: space-between; gap: 8px; }
  .sound-icon { display: none; }
  .balance-box { padding: 6px 12px; flex: 1; justify-content: center; }
  .balance-amount { font-size: 15px; }
  .charge-btn { padding: 6px 12px; font-size: 13px; }
  .user-profile { margin-left: 0; padding-left: 10px; border-left: none; gap: 8px; }
  .username { display: none; }
  .profile-btn { padding: 6px 10px; font-size: 12px; }
}
</style>