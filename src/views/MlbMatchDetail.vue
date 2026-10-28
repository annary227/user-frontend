<!-- src/views/MlbMatchDetail.vue -->
<template>
  <div class="mlb-match-detail">
    <AppHeader />

    <main class="main-content" v-if="game">
      <!-- 1. 顶部比分牌 -->
      <div class="scoreboard">
        <button class="back-btn" @click="$router.push('/mlb')">＜ 戻る</button>
        
        <div class="teams-score">
          <!-- 客队 (上) -->
          <div class="team away">
            <span class="name">{{ game.away_team }}</span>
            <span class="score">{{ game.away_score }}</span>
          </div>
          <!-- 主队 (下) -->
          <div class="team home">
            <span class="name">{{ game.home_team }}</span>
            <span class="score">{{ game.home_score }}</span>
          </div>
        </div>

        <div class="status">
          <span v-if="game.status === 'Live'" class="live-badge">
            <span class="dot"></span> {{ game.inning_half === 'Top' ? '表' : '裏' }} 第{{ game.current_inning }}回
          </span>
          <span v-else-if="game.status === 'Final'" style="color: #ef4444; font-weight: bold;">試合終了</span>
          <span v-else>試合前</span>
        </div>

        <!-- 显示开赛时间 -->
        <div class="game-time" v-if="game.game_date">
          🕒 開始予定: {{ formatJST(game.game_date) }} (JST)
        </div>
      </div>

      <!-- 🆕 2. 每一局的具体比分看板 (Linescore) -->
      <div class="linescore-board" v-if="inningsData.length > 0">
        <div class="linescore-table">
          <!-- 表头 -->
          <div class="ls-row ls-header">
            <div class="ls-cell ls-team-name"></div>
            <div class="ls-cell" v-for="i in 9" :key="'h'+i">{{ i }}</div>
            <div class="ls-cell ls-total">R</div>
          </div>
          <!-- 客队行 -->
          <div class="ls-row">
            <div class="ls-cell ls-team-name away-text">{{ game.away_team }}</div>
            <div class="ls-cell" v-for="i in 9" :key="'a'+i">
              {{ getInningScore(i, 'away') }}
            </div>
            <div class="ls-cell ls-total away-text">{{ game.away_score }}</div>
          </div>
          <!-- 主队行 -->
          <div class="ls-row">
            <div class="ls-cell ls-team-name home-text">{{ game.home_team }}</div>
            <div class="ls-cell" v-for="i in 9" :key="'hm'+i">
              {{ getInningScore(i, 'home') }}
            </div>
            <div class="ls-cell ls-total home-text">{{ game.home_score }}</div>
          </div>
        </div>
      </div>

      <!-- 3. 实况文字播报区 -->
      <div class="live-commentary">
        <div class="commentary-header">
          <h3>📻 実況テキスト速報</h3>
          <span class="live-pulse" v-if="game.status === 'Live'">LIVE</span>
        </div>
        <div class="commentary-box">
          <div v-for="(msg, index) in liveMessages" :key="index" class="msg-item">
            <span class="time">{{ msg.time }}</span>
            <span class="text" :class="{ 'highlight': msg.highlight }">{{ msg.text }}</span>
          </div>
          <div class="msg-item" v-if="liveMessages.length === 0">
            <span class="text" style="color: #94a3b8;">実況データを取得中...</span>
          </div>
        </div>
      </div>

      <!-- 4. 整场胜负预测盘口 -->
      <div class="betting-board pregame-board" v-if="game.status === 'Preview'">
        <div class="board-header">
          <h3>🏆 勝敗予想</h3>
          <span class="balance">残高: {{ userBalance.toLocaleString() }} pt</span>
        </div>
        <div class="pregame-grid">
          <button class="pregame-btn away-btn" @click="openPregameBet('away')">
            <span class="team-name">{{ game.away_team }}</span>
            <span class="odds">2.0x</span>
          </button>
          <button class="pregame-btn home-btn" @click="openPregameBet('home')">
            <span class="team-name">{{ game.home_team }}</span>
            <span class="odds">1.8x</span>
          </button>
        </div>
        <p class="bet-hint">※試合開始までいつでも購入可能</p>
      </div>

      <!-- 5. 单局比分竞猜盘口 (9局) -->
      <div class="betting-board" v-if="game.status !== 'Final'">
        <div class="board-header">
          <h3>🎯 イニングスコア予想</h3>
          <span class="balance" v-if="game.status !== 'Preview'">残高: {{ userBalance.toLocaleString() }} pt</span>
        </div>
        
        <div class="innings-list">
          <div v-for="inning in 9" :key="inning" class="inning-row" :class="{ 'is-past': inning < game.current_inning }">
            <div class="inning-title">
              <span class="inning-num">{{ inning }}回</span>
              <span v-if="inning === game.current_inning" class="current-badge">現在</span>
            </div>

            <div class="odds-grid" v-if="inning >= game.current_inning">
              <button 
                v-for="odd in scoreOptions" 
                :key="odd.key"
                class="odd-btn"
                @click="placeBet(inning, odd.key)"
              >
                <span class="odds-label">{{ odd.label }}</span>
                <span class="odds-value">{{ odd.odds }}x</span>
              </button>
            </div>
            <div class="result-display" v-else>
              <span class="result-text">{{ inning < game.current_inning ? '結果: -' : '試合終了' }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <div v-else class="loading">
      試合データを読み込み中...
    </div>

    <!-- 自定义下注弹窗 -->
    <div class="modal-overlay" v-if="showBetModal" @click.self="closeModal">
      <div class="modal-content">
        <h3>ベット内容の確認</h3>
        <div class="bet-detail">
          <p><strong>試合:</strong> {{ game.away_team }} vs {{ game.home_team }}</p>
          <p><strong>対象:</strong> {{ selectedBet.typeLabel }}</p>
          <p><strong>選択:</strong> {{ selectedBet.label }}</p>
          <p><strong>オッズ:</strong> {{ selectedBet.odds }}x</p>
        </div>
        <div class="input-group">
          <label>ベット額 (pt):</label>
          <input type="number" v-model="betAmount" min="30000" step="1000" placeholder="最低 30,000 pt" />
        </div>
        <p class="potential-win">的中時の払戻: <strong>{{ potentialWin }} pt</strong></p>
        
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">キャンセル</button>
          <button class="confirm-btn" @click="confirmBet" :disabled="isBetting">
            {{ isBetting ? '処理中...' : 'ベットする' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 纯日语优雅提示 (Toast) -->
    <transition name="fade">
      <div v-if="toast.show" class="custom-toast" :class="toast.type">
        {{ toast.msg }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '../api/request';
import AppHeader from '../components/AppHeader.vue';

const route = useRoute();
const router = useRouter();
const gameId = route.params.id;

const game = ref(null);
const userBalance = ref(0);
const liveMessages = ref([]);
const inningsData = ref([]); // 🆕 存储每一局比分
let pollTimer = null;

const scoreOptions = ref([
  { key: '0:0', label: '0 - 0', odds: 2.5 }, { key: '1:0', label: '1 - 0', odds: 3.0 },
  { key: '0:1', label: '0 - 1', odds: 3.0 }, { key: '2:0', label: '2 - 0', odds: 5.0 },
  { key: '0:2', label: '0 - 2', odds: 5.0 }, { key: '1:1', label: '1 - 1', odds: 4.5 }
]);

const showBetModal = ref(false);
const selectedBet = ref({ betType: 'inning', inning: null, label: '', odds: 0, key: '', typeLabel: '' });
const betAmount = ref(30000); 
const isBetting = ref(false);

const toast = reactive({ show: false, msg: '', type: 'error' });
const showToast = (msg, type = 'error') => {
  toast.msg = msg;
  toast.type = type;
  toast.show = true;
  setTimeout(() => { toast.show = false; }, 3000);
};

const potentialWin = computed(() => {
  if (!betAmount.value || betAmount.value < 30000) return 0;
  return Math.floor(betAmount.value * selectedBet.value.odds);
});

const formatJST = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// 🆕 获取某局某队的得分，没有则显示 '-'
const getInningScore = (inningNum, team) => {
  const data = inningsData.value.find(i => i.num === inningNum);
  if (!data) return '-';
  return team === 'away' ? data.awayRuns : data.homeRuns;
};

const fetchGameDetail = async () => {
  try {
    const res = await request.get(`/mlb/detail/${gameId}`);
    if (res.data.success) {
      game.value = res.data.game;
      if (res.data.commentary) liveMessages.value = res.data.commentary;
      if (res.data.innings) inningsData.value = res.data.innings; // 🆕 保存局比分
    }
  } catch (error) { console.error("詳細取得失敗", error); }
};

const fetchBalance = async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  try {
    const res = await request.get(`/user/info/${JSON.parse(storedUser).id}`);
    if (res.data.success) userBalance.value = res.data.user.balance;
  } catch (error) {}
};

const openPregameBet = (selection) => {
  const user = localStorage.getItem('user');
  if (!user) { showToast('ベットするにはログインが必要です。'); setTimeout(() => router.push('/login'), 1500); return; }
  if (game.value.status !== 'Preview') { showToast('試合はすでに開始されています。'); return; }
  
  const isAway = selection === 'away';
  selectedBet.value = { betType: 'pregame', inning: null, label: isAway ? `${game.value.away_team} の勝利` : `${game.value.home_team} の勝利`, odds: isAway ? 2.0 : 1.8, key: selection, typeLabel: '試合結果 (勝敗)' };
  betAmount.value = 30000;
  showBetModal.value = true;
};

const placeBet = (inning, key) => {
  const user = localStorage.getItem('user');
  if (!user) { showToast('ベットするにはログインが必要です。'); setTimeout(() => router.push('/login'), 1500); return; }
  
  const odd = scoreOptions.value.find(o => o.key === key);
  selectedBet.value = { betType: 'inning', inning: inning, label: odd.label, odds: odd.odds, key: key, typeLabel: `第 ${inning} 回 スコア` };
  betAmount.value = 30000;
  showBetModal.value = true;
};

const closeModal = () => showBetModal.value = false;

const confirmBet = async () => {
  if (betAmount.value < 30000) return showToast('最低ベット額は 30,000 pt です。');
  if (betAmount.value > userBalance.value) return showToast('残高が不足しています。');

  isBetting.value = true;
  try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const res = await request.post('/mlb/bet', {
      user_id: storedUser.id, game_pk: gameId, bet_type: selectedBet.value.betType,
      target_inning: selectedBet.value.inning, selection: selectedBet.value.key,
      amount: betAmount.value, odds: selectedBet.value.odds
    });

    if (res.data.success) {
      showToast('ベットが完了しました！', 'success');
      userBalance.value -= betAmount.value;
      showBetModal.value = false;
    } else { showToast(res.data.msg || 'ベットに失敗しました。'); }
  } catch (error) { showToast(error.response?.data?.msg || 'ベットに失敗しました。'); } 
  finally { isBetting.value = false; }
};

onMounted(() => {
  fetchGameDetail();
  fetchBalance();
  pollTimer = setInterval(fetchGameDetail, 15000);
});
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer); });
</script>

