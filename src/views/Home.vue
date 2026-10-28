<template>
  <div class="quick-one-layout">
    <!-- 引入顶部导航组件 -->
    <AppHeader />

    <main class="main-content">
      <!-- 渐变横幅 -->
      <div class="banner">
        <div class="banner-left">
          <span class="highlight-badge">最高当せん金 1000万円！</span>
          <h2>待ち時間なし！購入した瞬間に結果がわかる！</h2>
          <p>選んで・買って・すぐ挑戦！スキップ機能で一括抽選も対応。</p>
        </div>
        <button class="banner-btn">今すぐチャレンジ ↓</button>
      </div>

      <!-- ================= 🆕 转盘积分游戏 折叠文件夹容器 ================= -->
      <div class="category-folder" :class="{ 'is-open': isFolderOpen }">
        
        <!-- 文件夹标题/入口按钮 (点击这里展开/收起) -->
        <div class="folder-header" @click="toggleFolder">
          <div class="title-left">
            <!-- 🆕 自定义现代感转盘 SVG 图标 -->
            <svg class="roulette-icon" :class="{ 'is-spinning': isFolderOpen }" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 外圈渐变 -->
              <circle cx="12" cy="12" r="11" fill="url(#grad1)" stroke="#cbd5e1" stroke-width="1"/>
              <!-- 内部刻度线 -->
              <path d="M12 2V6 M12 18V22 M2 12H6 M18 12H22 M5 5L8 8 M16 16L19 19 M5 19L8 16 M16 8L19 5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
              <!-- 中心圆点 -->
              <circle cx="12" cy="12" r="4" fill="#fff" />
              <!-- 中心指针 -->
              <path d="M12 8L14 12H10L12 8Z" fill="#ef4444" />
              <!-- 渐变色定义 -->
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#fbbf24" />
                  <stop offset="100%" stop-color="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
            <h3>ルーレットポイントゲーム</h3>
          </div>
          
          <div class="header-right">
            <span class="count-badge">全8種類</span>
            <!-- 🆕 换成更现代的箭头 -->
            <svg class="toggle-arrow" :class="{ 'is-up': isFolderOpen }" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- 游戏列表 (只有展开时才显示) -->
        <div class="folder-content" v-show="isFolderOpen">
          <div class="game-grid">
            <GameCard 
              v-for="game in games" 
              :key="game.title"
              :title="game.title"
              :desc="game.desc"
              :price="game.price"
              :maxPrize="game.maxPrize"
              :icon="game.icon"
              :color="game.color"
              :btnColor="game.color"
              @play="$router.push({ 
                path: '/gacha', 
                query: { 
                  name: game.title, 
                  price: game.price, 
                  icon: game.icon,
                  balance: userBalance
                } 
              })"
            />
          </div>
        </div>
      </div>
      <!-- ================= 转盘积分游戏 文件夹容器结束 ================= -->


      <!-- ================= 🆕 MLB 竞猜专属卡片 (独立放在外面) ================= -->
      <div class="mlb-game-card is-disabled" @click="handleMlbClick">
        <!-- 红色角标：已改为 準備中 -->
        <div class="mlb-live-badge">
          <span class="dot"></span> 準備中
        </div>
        
        <div class="mlb-icon">⚾</div>
        
        <div class="mlb-info">
          <div class="mlb-title-row">
            <h4>MLB リアルタイム予想</h4>
          </div>
          <p class="mlb-desc">メジャーリーグのリアルタイムスコアで高配当を狙え！</p>
          <div class="mlb-bottom-row">
            <span class="mlb-price">最低 30,000 pt</span>
            <button class="mlb-btn" disabled>準備中</button>
          </div>
        </div>
      </div>
      <!-- ================= MLB 竞猜专属卡片结束 ================= -->


      <!-- 底部历史记录 -->
      <div class="history-section">
        <div class="history-header">
          <h3>🕒 最近の購入履歴</h3>
          <span style="color: #888; cursor: pointer;">🗑️ 履歴クリア</span>
        </div>
        
        <!-- 桌面端表头 (手机端会隐藏) -->
        <div class="history-table-header">
          <span>日時</span><span>ゲーム名</span><span>購入数</span><span>支払額</span><span>当せん結果</span>
        </div>

        <!-- 动态数据列表 -->
        <div class="history-list" v-if="records.length > 0">
          <div v-for="row in records" :key="row.id" class="history-row">
            <span class="time-text" data-label="日時">{{ formatTime(row.created_at) }}</span>
            <span data-label="ゲーム名">{{ row.game_name }}</span>
            <span data-label="購入数">1回</span>
            <span data-label="支払額">¥{{ row.cost.toLocaleString() }}</span>
            <span data-label="当せん結果" :class="row.prize_value > 0 ? 'win-text' : 'lose-text'">
              {{ row.prize_name }}
            </span>
          </div>
        </div>
        
        <!-- 无数据时的占位 -->
        <div class="history-empty" v-else>
          <span>↓</span><br>
          購入履歴はありません。
        </div>
      </div>
    </main>

    <!-- 🆕 悬浮私聊大厅按钮 -->
    <div class="social-toggle" @click="$router.push('/social')">
      <div class="social-inner">💬</div>
    </div>

    <!-- 悬浮音乐开关 -->
    <div class="music-toggle" @click="toggleMusic">
      <div class="music-inner" :class="{ 'is-playing': isPlaying }">
        {{ isPlaying ? '🔊' : '🔇' }}
      </div>
      <!-- 播放时的呼吸外圈 -->
      <div v-if="isPlaying" class="pulse-ring"></div>
      
      <!-- 播放本地音乐 -->
      <audio ref="audioPlayer" loop>
        <source src="/bgm.mp3" type="audio/mpeg" />
      </audio>
    </div>

    <!-- 🆕 自定义日文提示框 (Toast) -->
    <transition name="fade">
      <div v-if="showToast" class="custom-toast">
        🚧 この機能は現在準備中です。今しばらくお待ちください！
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request';
import GameCard from '../components/GameCard.vue';
import AppHeader from '../components/AppHeader.vue';

