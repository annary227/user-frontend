<!-- src/views/MlbMatchDetail.vue -->
<template>
  <div class="mlb-match-detail">
    <AppHeader />

    <main class="main-content" v-if="game">
      <!-- 1. 顶部比分牌 -->
      <div class="scoreboard">
        <button class="back-btn" @click="$router.push('/mlb')">＜ 戻る</button>
        <div class="teams-score">
          <div class="team away">
            <span class="name">{{ game.away_team }}</span>
            <span class="score">{{ game.away_score }}</span>
          </div>
          <div class="vs">-</div>
          <div class="team home">
            <span class="score">{{ game.home_score }}</span>
            <span class="name">{{ game.home_team }}</span>
          </div>
        </div>
        <div class="status">
          <span v-if="game.status === 'Live'" class="live-badge">
            <span class="dot"></span> {{ game.inning_half === 'Top' ? '表' : '裏' }} 第{{ game.current_inning }}回
          </span>
          <span v-else>試合前</span>
        </div>
      </div>

      <!-- 2. 实况文字播报区 -->
      <div class="live-commentary">
        <div class="commentary-header">
          <h3>📻 実況テキスト速報</h3>
          <span class="live-pulse">LIVE</span>
        </div>
        <div class="commentary-box">
          <!-- 滚动展示最近3条播报 -->
          <div v-for="(msg, index) in liveMessages" :key="index" class="msg-item">
            <span class="time">{{ msg.time }}</span>
            <span class="text" :class="{ 'highlight': msg.highlight }">{{ msg.text }}</span>
          </div>
          <div class="msg-item" v-if="liveMessages.length === 0">
            <span class="text" style="color: #94a3b8;">実況データを取得中...</span>
          </div>
        </div>
      </div>

      <!-- 3. 单局比分竞猜盘口 (9局) -->
      <div class="betting-board">
        <div class="board-header">
          <h3>🎯 イニングスコア予想</h3>
          <span class="balance">残高: {{ userBalance.toLocaleString() }} pt</span>
        </div>
        
        <div class="innings-list">
          <!-- 循环渲染 1 到 9 局 -->
          <div v-for="inning in 9" :key="inning" class="inning-row" :class="{ 'is-past': inning < game.current_inning }">
            <div class="inning-title">
              <span class="inning-num">{{ inning }}回</span>
              <span v-if="inning === game.current_inning" class="current-badge">現在</span>
            </div>

            <!-- 如果当前局已结束，显示结果；如果没结束，显示下注按钮 -->
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
              <!-- 假设这里从数据库读取该局的实际比分，如果是假数据就默认显示 0:0 -->
              <span class="result-text">結果: 0 - 0</span>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <div v-else class="loading">
      試合データを読み込み中...
    </div>

    <!-- 🆕 自定义下注弹窗 -->
    <div class="modal-overlay" v-if="showBetModal" @click.self="closeModal">
      <div class="modal-content">
        <h3>ベット内容の確認</h3>
        <div class="bet-detail">
          <p><strong>試合:</strong> {{ game.away_team }} vs {{ game.home_team }}</p>
          <p><strong>対象:</strong> 第 {{ selectedBet.inning }} 回</p>
          <p><strong>選択:</strong> {{ selectedBet.label }}</p>
          <p><strong>オッズ:</strong> {{ selectedBet.odds }}x</p>
        </div>
        <div class="input-group">
          <label>ベット額 (pt):</label>
          <input type="number" v-model="betAmount" min="100" step="100" placeholder="最低 100 pt" />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '../api/request';
import AppHeader from '../components/AppHeader.vue';

const route = useRoute();
const router = useRouter();
const gameId = route.params.id;

const game = ref(null);
const userBalance = ref(0);
const liveMessages = ref([]);
let pollTimer = null;

// 比分盘口赔率配置
const scoreOptions = ref([
  { key: '0:0', label: '0 - 0', odds: 2.5 },
  { key: '1:0', label: '1 - 0', odds: 3.0 },
  { key: '0:1', label: '0 - 1', odds: 3.0 },
  { key: '2:0', label: '2 - 0', odds: 5.0 },
  { key: '0:2', label: '0 - 2', odds: 5.0 },
  { key: '1:1', label: '1 - 1', odds: 4.5 }
]);

// 弹窗状态
const showBetModal = ref(false);
const selectedBet = ref({ inning: null, label: '', odds: 0, key: '' });
const betAmount = ref(1000);
const isBetting = ref(false);

const potentialWin = computed(() => {
  if (!betAmount.value || betAmount.value < 100) return 0;
  return Math.floor(betAmount.value * selectedBet.value.odds);
});