<style scoped>
/* ---------------- 以下全部是您原来的样式，仅新增了 Linescore 局比分看板样式 ---------------- */
.mlb-match-detail { font-family: 'Noto Sans JP', sans-serif; background: #0b1120; min-height: 100vh; color: #f8fafc; }
.main-content { max-width: 800px; margin: 0 auto; padding: 20px; }

/* 1. 顶部比分牌 */
.scoreboard { background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 16px; padding: 20px; margin-bottom: 20px; position: relative; }
.back-btn { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 5px 12px; border-radius: 20px; cursor: pointer; position: absolute; top: 20px; left: 20px; }
.teams-score { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 30px; width: 100%; }
.team { display: flex; justify-content: space-between; align-items: center; width: 80%; font-size: 20px; font-weight: bold; padding: 10px 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; }
.team.away .score { color: #3b82f6; font-size: 32px; font-weight: 900;}
.team.home .score { color: #ef4444; font-size: 32px; font-weight: 900;}
.status { text-align: center; margin-top: 15px; font-size: 14px; }
.live-badge { background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 4px 12px; border-radius: 20px; font-weight: bold; display: inline-flex; align-items: center; gap: 6px; }
.dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; animation: pulse 1s infinite alternate; }
.game-time { text-align: center; margin-top: 12px; font-size: 13px; color: #94a3b8; background: #0f172a; display: inline-block; padding: 4px 12px; border-radius: 12px; position: absolute; right: 20px; top: 20px; }

/* 🆕 新增：看板式每局比分 Linescore */
.linescore-board { background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 15px; margin-bottom: 20px; overflow-x: auto; }
.linescore-table { display: flex; flex-direction: column; gap: 8px; min-width: 500px; }
.ls-row { display: flex; justify-content: space-between; align-items: center; }
.ls-header { color: #64748b; font-size: 12px; font-weight: bold; margin-bottom: 5px; }
.ls-cell { flex: 1; text-align: center; font-size: 14px; color: #cbd5e1; }
.ls-team-name { flex: 2.5; text-align: left; font-weight: bold; color: #f8fafc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.away-text { color: #3b82f6; }
.home-text { color: #ef4444; }
.ls-total { background: #0f172a; border-radius: 4px; padding: 4px; font-size: 16px; font-weight: 900; flex: 0.8; }

/* 2. 实况文字播报 */
.live-commentary { background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 20px; margin-bottom: 20px; }
.commentary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #334155; padding-bottom: 10px; }
.commentary-header h3 { margin: 0; font-size: 16px; color: #e2e8f0; }
.live-pulse { color: #ef4444; font-weight: 900; font-size: 12px; animation: blink 1s infinite; }
.commentary-box { display: flex; flex-direction: column; gap: 12px; max-height: 150px; overflow-y: auto; }
.msg-item { display: flex; gap: 15px; font-size: 14px; }
.time { color: #64748b; font-weight: bold; }
.text { color: #cbd5e1; flex: 1; }
.text.highlight { color: #fbbf24; font-weight: bold; }

/* 胜负盘样式 */
.pregame-board { margin-bottom: 20px; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 20px; }
.pregame-board h3 { color: #fbbf24; }
.pregame-grid { display: flex; gap: 15px; margin-top: 15px; }
.pregame-btn { flex: 1; display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-radius: 12px; border: 1px solid #334155; background: #0f172a; color: white; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.pregame-btn:hover { border-color: #fbbf24; background: #334155; }
.away-btn .odds { color: #3b82f6; font-size: 20px; }
.home-btn .odds { color: #ef4444; font-size: 20px; }
.bet-hint { text-align: center; font-size: 12px; color: #64748b; margin-top: 15px; margin-bottom: 0; }

/* 单局竞猜盘口 */
.betting-board { background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 20px; }
.board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.board-header h3 { margin: 0; font-size: 18px; color: #ef4444; }
.balance { background: #0f172a; padding: 6px 12px; border-radius: 8px; color: #fbbf24; font-weight: bold; font-size: 14px; }
.innings-list { display: flex; flex-direction: column; gap: 15px; }
.inning-row { background: #0f172a; border-radius: 12px; padding: 15px; display: flex; flex-direction: column; gap: 12px; border: 1px solid #1e293b; }
.inning-row.is-past { opacity: 0.5; }
.inning-title { display: flex; align-items: center; gap: 10px; font-weight: bold; color: #94a3b8; }
.inning-num { font-size: 16px; color: #f8fafc; }
.current-badge { background: #ef4444; color: white; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.odds-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.odd-btn { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; color: white; }
.odd-btn:hover { background: #334155; border-color: #ef4444; }
.odds-label { font-weight: bold; color: #cbd5e1; }
.odds-value { color: #fbbf24; font-size: 12px; background: rgba(251, 191, 36, 0.1); padding: 2px 6px; border-radius: 4px; }
.result-display { text-align: center; padding: 10px; background: #1e293b; border-radius: 8px; color: #64748b; font-size: 14px; font-weight: bold; }

/* 弹窗样式 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(5px); }
.modal-content { background: #1e293b; padding: 25px; border-radius: 16px; width: 90%; max-width: 400px; border: 1px solid #334155; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
.modal-content h3 { margin-top: 0; color: #ef4444; text-align: center; }
.bet-detail { background: #0f172a; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; display: flex; flex-direction: column; gap: 8px; }
.bet-detail p { margin: 0; color: #cbd5e1; }
.bet-detail strong { color: #f8fafc; }
.input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; }
.input-group label { font-size: 14px; color: #94a3b8; }
.input-group input { background: #0f172a; border: 1px solid #334155; padding: 12px; border-radius: 8px; color: #fbbf24; font-size: 16px; font-weight: bold; outline: none; }
.input-group input:focus { border-color: #ef4444; }
.potential-win { text-align: right; color: #94a3b8; font-size: 14px; margin-bottom: 20px; }
.potential-win strong { color: #fbbf24; font-size: 18px; }
.modal-actions { display: flex; gap: 10px; }
.modal-actions button { flex: 1; padding: 12px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.cancel-btn { background: #334155; color: #cbd5e1; }
.cancel-btn:hover { background: #475569; }
.confirm-btn { background: #ef4444; color: white; }
.confirm-btn:hover:not(:disabled) { background: #dc2626; box-shadow: 0 0 15px rgba(239,68,68,0.4); }
.confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@keyframes pulse { 0% { opacity: 1; } 100% { opacity: 0.3; } }
@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }

@media (max-width: 768px) {
  .team { width: 100%; font-size: 16px; padding: 10px; }
  .team.away .score, .team.home .score { font-size: 24px; }
  .odds-grid { grid-template-columns: repeat(2, 1fr); }
  .game-time { position: static; margin-top: 15px; }
  .pregame-grid { flex-direction: column; }
}

/* Toast 样式 */
.custom-toast { position: fixed; top: 30px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; z-index: 10000; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4); color: white; text-align: center; pointer-events: none; }
.custom-toast.error { background: #ef4444; }
.custom-toast.success { background: #10b981; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, -20px); }
</style>