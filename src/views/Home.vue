<!-- src/views/Home.vue -->
<template>
  <div class="quick-one-layout">
    <!-- 引入顶部导航组件 -->
    <AppHeader />

    <main class="main-content">
      <!-- 渐变横幅 (增加奢华光影) -->
      <div class="banner">
        <div class="banner-content">
          <span class="highlight-badge">最高当せん金 1000万円！</span>
          <h2>待ち時間なし！購入した瞬間に結果がわかる！</h2>
          <p>選んで・買って・すぐ挑戦！スキップ機能で一括抽選も対応。</p>
        </div>
        <button class="banner-btn">今すぐチャレンジ ↓</button>
        <div class="banner-glow"></div>
      </div>

      <!-- 🆕 豪华双列游戏入口 -->
      <div class="game-entry-grid">
        
        <!-- 左侧：转盘游戏 (打开后横跨全屏) -->
        <div class="luxury-folder" :class="{ 'is-open': isFolderOpen }">
          <div class="folder-header" @click="toggleFolder">
            <div class="header-left">
              <div class="icon-box purple-glow">
                <svg class="roulette-icon" :class="{ 'is-spinning': isFolderOpen }" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="url(#grad1)" />
                  <path d="M12 2V6 M12 18V22 M2 12H6 M18 12H22 M5 5L8 8 M16 16L19 19 M5 19L8 16 M16 8L19 5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="12" cy="12" r="4" fill="#fff" />
                  <path d="M12 8L14 12H10L12 8Z" fill="#ef4444" />
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#a855f7" />
                      <stop offset="100%" stop-color="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div class="title-group">
                <h3>ルーレット</h3>
                <span class="sub-title">ルーレットポイントゲーム</span>
              </div>
            </div>
            <div class="header-right">
              <span class="count-badge">全8種類</span>
              <svg class="toggle-arrow" :class="{ 'is-up': isFolderOpen }" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

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
                @play="$router.push({ path: '/gacha', query: { name: game.title, price: game.price, icon: game.icon, balance: userBalance } })"
              />
            </div>
          </div>
        </div>

        <!-- 右侧：MLB 豪华入口 -->
        <div class="luxury-mlb-card" @click="$router.push('/mlb')">
          <div class="mlb-bg-ray"></div>
          <div class="mlb-top">
            <div class="mlb-icon-box red-glow">
              <!-- 🆕 手绘豪华棒球 SVG 图标 -->
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" fill="url(#ball-grad)" stroke="#fff" stroke-width="2"/>
                <path d="M 10 10 C 20 20, 20 28, 10 38" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                <path d="M 38 10 C 28 20, 28 28, 38 38" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                <defs>
                  <linearGradient id="ball-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ef4444" />
                    <stop offset="100%" stop-color="#991b1b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="mlb-live-tag">LIVE</div>
          </div>
          
          <div class="mlb-info">
            <h3>MLB リアルタイム予想</h3>
            <p>メジャーリーグのリアルタイムスコアで高配当を狙え！</p>
          </div>
          
          <div class="mlb-footer">
            <span class="price-text">最低 30,000 pt</span>
            <button class="action-btn">挑戦する ></button>
          </div>
        </div>

      </div>
    </main>

    <!-- 悬浮私聊大厅按钮 -->
    <div class="social-toggle" @click="$router.push('/social')">
      <div class="social-inner">💬</div>
    </div>

    <!-- 悬浮音乐开关 -->
    <div class="music-toggle" @click="toggleMusic">
      <div class="music-inner" :class="{ 'is-playing': isPlaying }">
        {{ isPlaying ? '🔊' : '🔇' }}
      </div>
      <div v-if="isPlaying" class="pulse-ring"></div>
      <audio ref="audioPlayer" loop>
        <source src="/bgm.mp3" type="audio/mpeg" />
      </audio>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request';
import GameCard from '../components/GameCard.vue';
import AppHeader from '../components/AppHeader.vue';

const router = useRouter();
const userBalance = ref(0);
const isFolderOpen = ref(false); 

const toggleFolder = () => {
  isFolderOpen.value = !isFolderOpen.value;
};

// 音乐系统
const audioPlayer = ref(null);
const isPlaying = ref(false);
const toggleMusic = () => {
  if (!audioPlayer.value) return;
  if (isPlaying.value) {
    audioPlayer.value.pause();
    isPlaying.value = false;
  } else {
    audioPlayer.value.play().then(() => { isPlaying.value = true; }).catch((e) => {});
  }
};
onUnmounted(() => { if (audioPlayer.value) audioPlayer.value.pause(); });

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

onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) { router.push('/login'); return; }
  const user = JSON.parse(storedUser);
  try {
    const infoRes = await request.get(`/user/info/${user.id}`);
    if (infoRes.data.success) userBalance.value = infoRes.data.user.balance;
  } catch (error) {}
});
</script>

<style scoped>
/* ---------------- 全局豪华暗黑风 ---------------- */
.quick-one-layout { 
  font-family: 'Noto Sans JP', sans-serif; 
  background: #090e17; /* 极暗电竞深蓝 */
  min-height: 100vh; 
  color: #f8fafc; 
}
.main-content { max-width: 900px; margin: 0 auto; padding: 20px; }