// 获取比赛详情
const fetchGameDetail = async () => {
  try {
    const res = await request.get(`/mlb/detail/${gameId}`);
    if (res.data.success) {
      game.value = res.data.game;
      // 如果后端有返回实况数据，就渲染出来
      if (res.data.commentary) {
        liveMessages.value = res.data.commentary;
      }
    }
  } catch (error) {
    console.error("詳細取得失敗", error);
    // 🆕 假数据兜底，让你看看效果
    game.value = {
      game_pk: gameId,
      away_team: 'ヤンキース',
      home_team: 'レッドソックス',
      away_score: 2,
      home_score: 3,
      status: 'Live',
      current_inning: 5,
      inning_half: 'Top'
    };
    liveMessages.value = [
      { time: '14:25', text: '5回表、ヤンキース 1番打者がヒットで出塁！', highlight: false },
      { time: '14:28', text: '2番打者、見事な送りバントで1死2塁！', highlight: false },
      { time: '14:30', text: '3番打者、レフト前ヒット！ランナーが生還し1点追加！', highlight: true },
    ];
  }
};

// 获取用户余额
const fetchBalance = async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  try {
    const res = await request.get(`/user/info/${JSON.parse(storedUser).id}`);
    if (res.data.success) userBalance.value = res.data.user.balance;
  } catch (error) {}
};

// 点击赔率按钮
const placeBet = (inning, key) => {
  const user = localStorage.getItem('user');
  if (!user) {
    alert('ベットするにはログインが必要です。');
    router.push('/login');
    return;
  }

  const odd = scoreOptions.value.find(o => o.key === key);
  selectedBet.value = { inning, label: odd.label, odds: odd.odds, key: key };
  betAmount.value = 1000; // 默认下注 1000
  showBetModal.value = true;
};

const closeModal = () => {
  showBetModal.value = false;
};

// 确认下注
const confirmBet = async () => {
  if (betAmount.value < 100) {
    alert('最低ベット額は 100 pt です。');
    return;
  }
  if (betAmount.value > userBalance.value) {
    alert('残高が不足しています。');
    return;
  }

  isBetting.value = true;
  try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const res = await request.post('/mlb/bet', {
      user_id: storedUser.id,
      game_pk: gameId,
      bet_type: 'inning',
      target_inning: selectedBet.value.inning,
      selection: selectedBet.value.key,
      amount: betAmount.value,
      odds: selectedBet.value.odds
    });

    if (res.data.success) {
      alert('ベットが完了しました！');
      userBalance.value = res.data.newBalance;
      showBetModal.value = false;
    } else {
      alert(res.data.message || 'ベットに失敗しました。');
    }
  } catch (error) {
    console.error('ベットエラー', error);
    // 假测试：如果后端接口没通，前端假装扣款成功
    alert('テストモード: ベットが完了しました！(バックエンド未接続)');
    userBalance.value -= betAmount.value;
    showBetModal.value = false;
  } finally {
    isBetting.value = false;
  }
};

onMounted(() => {
  fetchGameDetail();
  fetchBalance();
  pollTimer = setInterval(fetchGameDetail, 15000); // 每15秒刷新详情
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.mlb-match-detail {
  font-family: 'Noto Sans JP', sans-serif;
  background: #0b1120;
  min-height: 100vh;
  color: #f8fafc;
}
.main-content { max-width: 800px; margin: 0 auto; padding: 20px; }

/* 1. 顶部比分牌 */
.scoreboard {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
}
.back-btn {
  background: transparent; color: #94a3b8; border: 1px solid #334155;
  padding: 5px 12px; border-radius: 20px; cursor: pointer; position: absolute; top: 20px; left: 20px;
}
.teams-score { display: flex; justify-content: center; align-items: center; gap: 30px; margin-top: 10px; }
.team { display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 20px; font-weight: bold; }
.team.away .score { color: #3b82f6; }
.team.home .score { color: #ef4444; }
.score { font-size: 48px; font-weight: 900; text-shadow: 0 0 20px rgba(255,255,255,0.1); }
.vs { font-size: 24px; color: #64748b; }
.status { text-align: center; margin-top: 15px; font-size: 14px; }
.live-badge { background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 4px 12px; border-radius: 20px; font-weight: bold; display: inline-flex; align-items: center; gap: 6px; }
.dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; animation: pulse 1s infinite alternate; }

/* 2. 实况文字播报 */
.live-commentary {
  background: #1e293b;
  border-radius: 16px;
  border: 1px solid #334155;
  padding: 20px;
  margin-bottom: 20px;
}
.commentary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #334155; padding-bottom: 10px; }
.commentary-header h3 { margin: 0; font-size: 16px; color: #e2e8f0; }
.live-pulse { color: #ef4444; font-weight: 900; font-size: 12px; animation: blink 1s infinite; }
.commentary-box { display: flex; flex-direction: column; gap: 12px; max-height: 150px; overflow-y: auto; }
.msg-item { display: flex; gap: 15px; font-size: 14px; }
.time { color: #64748b; font-weight: bold; }
.text { color: #cbd5e1; flex: 1; }
.text.highlight { color: #fbbf24; font-weight: bold; }

/* 3. 单局竞猜盘口 */
.betting-board {
  background: #1e293b;
  border-radius: 16px;
  border: 1px solid #334155;
  padding: 20px;
}
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
.odd-btn {
  background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px;
  display: flex; justify-content: space-between; align-items: center; cursor: pointer;
  transition: all 0.2s; color: white;
}
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
  .teams-score { gap: 15px; }
  .score { font-size: 36px; }
  .odds-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>