const router = useRouter();
const records = ref([]);
const userBalance = ref(0);
const showToast = ref(false); 
const isFolderOpen = ref(false); // 🆕 控制文件夹是否展开 (默认关闭)

// 🆕 切换文件夹展开/收起
const toggleFolder = () => {
  isFolderOpen.value = !isFolderOpen.value;
};

// ==========================================
// 🆕 游戏厅纯音乐系统
// ==========================================
const audioPlayer = ref(null);
const isPlaying = ref(false);

const toggleMusic = () => {
  if (!audioPlayer.value) return;
  if (isPlaying.value) {
    audioPlayer.value.pause();
    isPlaying.value = false;
  } else {
    audioPlayer.value.play().then(() => {
      isPlaying.value = true;
    }).catch((e) => {
      console.log("音频播放被浏览器拦截", e);
    });
  }
};

onUnmounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
  }
});

// ==========================================
// 数据逻辑
// ==========================================
const games = ref([
  { title: '金魚すくい', desc: 'ポイを破らずに金魚を救え！', price: 200, maxPrize: '¥2,000,000', icon: '🐟', color: '#2ed573' },
  { title: 'ダーツチャレンジ', desc: 'ブルの真ん中を狙い撃て！', price: 100, maxPrize: '¥1,000,000', icon: '🎯', color: '#ff4757' },
  { title: 'クレーンゲーム', desc: '超豪華プライズをゲットせよ！', price: 300, maxPrize: '¥3,000,000', icon: '🏗️', color: '#0abde3' },
  { title: 'ガチャポン', desc: '金のカプセルを引き当てろ！', price: 500, maxPrize: '¥5,000,000', icon: '🎰', color: '#a55eea' },
  { title: 'スクラッチ', desc: '削って当てる！お手軽スクラッチ', price: 50, maxPrize: '¥500,000', icon: '🪙', color: '#ffa502' },
  { title: 'ルーレット', desc: '大富豪専用！超高額ルーレット', price: 1000, maxPrize: '¥10,000,000', icon: '🎡', color: '#e84118' },
  { title: '宝探し', desc: '古代の財宝を見つけ出せ！', price: 300, maxPrize: '¥3,000,000', icon: '💎', color: '#009432' },
  { title: 'スロット', desc: '7を揃えて大当たりを狙え！', price: 500, maxPrize: '¥5,000,000', icon: '🍒', color: '#f39c12' }
]);

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleString('ja-JP', { hour12: false });
};

