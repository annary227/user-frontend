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

      <!-- 🆕 全新设计的赛事计分板 -->
      <div class="score-board">
        <div class="status-bar">
          <span class="live-tag" v-if="mlbGame.status === 'Live'">🔴 LIVE</span>
          <span class="preview-tag" v-else>試合前</span>
          <span class="inning-info" v-if="mlbGame.currentInning > 0">第 {{ mlbGame.currentInning }} 局</span>
        </div>

        <div class="match-teams">
          <!-- 客队 -->
          <div class="team-block away">
            <div class="team-label">{{ getJapaneseTeamName(mlbGame.awayTeam) }}</div>
            <div class="score">{{ mlbGame.awayScore }}</div>
          </div>

          <div class="vs-divider">
            <span>VS</span>
          </div>

          <!-- 主队 -->
          <div class="team-block home">
            <div class="team-label">{{ getJapaneseTeamName(mlbGame.homeTeam) }}</div>
            <div class="score">{{ mlbGame.homeScore }}</div>
          </div>
        </div>
      </div>

      <!-- 赛前盘 -->
      <div v-if="mlbGame.pregameOpen && mlbGame.status === 'Preview'" class="bet-section">
        <h3>【試合前】勝敗予想 <span class="odds-tag">1.5x</span></h3>
        <div class="btn-group">
          <button class="bet-btn" @click="handleBet('pregame', 'away')">
            {{ getJapaneseTeamName(mlbGame.awayTeam) }} 勝利
          </button>
          <button class="bet-btn" @click="handleBet('pregame', 'home')">
            {{ getJapaneseTeamName(mlbGame.homeTeam) }} 勝利
          </button>
        </div>
      </div>

      <!-- 单局盘 (带倒计时) -->
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

      <!-- 封盘状态 -->
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
import { ElMessageBox } from 'element-plus';

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

// 英文队名翻译为日文
const teamDictionary = {
  "Milwaukee Brewers": "ミルウォーキー・ブリュワーズ",
  "Tampa Bay Rays": "タンパベイ・レイズ",
  "New York Yankees": "ニューヨーク・ヤンキース",
  "Los Angeles Dodgers": "ロサンゼルス・ドジャース",
  "Boston Red Sox": "ボストン・レッドソックス",
  "Chicago Cubs": "シカゴ・カブス",
  "San Francisco Giants": "サンフランシスコ・ジャイアンツ",
  "Houston Astros": "ヒューストン・アストロズ",
  "Atlanta Braves": "アトランタ・ブレーブス",
  "New York Mets": "ニューヨーク・メッツ",
  "Philadelphia Phillies": "フィラデルフィア・フィリーズ",
  "San Diego Padres": "サンディエゴ・パドレス",
  "Toronto Blue Jays": "トロント・ブルージェイズ",
  "Seattle Mariners": "シアトル・マリナーズ",
  "Cleveland Guardians": "クリーブランド・ガーディアンズ",
  "Minnesota Twins": "ミネソタ・ツインズ",
  "Baltimore Orioles": "ボルチモア・オリオールズ",
  "Texas Rangers": "テキサス・レンジャーズ",
  "Arizona Diamondbacks": "アリゾナ・ダイヤモンドバックス",
  "Cincinnati Reds": "シンシナティ・レッズ",
  "Pittsburgh Pirates": "ピッツバーグ・パイレーツ",
  "Miami Marlins": "マイアミ・マーリンズ",
  "Colorado Rockies": "コロラド・ロッキーズ",
  "Kansas City Royals": "カンザスシティ・ロイヤルズ",
  "Detroit Tigers": "デトロイト・タイガース",
  "Chicago White Sox": "シカゴ・ホワイトソックス",
  "Los Angeles Angels": "ロサンゼルス・エンゼルス",
  "Oakland Athletics": "オークランド・アスレチックス",
  "St. Louis Cardinals": "セントルイス・カージナルス",
  "Washington Nationals": "ワシントン・ナショナルズ"
};