/* ---------------- 渐变横幅 ---------------- */
.banner { 
  background: linear-gradient(100deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%); 
  border-radius: 20px; 
  padding: 30px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  color: white; 
  margin-bottom: 35px; 
  box-shadow: 0 10px 40px rgba(168, 85, 247, 0.2);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.banner-content { position: relative; z-index: 2; }
.highlight-badge { 
  background: linear-gradient(90deg, #fbbf24, #f59e0b); 
  color: #000; 
  font-size: 12px; 
  font-weight: 900; 
  padding: 4px 10px; 
  border-radius: 6px; 
  display: inline-block; 
  margin-bottom: 12px;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
}
.banner h2 { margin: 0 0 8px; font-size: 22px; font-weight: 900; letter-spacing: 1px; }
.banner p { margin: 0; font-size: 14px; color: #d8b4fe; }
.banner-btn { 
  position: relative;
  z-index: 2;
  background: #fff; 
  color: #4c1d95; 
  border: none; 
  padding: 14px 28px; 
  border-radius: 30px; 
  font-weight: 900; 
  font-size: 15px; 
  cursor: pointer; 
  white-space: nowrap;
  transition: all 0.3s;
}
.banner-btn:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(255,255,255,0.4); }

/* ---------------- 豪华双列布局 ---------------- */
.game-entry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: stretch;
}

/* ---------------- 左侧：转盘文件夹 ---------------- */
.luxury-folder {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 22px;
  backdrop-filter: blur(10px);
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.luxury-folder:hover { border-color: rgba(168, 85, 247, 0.5); box-shadow: 0 0 20px rgba(168, 85, 247, 0.15); }
.luxury-folder.is-open { 
  grid-column: span 2; 
  justify-content: flex-start;
  background: rgba(30, 41, 59, 0.8);
}

.folder-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.header-left { display: flex; align-items: center; gap: 15px; }
.icon-box {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; justify-content: center; align-items: center;
}
.purple-glow { background: rgba(168, 85, 247, 0.15); box-shadow: inset 0 0 10px rgba(168, 85, 247, 0.2); }
.roulette-icon { width: 32px; height: 32px; transition: transform 0.5s ease; }
.roulette-icon.is-spinning { transform: rotate(180deg); }
.title-group h3 { margin: 0; font-size: 18px; font-weight: 800; color: #f8fafc; }
.title-group .sub-title { font-size: 12px; color: #94a3b8; }

.header-right { display: flex; align-items: center; gap: 12px; }
.count-badge { background: rgba(255, 255, 255, 0.1); color: #cbd5e1; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
.toggle-arrow { width: 22px; height: 22px; color: #cbd5e1; transition: transform 0.3s; }
.toggle-arrow.is-up { transform: rotate(180deg); }

.folder-content { margin-top: 25px; padding-top: 20px; border-top: 1px dashed rgba(255, 255, 255, 0.1); width: 100%; }
.game-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* ---------------- 右侧：MLB 豪华卡片 ---------------- */
.luxury-mlb-card {
  background: linear-gradient(145deg, #111827, #0b1120);
  border: 1.5px solid #ef4444;
  border-radius: 20px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.1), inset 0 0 20px rgba(239, 68, 68, 0.05);
  transition: all 0.3s ease;
}
.luxury-mlb-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 40px rgba(239, 68, 68, 0.25), inset 0 0 20px rgba(239, 68, 68, 0.1);
}
.mlb-bg-ray {
  position: absolute;
  top: -50%; left: -50%; width: 200%; height: 200%;
  background: conic-gradient(from 0deg at 50% 50%, rgba(239,68,68,0) 0deg, rgba(239,68,68,0.1) 180deg, rgba(239,68,68,0) 360deg);
  animation: rotateRay 15s linear infinite;
  pointer-events: none;
}
@keyframes rotateRay { 100% { transform: rotate(360deg); } }

.mlb-top { display: flex; justify-content: space-between; align-items: flex-start; position: relative; z-index: 2; }
.mlb-icon-box {
  width: 54px; height: 54px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 16px;
  display: flex; justify-content: center; align-items: center;
}
.red-glow { box-shadow: 0 0 20px rgba(239, 68, 68, 0.2); }
.mlb-icon-box svg { width: 40px; height: 40px; filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.6)); }

.mlb-live-tag {
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 900;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
  letter-spacing: 1px;
}

.mlb-info { margin: 20px 0; position: relative; z-index: 2; }
.mlb-info h3 { margin: 0 0 8px; font-size: 18px; font-weight: 900; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.mlb-info p { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; }

.mlb-footer { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2; }
.price-text { color: #fbbf24; font-size: 14px; font-weight: 900; }
.action-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.luxury-mlb-card:hover .action-btn {
  background: #dc2626;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
}

/* ---------------- 悬浮按钮 ---------------- */
.social-toggle { position: fixed; bottom: 105px; right: 30px; width: 60px; height: 60px; background: #3b82f6; border: 1px solid #60a5fa; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); z-index: 999; transition: all 0.3s; }
.social-toggle:hover { transform: scale(1.1) translateY(-5px); box-shadow: 0 15px 30px rgba(59, 130, 246, 0.5); border-color: #93c5fd; }
.social-inner { font-size: 26px; transition: all 0.3s; }
.music-toggle { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: #1e293b; border: 1px solid #334155; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 999; transition: all 0.3s; }
.music-toggle:hover { transform: scale(1.1) translateY(-5px); box-shadow: 0 15px 30px rgba(232, 56, 98, 0.3); border-color: #e83862; }
.music-inner { font-size: 26px; transition: all 0.3s; }

/* ---------------- 手机端适配 ---------------- */
@media (max-width: 768px) {
  .main-content { padding: 12px; }
  .banner { flex-direction: column; text-align: center; padding: 25px 20px; }
  .banner-btn { width: 100%; margin-top: 15px; }
  .game-entry-grid { grid-template-columns: 1fr; gap: 15px; }
  .luxury-folder.is-open { grid-column: span 1; }
  .game-grid { grid-template-columns: 1fr; }
  .social-toggle { bottom: 85px; right: 20px; width: 50px; height: 50px; }
  .music-toggle { bottom: 20px; right: 20px; width: 50px; height: 50px; }
}
</style>