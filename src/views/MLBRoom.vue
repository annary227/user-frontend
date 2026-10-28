<template>
  <div class="mlb-room-container">
    <!-- 返回按钮 -->
    <button class="floating-back-btn" @click="$router.push('/')">
      <span class="icon">‹</span> ロビーに戻る
    </button>

    <header class="room-header">
      <div class="title">⚾ MLB リアルタイム予想</div>
    </header>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>データ取得中...</p>
    </div>

    <!-- 无比赛 -->
    <div v-else-if="!mlbGame" class="empty-state">
      <h2>本日の試合はありません</h2>
      <p>また後でチェックしてください。</p>
    </div>

    <!-- 竞猜主面板 -->
    <div v-else class="betting-panel">
      
      <!-- 全局 Toast 提示 -->
      <Transition name="slide-down">
        <div v-if="toast.show" class="global-toast" :class="toast.type">
          {{ toast.msg }}
        </div>
      </Transition>

      <!-- 比分板 -->
      <div class="score-board">
        <div class="status-bar">
          <span class="live-tag" v-if="mlbGame.status === 'Live'">🔴 LIVE</span>
          <span class="preview-tag" v-else>試合前</span>
          <span class="inning-info" v-if="mlbGame.currentInning > 0">第 {{ mlbGame.currentInning }} 局</span>
        </div>

        <div class="match-teams">
          <div class="team away">
            <span class="name">{{ mlbGame.awayTeam }}</span>
            <span class="score">{{ mlbGame.awayScore }}</span>
          </div>
          <div class="vs">VS</div>
          <div class="team home">
            <span class="score">{{ mlbGame.homeScore }}</span>
            <span class="name">{{ mlbGame.homeTeam }}</span>
          </div>
        </div>
      </div>

      <!-- 赛前盘 -->
      <div v-if="mlbGame.pregameOpen && mlbGame.status === 'Preview'" class="bet-section">
        <h3>【試合前】勝敗予想 <span class="odds-tag">1.5x</span></h3>
        <div class="btn-group">
          <button class="bet-btn" @click="handleBet('pregame', 'away')">
            {{ mlbGame.awayTeam }} 勝利
          </button>
          <button class="bet-btn" @click="handleBet('pregame', 'home')">
            {{ mlbGame.homeTeam }} 勝利
          </button>
        </div>
      </div>

      <!-- ================= 🆕 单局盘 (带倒计时) ================= -->
      <!-- 如果 inningOpen 为 true，或者我们想让它无论如何都显示预览 -->
      <div v-if="mlbGame.inningOpen || mlbGame.status === 'Live'" class="bet-section">
        <div class="section-header">
          <h3>【第 {{ mlbGame.currentInning + 1 }} 局】スコア予想</h3>
          <span class="countdown" v-if="mlbGame.inningOpen">⏱ {{ formatTime(mlbGame.countdown) }}</span>
          <span class="countdown" v-else style="color: #94a3b8; background: transparent;">受付停止中</span>
        </div>
        <div class="grid-options" :class="{ 'disabled-options': !mlbGame.inningOpen }">
          <button class="score-btn" @click="mlbGame.inningOpen && handleBet('inning', '0:0', 1.8)">0:0 <span>1.8x</span></button>
          <button class="score-btn" @click="mlbGame.inningOpen && handleBet('inning', '1:0', 2.5)">1:0 <span>2.5x</span></button>
          <button class="score-btn" @click="mlbGame.inningOpen && handleBet('inning', '0:1', 2.5)">0:1 <span>2.5x</span></button>
          <button class="score-btn" @click="mlbGame.inningOpen && handleBet('inning', '2:0', 4.0)">2:0 <span>4.0x</span></button>
          <button class="score-btn" @click="mlbGame.inningOpen && handleBet('inning', '0:2', 4.0)">0:2 <span>4.0x</span></button>
          <button class="score-btn" @click="mlbGame.inningOpen && handleBet('inning', 'other', 10.0)">その他 <span>10x</span></button>
        </div>
      </div>

      <!-- 封盘状态 (如果既不能买赛前，也不能买单局) -->
      <div v-if="!mlbGame.pregameOpen && !mlbGame.inningOpen && mlbGame.status === 'Final'" class="closed-state">
        <h3>🔒 試合は終了しました</h3>
        <p>ご参加ありがとうございました。</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request';
