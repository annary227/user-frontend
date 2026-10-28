<!-- src/views/Home.vue -->
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
        
        <!-- 文件夹标题/入口按钮 -->
        <div class="folder-header" @click="toggleFolder">
          <div class="title-left">
            <svg class="roulette-icon" :class="{ 'is-spinning': isFolderOpen }" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="11" fill="url(#grad1)" stroke="#cbd5e1" stroke-width="1"/>
              <path d="M12 2V6 M12 18V22 M2 12H6 M18 12H22 M5 5L8 8 M16 16L19 19 M5 19L8 16 M16 8L19 5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="4" fill="#fff" />
              <path d="M12 8L14 12H10L12 8Z" fill="#ef4444" />
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
            <svg class="toggle-arrow" :class="{ 'is-up': isFolderOpen }" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- 游戏列表 -->
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
                query: { name: game.title, price: game.price, icon: game.icon, balance: userBalance } 
              })"
            />
          </div>
        </div>
      </div>

      <!-- 🆕 MLB 竞猜专属卡片组件 -->
      <MlbCard />
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
import MlbCard from '../components/MlbCard.vue';

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
/* 全局布局 */
.quick-one-layout { font-family: 'Noto Sans JP', sans-serif; background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%); min-height: 100vh; color: #333; }
.main-content { max-width: 900px; margin: 0 auto; padding: 20px; }

/* 渐变横幅 */
.banner { background: linear-gradient(90deg, #e83862 0%, #ff8c00 100%); border-radius: 12px; padding: 25px 30px; display: flex; justify-content: space-between; align-items: center; color: white; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(232, 56, 98, 0.2); }
.banner-left { flex: 1; }
.highlight-badge { background: #ffcc00; color: #333; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 10px; }
.banner h2 { margin: 0 0 5px; font-size: 20px; }
.banner p { margin: 0; font-size: 14px; opacity: 0.9; }
.banner-btn { background: white; color: #e83862; border: none; padding: 12px 25px; border-radius: 25px; font-weight: bold; font-size: 14px; cursor: pointer; white-space: nowrap; }

/* 文件夹分类容器 */
.category-folder { background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.9); border-radius: 20px; padding: 20px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; }
.category-folder.is-open { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(10px); }
.folder-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 5px; cursor: pointer; user-select: none; }
.folder-header:hover .title-left h3 { color: #e83862; }
.title-left { display: flex; align-items: center; gap: 12px; }
.roulette-icon { width: 32px; height: 32px; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.2)); }
.roulette-icon.is-spinning { transform: rotate(180deg); }
.folder-header h3 { margin: 0; font-size: 20px; color: #1e293b; font-weight: 800; transition: color 0.2s; }
.header-right { display: flex; align-items: center; gap: 15px; }
.count-badge { background: #f1f5f9; color: #64748b; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; border: 1px solid #e2e8f0; }
.toggle-arrow { width: 24px; height: 24px; color: #e83862; background: #ffe4e6; border-radius: 50%; padding: 4px; transition: transform 0.3s ease, background 0.3s; }
.toggle-arrow.is-up { transform: rotate(180deg); background: #fecdd3; }
.folder-content { padding-top: 15px; border-top: 2px dashed #e2e8f0; margin-top: 10px; }
.game-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* 悬浮按钮 */
.social-toggle { position: fixed; bottom: 105px; right: 30px; width: 60px; height: 60px; background: #3b82f6; border: 1px solid #60a5fa; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); z-index: 999; transition: all 0.3s; }
.social-toggle:hover { transform: scale(1.1) translateY(-5px); box-shadow: 0 15px 30px rgba(59, 130, 246, 0.5); border-color: #93c5fd; }
.social-inner { font-size: 26px; transition: all 0.3s; }
.social-toggle:hover .social-inner { animation: bounce 0.8s infinite alternate; }

.music-toggle { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: #1e293b; border: 1px solid #334155; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 999; transition: all 0.3s; }
.music-toggle:hover { transform: scale(1.1) translateY(-5px); box-shadow: 0 15px 30px rgba(232, 56, 98, 0.3); border-color: #e83862; }
.music-inner { font-size: 26px; transition: all 0.3s; }
.music-inner.is-playing { animation: bounce 0.8s infinite alternate; }
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }
.pulse-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #e83862; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.6); opacity: 0; } }

/* 手机端适配 */
@media (max-width: 768px) {
  .main-content { padding: 12px; }
  .banner { flex-direction: column; text-align: center; gap: 15px; padding: 20px 15px; }
  .banner h2 { font-size: 18px; }
  .banner-btn { width: 100%; padding: 14px; font-size: 15px; }
  .category-folder { padding: 15px; border-radius: 16px; }
  .folder-header { flex-direction: row; align-items: center; }
  .header-right { gap: 8px; }
  .folder-header h3 { font-size: 17px; }
  .game-grid { grid-template-columns: 1fr; gap: 15px; }
  .social-toggle { bottom: 85px; right: 20px; width: 50px; height: 50px; }
  .social-inner { font-size: 22px; }
  .music-toggle { bottom: 20px; right: 20px; width: 50px; height: 50px; }
  .music-inner { font-size: 22px; }
}
</style>