const handleMlbClick = () => {
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 2000);
};

onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    router.push('/login');
    return;
  }
  
  const user = JSON.parse(storedUser);
  
  try {
    const infoRes = await request.get(`/user/info/${user.id}`);
    if (infoRes.data.success) {
      userBalance.value = infoRes.data.user.balance;
    }
  } catch (error) {
    console.error("获取余额失败", error);
  }

  try {
    const recRes = await request.get(`/user/records/${user.id}`);
    if (recRes.data.success) {
      records.value = recRes.data.records;
    }
  } catch (error) {
    console.error("获取数据失败", error);
  }
});
</script>

<style scoped>
/* 全局布局 */
.quick-one-layout { 
  font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif; 
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%); 
  min-height: 100vh; 
  color: #333; 
}
.main-content { max-width: 900px; margin: 0 auto; padding: 20px; }

/* 渐变横幅 */
.banner { background: linear-gradient(90deg, #e83862 0%, #ff8c00 100%); border-radius: 12px; padding: 25px 30px; display: flex; justify-content: space-between; align-items: center; color: white; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(232, 56, 98, 0.2); }
.banner-left { flex: 1; }
.highlight-badge { background: #ffcc00; color: #333; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 10px; }
.banner h2 { margin: 0 0 5px; font-size: 20px; }
.banner p { margin: 0; font-size: 14px; opacity: 0.9; }
.banner-btn { background: white; color: #e83862; border: none; padding: 12px 25px; border-radius: 25px; font-weight: bold; font-size: 14px; cursor: pointer; white-space: nowrap; }

/* ================= 🆕 文件夹分类容器样式 ================= */
.category-folder {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

/* 展开时的背景略微加深 */
.category-folder.is-open {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

/* 标题区域/点击开关 */
.folder-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 10px 5px;
  cursor: pointer; /* 变成小手，提示可以点击 */
  user-select: none;
}
.folder-header:hover .title-left h3 {
  color: #e83862;
}
.title-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 🆕 自定义 SVG 转盘图标样式 */
.roulette-icon {
  width: 32px;
  height: 32px;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.2));
}
.roulette-icon.is-spinning {
  transform: rotate(180deg);
}

.folder-header h3 { 
  margin: 0; 
  font-size: 20px; 
  color: #1e293b; 
  font-weight: 800;
  transition: color 0.2s;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}
.count-badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid #e2e8f0;
}

/* 🆕 自定义 SVG 展开箭头样式 */
.toggle-arrow {
  width: 24px;
  height: 24px;
  color: #e83862;
  background: #ffe4e6;
  border-radius: 50%;
  padding: 4px;
  transition: transform 0.3s ease, background 0.3s;
}
.toggle-arrow.is-up {
  transform: rotate(180deg);
  background: #fecdd3;
}

/* 内部内容区 (展开部分) */
.folder-content {
  padding-top: 15px;
  border-top: 2px dashed #e2e8f0;
  margin-top: 10px;
}

/* 游戏列表网格 */
.game-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* ================= 🆕 MLB 竞猜专属卡片样式 (独立在外) ================= */
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

/* 禁用状态 */
.mlb-game-card.is-disabled {
  cursor: not-allowed;
  opacity: 0.75; 
}

.mlb-game-card.is-disabled:hover {
  transform: none; 
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.15); 
  border-color: #ef4444;
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

.mlb-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mlb-title-row h4 {
  margin: 0 0 5px;
  color: #f8fafc;
  font-size: 16px;
  font-weight: bold;
}

.mlb-desc {
  color: #94a3b8;
  font-size: 12px;
  margin: 0 0 15px;
  line-height: 1.4;
}

.mlb-bottom-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mlb-price {
  color: #fbbf24;
  font-size: 14px;
  font-weight: bold;
}

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

.mlb-game-card:hover .mlb-btn {
  background: #dc2626;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
}

/* 禁用状态的按钮样式 */
.mlb-btn:disabled {
  background: #64748b; 
  cursor: not-allowed;
}

.mlb-game-card.is-disabled:hover .mlb-btn {
  background: #64748b; 
  box-shadow: none; 
}

/* 底部历史记录 (桌面端) */
.history-section { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
.history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.history-header h3 { margin: 0; font-size: 16px; }
.history-table-header { display: grid; grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr; background: #f8f9fa; padding: 12px 10px; font-size: 13px; color: #666; border-radius: 6px; text-align: center; font-weight: bold; }
.history-row { display: grid; grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr; padding: 12px 10px; border-bottom: 1px solid #f0f0f0; font-size: 13px; text-align: center; align-items: center; }
.history-row:last-child { border-bottom: none; }
.time-text { color: #888; font-size: 12px; }
.win-text { color: #e83862; font-weight: bold; }
.lose-text { color: #999; }
.history-empty { text-align: center; padding: 40px; color: #aaa; font-size: 14px; }

/* 悬浮私聊大厅按钮 */
.social-toggle { position: fixed; bottom: 105px; right: 30px; width: 60px; height: 60px; background: #3b82f6; border: 1px solid #60a5fa; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); z-index: 999; transition: all 0.3s; }
.social-toggle:hover { transform: scale(1.1) translateY(-5px); box-shadow: 0 15px 30px rgba(59, 130, 246, 0.5); border-color: #93c5fd; }
.social-inner { font-size: 26px; transition: all 0.3s; }
.social-toggle:hover .social-inner { animation: bounce 0.8s infinite alternate; }

/* 悬浮游戏厅音乐系统 */
.music-toggle { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: #1e293b; border: 1px solid #334155; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 999; transition: all 0.3s; }
.music-toggle:hover { transform: scale(1.1) translateY(-5px); box-shadow: 0 15px 30px rgba(232, 56, 98, 0.3); border-color: #e83862; }
.music-inner { font-size: 26px; transition: all 0.3s; }
.music-inner.is-playing { animation: bounce 0.8s infinite alternate; }
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.pulse-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #e83862; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.6); opacity: 0; } }

/* 🆕 自定义日文提示框 (Toast) 样式 */
.custom-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(15, 23, 42, 0.95); 
  color: #fff;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: bold;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 9999;
  text-align: center;
  pointer-events: none; 
  white-space: nowrap;
}

/* 提示框淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}

/* 手机端适配 */
@media (max-width: 768px) {
  .main-content { padding: 12px; }
  .banner { flex-direction: column; text-align: center; gap: 15px; padding: 20px 15px; }
  .banner h2 { font-size: 18px; }
  .banner-btn { width: 100%; padding: 14px; font-size: 15px; }
  
  /* 手机端文件夹容器适配 */
  .category-folder { padding: 15px; border-radius: 16px; }
  .folder-header { flex-direction: row; align-items: center; }
  .header-right { gap: 8px; }
  .folder-header h3 { font-size: 17px; }
  .game-grid { grid-template-columns: 1fr; gap: 15px; }

  .history-section { padding: 15px; border-radius: 12px; }
  .history-table-header { display: none; }
  .history-row { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 15px; margin-bottom: 12px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; text-align: left; }
  .history-row:last-child { margin-bottom: 0; }
  .history-row span { display: flex; justify-content: space-between; width: 100%; font-size: 14px; }
  .history-row span::before { content: attr(data-label); color: #94a3b8; font-size: 13px; margin-right: 15px; }
  .history-row span[data-label="当せん結果"] { font-weight: bold; font-size: 15px; border-top: 1px dashed #e2e8f0; padding-top: 10px; margin-top: 5px; }
  
  .social-toggle { bottom: 85px; right: 20px; width: 50px; height: 50px; }
  .social-inner { font-size: 22px; }
  .music-toggle { bottom: 20px; right: 20px; width: 50px; height: 50px; }
  .music-inner { font-size: 22px; }
  
  .custom-toast {
    font-size: 13px;
    padding: 12px 18px;
    width: 85%;
    white-space: normal;
  }
}
</style>