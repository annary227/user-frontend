<template>
  <div class="quick-one-layout">
    <!-- 引入顶部导航组件 -->
    <AppHeader />

    <main class="main-content">
      <!-- 渐变横幅 -->
      <div class="banner">
        <div class="banner-left">
          <!-- 横幅文案依然保留全站最高 1000万 の宣传，但各游戏卡片内已按比例调整 -->
          <span class="highlight-badge">最高当せん金 1000万円！</span>
          <h2>待ち時間なし！購入した瞬間に結果がわかる！</h2>
          <p>選んで・買って・すぐ挑戦！スキップ機能で一括抽選も対応。</p>
        </div>
        <button class="banner-btn">今すぐチャレンジ ↓</button>
      </div>

      <div class="section-title">
        <h3>🎮 ゲームラインナップ</h3>
        <span>全8種類</span>
      </div>

      <div class="game-grid">
        <!-- 循环渲染卡片组件 -->
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
          @play="$router.push({ path: '/gacha', query: { name: game.title, price: game.price, icon: game.icon } })"
        />
      </div>

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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request';
import GameCard from '../components/GameCard.vue';
import AppHeader from '../components/AppHeader.vue';

const router = useRouter();
const records = ref([]);

// 🆕 8个核心游戏列表（根据价格动态设定最高奖金：价格 * 10000）
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

// 格式化时间 (适配日语格式)
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleString('ja-JP', { hour12: false });
};

// 页面挂载时获取真实数据
onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    router.push('/login');
    return;
  }
  
  const user = JSON.parse(storedUser);
  
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

/* 游戏列表 */
.section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.section-title h3 { margin: 0; font-size: 18px; color: #e83862; }
.section-title span { font-size: 12px; color: #888; }
.game-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 30px; }

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

/* =========================================
   手机端极致适配
   ========================================= */
@media (max-width: 768px) {
  .main-content { padding: 12px; }

  .banner { 
    flex-direction: column; 
    text-align: center; 
    gap: 15px; 
    padding: 20px 15px; 
  }
  .banner h2 { font-size: 18px; }
  .banner-btn { width: 100%; padding: 14px; font-size: 15px; }

  .game-grid { 
    grid-template-columns: 1fr; 
    gap: 15px; 
  }

  .history-section { 
    padding: 15px; 
    border-radius: 12px;
  }
  .history-table-header { 
    display: none; 
  }
  
  .history-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 15px;
    margin-bottom: 12px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    text-align: left;
  }
  .history-row:last-child { margin-bottom: 0; }

  .history-row span {
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 14px;
  }
  .history-row span::before {
    content: attr(data-label);
    color: #94a3b8;
    font-size: 13px;
    margin-right: 15px;
  }

  .history-row span[data-label="当せん結果"] {
    font-weight: bold;
    font-size: 15px;
    border-top: 1px dashed #e2e8f0;
    padding-top: 10px;
    margin-top: 5px;
  }
}
</style>