import { ElMessageBox } from 'element-plus'; // 引入 Element Plus 的弹窗组件

const router = useRouter();
const mlbGame = ref(null);
const loading = ref(true);

let mlbPollTimer = null;
let mlbCountdownTimer = null;

const toast = ref({ show: false, msg: '', type: 'info' });
const showToast = (msg, type = 'info') => {
  toast.value = { show: true, msg, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

const formatTime = (sec) => {
  if (sec <= 0) return '00:00';
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const fetchMLBStatus = async () => {
  try {
    const res = await request.get('/mlb/current');
    if (res.data.success) {
      const prevOpen = mlbGame.value?.inningOpen;
      mlbGame.value = res.data.data;

      if (mlbGame.value.inningOpen && !prevOpen) {
        showToast('⚾ 第 ' + (mlbGame.value.currentInning + 1) + ' 局の予想が開始されました！', 'success');
      }
    } else {
      mlbGame.value = null;
    }
  } catch (err) {
    console.error('MLBデータ取得失敗', err);
  } finally {
    loading.value = false;
  }
};

const handleBet = async (betType, selection, odds = 1.5) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return router.push('/login');

  try {
    // 🆕 使用 Element Plus 弹窗代替原生 prompt，完美支持日语，且样式更好看
    const { value: amountStr } = await ElMessageBox.prompt(
      `予想：${selection}\nオッズ：${odds}x\n\nベットするポイントを入力してください（最低 30,000）:`,
      betType === 'pregame' ? '勝敗予想' : 'スコア予想',
      {
        confirmButtonText: 'ベットする',
        cancelButtonText: 'キャンセル',
        inputValue: '30000',
        inputPattern: /^\d+$/,
        inputErrorMessage: '半角数字で入力してください',
      }
    );

    const amount = Number(amountStr);
    if (amount < 30000) {
      showToast('最低ベット額は 30,000 ポイントです。', 'error');
      return;
    }

    // 发起下注
    const res = await request.post('/mlb/bet', {
      userId: user.id,
      gamePk: mlbGame.value.gamePk,
      betType,
      targetInning: betType === 'inning' ? mlbGame.value.currentInning + 1 : null,
      selection,
      amount
    });

    if (res.data.success) {
      showToast('ベットが完了しました！', 'success');
      user.balance -= amount;
      localStorage.setItem('user', JSON.stringify(user));
    }
  } catch (err) {
    // 如果用户点了取消，会进入 catch（报错 'cancel'），直接忽略即可
    if (err === 'cancel' || err === 'close') return;
    showToast(err.response?.data?.msg || 'ベットに失敗しました', 'error');
  }
};

onMounted(() => {
  fetchMLBStatus();
  mlbPollTimer = setInterval(fetchMLBStatus, 30000);
  
  mlbCountdownTimer = setInterval(() => {
    if (mlbGame.value && mlbGame.value.inningOpen && mlbGame.value.countdown > 0) {
      mlbGame.value.countdown--;
      if (mlbGame.value.countdown === 0) {
        mlbGame.value.inningOpen = false;
        showToast('🔒 ベットの受付が終了しました', 'warning');
      }
    }
  }, 1000);
});

onUnmounted(() => {
  if (mlbPollTimer) clearInterval(mlbPollTimer);
  if (mlbCountdownTimer) clearInterval(mlbCountdownTimer);
});
</script>

<style scoped>
/* 之前的样式全部保留，只修改排版对齐 */
.mlb-room-container {
  min-height: 100vh;
  background: #0f172a;
  color: white;
  padding: 60px 20px 40px;
  font-family: 'Noto Sans JP', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.floating-back-btn {
  position: fixed; top: 20px; left: 20px; z-index: 999;
  background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 16px; border-radius: 20px; color: white; cursor: pointer;
}

.room-header {
  margin-bottom: 30px;
  text-align: center;
}
.room-header .title {
  font-size: 24px; font-weight: 900; text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.loading-state, .empty-state {
  margin-top: 100px; text-align: center; color: #94a3b8;
}
.spinner {
  width: 40px; height: 40px; border: 4px solid #334155;
  border-top-color: #3b82f6; border-radius: 50%;
  animation: spin 1s linear infinite; margin: 0 auto 20px;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

.betting-panel {
  width: 100%; max-width: 600px;
  background: #1e293b; border-radius: 24px;
  padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  position: relative;
}

.score-board {
  background: #0f172a; border-radius: 16px; padding: 20px;
  margin-bottom: 24px; text-align: center;
}
.status-bar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 15px; font-size: 13px; font-weight: bold;
}
.live-tag { background: #ef4444; padding: 4px 10px; border-radius: 10px; }
.preview-tag { background: #64748b; padding: 4px 10px; border-radius: 10px; }
.inning-info { color: #94a3b8; }

/* 比分排版对齐 */
.match-teams {
  display: flex; 
  justify-content: space-around; 
  align-items: center;
}
.team { 
  display: flex; 
  flex-direction: column; 
  align-items: center;
  gap: 8px; 
  width: 40%;
}
.team .name { 
  font-size: 18px; 
  font-weight: bold; 
  color: #e2e8f0; 
  text-align: center;
  min-height: 40px;
  display: flex;
  align-items: center;
}
.team .score { 
  font-size: 42px; 
  font-weight: 900; 
  color: #fbbf24; 
  font-family: monospace; 
  line-height: 1;
}
.vs { 
  font-size: 20px; 
  font-weight: 900; 
  color: #475569; 
  margin-top: 20px; 
}

.bet-section { margin-bottom: 24px; }
.bet-section h3 { font-size: 16px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between; }
.odds-tag { color: #ef4444; font-family: monospace; background: #450a0a; padding: 2px 8px; border-radius: 6px; }
.countdown { color: #ef4444; background: #450a0a; padding: 4px 10px; border-radius: 8px; font-family: monospace; }

.btn-group { display: flex; gap: 15px; }
.bet-btn {
  flex: 1; padding: 16px; border-radius: 12px; border: none;
  background: #334155; color: white; font-size: 16px; font-weight: bold;
  cursor: pointer; transition: all 0.2s;
}
.bet-btn:hover { background: #3b82f6; transform: translateY(-2px); }

.grid-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.score-btn {
  padding: 16px 10px; border-radius: 12px; border: none;
  background: #334155; color: white; font-size: 16px; font-weight: bold;
  cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center;
}
.score-btn:hover { background: #3b82f6; transform: translateY(-2px); }
.score-btn span { font-size: 12px; color: #fbbf24; margin-top: 4px; }

/* 🆕 增加禁用状态的样式，如果是 Live 但未到局间，按钮变灰不可点 */
.disabled-options .score-btn {
  opacity: 0.5;
  pointer-events: none;
  background: #1e293b;
  border: 1px solid #334155;
}

.closed-state { text-align: center; padding: 30px; background: #0f172a; border-radius: 12px; color: #64748b; }

.global-toast {
  position: absolute; top: -50px; left: 50%; transform: translateX(-50%);
  padding: 10px 24px; border-radius: 20px; font-weight: 900; color: white;
  white-space: nowrap; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 100;
}
.global-toast.success { background: #10b981; }
.global-toast.warning { background: #f59e0b; }
.global-toast.error { background: #ef4444; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { transform: translate(-50%, -20px); opacity: 0; }
</style>