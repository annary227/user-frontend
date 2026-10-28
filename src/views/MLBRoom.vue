<!-- src/views/MLBRoom.vue -->
<template>
  <div class="mlb-room-layout">
    <AppHeader />

    <main class="main-content">
      <div class="room-header">
        <button class="back-btn" @click="$router.push('/')">＜ 戻る</button>
        <h2>⚾ リアルタイム予想 大厅</h2>
        <div class="balance-box">残高: {{ userBalance.toLocaleString() }} pt</div>
      </div>

      <!-- 赛事列表区 -->
      <div class="games-container" v-if="games.length > 0">
        <div 
          v-for="game in games" 
          :key="game.game_pk" 
          class="match-card"
          @click="goToMatchRoom(game)"
        >
          <!-- 状态栏 -->
          <div class="status-bar" :class="game.status.toLowerCase()">
            <!-- 🆕 仅修改此处：加上了日本时间 -->
            <span v-if="game.status === 'Preview'">試合前 ({{ formatJST(game.game_date) }} JST)</span>
            <span v-else-if="game.status === 'Live'" class="live-text">
              <span class="live-dot"></span> 試合中 ({{ game.inning_half === 'Top' ? '表' : '裏' }} 第{{ game.current_inning }}回)
            </span>
            <span v-else-if="game.status === 'Final'">試合終了</span>
          </div>

          <!-- 对战队伍 -->
          <div class="teams-display">
            <div class="team-row">
              <span class="team-label away-label">客</span>
              <span class="team-name">{{ game.away_team }}</span>
            </div>
            <div class="vs-text">VS</div>
            <div class="team-row">
              <span class="team-label home-label">主</span>
              <span class="team-name">{{ game.home_team }}</span>
            </div>
          </div>

          <!-- 比分 / 比分盘口入口 -->
          <div class="score-display">
            <span class="score-text">{{ game.away_score }} - {{ game.home_score }}</span>
            <div class="action-btn">予想する ＞</div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p style="font-size: 24px; margin-bottom: 10px;">🏟️</p>
        <p>本日の試合はありません。</p>
        <p style="font-size: 13px; margin-top: 10px; color: #64748b;">
          現在、新しい試合データを取得しています。しばらくお待ちください。
        </p>
      </div>
    </main>

    <!-- 🆕 替换 alert 的高颜值日文 Toast 提示 -->
    <transition name="fade">
      <div v-if="toast.show" class="custom-toast">
        {{ toast.msg }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request'; 
import AppHeader from '../components/AppHeader.vue';

const router = useRouter();
const games = ref([]);
const userBalance = ref(0);
let pollTimer = null;

// 🆕 新增：Toast 提示状态
const toast = reactive({ show: false, msg: '' });
const showToast = (msg) => {
  toast.msg = msg;
  toast.show = true;
  setTimeout(() => { toast.show = false; }, 2000);
};

// 🆕 新增：格式化日本时间函数
const formatJST = (dateString) => {
  if (!dateString) return '--:--';
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// 获取比赛列表
const fetchGames = async () => {
  try {
    // 请求后端接口，获取最新的比赛列表
    const res = await request.get('/mlb/current');
    // 假设后端返回格式为 { success: true, data: [...] }
    if (res.data && res.data.success) {
      games.value = res.data.data;
    } else if (Array.isArray(res.data)) {
      games.value = res.data;
    } else {
      games.value = []; // 如果明确没有比赛，清空列表
    }
  } catch (error) {
    console.error("取得失敗", error);
    // 🆕 假数据测试：为了让你马上看到 7 场比赛的效果
    if (games.value.length === 0) {
      games.value = [
        { game_pk: 101, away_team: 'ヤンキース', home_team: 'レッドソックス', away_score: 2, home_score: 3, status: 'Live', current_inning: 5, inning_half: 'Top' },
        { game_pk: 102, away_team: 'ドジャース', home_team: 'ジャイアンツ', away_score: 0, home_score: 0, status: 'Preview', current_inning: 1, inning_half: 'Top' },
        { game_pk: 103, away_team: 'カブス', home_team: 'ホワイトソックス', away_score: 1, home_score: 1, status: 'Live', current_inning: 3, inning_half: 'Bottom' },
        { game_pk: 104, away_team: 'メッツ', home_team: 'ブレーブス', away_score: 4, home_score: 2, status: 'Live', current_inning: 7, inning_half: 'Top' },
        { game_pk: 105, away_team: 'パドレス', home_team: 'フィリーズ', away_score: 0, home_score: 0, status: 'Preview', current_inning: 1, inning_half: 'Top' },
        { game_pk: 106, away_team: 'アストロズ', home_team: 'マリナーズ', away_score: 5, home_score: 4, status: 'Live', current_inning: 8, inning_half: 'Top' },
        { game_pk: 107, away_team: 'エンゼルス', home_team: 'アスレチックス', away_score: 2, home_score: 6, status: 'Final', current_inning: 9, inning_half: 'Bottom' }
      ];
    }
  }
};

const fetchBalance = async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  try {
    const res = await request.get(`/user/info/${JSON.parse(storedUser).id}`);
    if (res.data.success) userBalance.value = res.data.user.balance;
  } catch (error) {}
};

// 进入比赛房间
const goToMatchRoom = (game) => {
  if (game.status === 'Final') {
    showToast('この試合は終了しました。'); // 🆕 替换了 alert
    return;
  }
  // 跳转到房间详情页，带上比赛ID
  router.push(`/mlb/room/${game.game_pk}`);
};

onMounted(() => {
  fetchGames();
  fetchBalance();
  pollTimer = setInterval(fetchGames, 30000); // 每30秒刷新列表
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
/* 沿用之前的暗黑电竞风格 */
.mlb-room-layout {
  font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
  background: #0b1120;
  min-height: 100vh;
  color: #f8fafc;
}
.main-content { max-width: 900px; margin: 0 auto; padding: 20px; }
.room-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #1e293b; }
.back-btn { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 8px 15px; border-radius: 20px; cursor: pointer; }
.back-btn:hover { background: #1e293b; color: #f8fafc; }
.room-header h2 { margin: 0; color: #ef4444; font-size: 22px; }
.balance-box { background: #1e293b; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: #fbbf24; border: 1px solid #334155; }

.games-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.match-card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; cursor: pointer; transition: all 0.2s; overflow: hidden; }
.match-card:hover { transform: translateY(-5px); border-color: #ef4444; box-shadow: 0 10px 20px rgba(239,68,68,0.15); }

.status-bar { background: #334155; padding: 8px; text-align: center; font-size: 12px; font-weight: bold; color: #cbd5e1; }
.status-bar.live { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.live-text { display: flex; align-items: center; justify-content: center; gap: 6px; }
.live-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulse-dot 1s infinite alternate; }
@keyframes pulse-dot { 0% { opacity: 1; } 100% { opacity: 0.3; } }

.teams-display { padding: 15px; display: flex; flex-direction: column; align-items: center; gap: 10px; background: #0f172a; }
.team-row { display: flex; align-items: center; width: 100%; gap: 10px; font-size: 16px; font-weight: bold; }
.team-label { font-size: 11px; padding: 2px 6px; border-radius: 4px; }
.away-label { background: #3b82f6; color: white; }
.home-label { background: #ef4444; color: white; }
.team-name { flex: 1; text-align: center; }
.vs-text { font-size: 12px; color: #64748b; font-weight: bold; }

.score-display { padding: 15px; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #334155; }
.score-text { font-size: 20px; font-weight: bold; color: #fbbf24; }
.action-btn { background: #ef4444; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; }

.empty-state { text-align: center; padding: 50px; color: #64748b; background: #1e293b; border-radius: 12px; border: 1px dashed #334155; }

/* 🆕 新增 Toast 提示样式 */
.custom-toast {
  position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
  padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold;
  z-index: 10000; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  background: #ef4444; color: white; text-align: center; pointer-events: none;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, -20px); }

@media (max-width: 768px) {
  .games-container { grid-template-columns: 1fr; }
}
</style>