const getJapaneseTeamName = (englishName) => {
  return teamDictionary[englishName] || englishName;
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
    let displaySelection = selection;
    if (betType === 'pregame') {
      displaySelection = getJapaneseTeamName(selection === 'away' ? mlbGame.value.awayTeam : mlbGame.value.homeTeam) + ' 勝利';
    }

    const { value: amountStr } = await ElMessageBox.prompt(
      `予想：${displaySelection}\nオッズ：${odds}x\n\nベットするポイントを入力してください（最低 30,000）:`,
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
/* ================= 🆕 华丽背景与场地灯光氛围 ================= */
.mlb-room-container {
  min-height: 100vh;
  /* 使用深色渐变并加入微弱的棒球场草皮暗纹，不再是死黑 */
  background: 
    linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 1) 100%),
    repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 20px);
  background-size: cover;
  color: white;
  padding: 60px 20px 40px;
  font-family: 'Noto Sans JP', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* 顶部的球场灯光效果 */
.mlb-room-container::before {
  content: '';
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 50%;
  background: radial-gradient(ellipse at top, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.floating-back-btn {
  position: fixed; top: 20px; left: 20px; z-index: 999;
  background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 16px; border-radius: 20px; color: white; cursor: pointer;
  backdrop-filter: blur(5px);
}

.room-header {
  margin-bottom: 30px;
  text-align: center;
  z-index: 1;
}
.room-header .title {
  font-size: 24px; font-weight: 900; text-shadow: 0 2px 10px rgba(0,0,0,0.8);
}

.loading-state, .empty-state {
  margin-top: 100px; text-align: center; color: #94a3b8;
  z-index: 1;
}
.spinner {
  width: 40px; height: 40px; border: 4px solid #334155;
  border-top-color: #3b82f6; border-radius: 50%;
  animation: spin 1s linear infinite; margin: 0 auto 20px;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

/* 主面板增加玻璃拟物感 */
.betting-panel {
  width: 100%; max-width: 600px;
  background: rgba(30, 41, 59, 0.85); /* 半透明背景 */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px; 
  box-shadow: 0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
  position: relative;
  z-index: 1;
}

/* ================= 🆕 全新计分板设计 ================= */
.score-board {
  background: linear-gradient(180deg, #0b1120 0%, #1e293b 100%);
  border-radius: 16px; 
  padding: 20px;
  margin-bottom: 24px; 
  text-align: center;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
}
.status-bar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; font-size: 13px; font-weight: bold;
}
.live-tag { background: #ef4444; padding: 4px 12px; border-radius: 20px; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
.preview-tag { background: #64748b; padding: 4px 12px; border-radius: 20px; }
.inning-info { color: #94a3b8; }

/* 使用 Flex 完美左右对称 */
.match-teams {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.team-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 10px;
}

/* 队名做成小卡片标签 */
.team-label {
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #e2e8f0;
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 超大比分数字 */
.team-block .score {
  font-size: 56px;
  font-weight: 900;
  color: #fbbf24;
  font-family: 'Oswald', 'Impact', monospace;
  line-height: 1;
  text-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
}

.vs-divider {
  padding: 0 20px;
  font-size: 18px;
  font-weight: 900;
  color: #475569;
  font-style: italic;
}
/* ======================================================== */

.bet-section { margin-bottom: 24px; }
.bet-section h3 { font-size: 16px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between; color: #e2e8f0;}
.odds-tag { color: #fca5a5; font-family: monospace; background: #7f1d1d; padding: 2px 8px; border-radius: 6px; border: 1px solid #ef4444; }
.countdown { color: #fca5a5; background: #7f1d1d; padding: 4px 10px; border-radius: 8px; font-family: monospace; font-weight: bold; border: 1px solid #ef4444; }

.btn-group { display: flex; gap: 15px; }
.bet-btn {
  flex: 1; padding: 16px; border-radius: 12px; border: none;
  background: #334155; color: white; font-size: 15px; font-weight: bold;
  cursor: pointer; transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.bet-btn:hover { background: #3b82f6; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4); }

.grid-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.score-btn {
  padding: 16px 10px; border-radius: 12px; border: none;
  background: #334155; color: white; font-size: 16px; font-weight: bold;
  cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.score-btn:hover { background: #3b82f6; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4); }
.score-btn span { font-size: 12px; color: #fbbf24; margin-top: 4px; }

.disabled-options .score-btn {
  opacity: 0.5;
  pointer-events: none;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
}

.closed-state { text-align: center; padding: 30px; background: #0f172a; border-radius: 12px; color: #64748b; border: 1px solid #334155;}

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