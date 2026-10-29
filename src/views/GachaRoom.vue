<!-- 请从这里开始全选复制，直到最底部的 </style> 结束 -->
<template>
  <div class="room-container" :class="`theme-${gameType}`">
    
    <!-- 背景 -->
    <div class="hologram-bg">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
      <div class="stars-container">
        <div class="star-group star-1"></div>
        <div class="star-group star-2"></div>
        <div class="star-group star-3"></div>
      </div>
      <div class="floor-reflection"></div>
    </div>

    <!-- 全局提示 Toast -->
    <Transition name="slide-down">
      <div v-if="toast.show" class="global-toast" :class="toast.type">
        {{ toast.msg }}
      </div>
    </Transition>

    <!-- 返回按钮 -->
    <button class="floating-back-btn" @click="$router.push('/')">
      <span class="icon">‹</span> ロビーに戻る
    </button>

    <!-- 顶部导航 -->
    <header class="room-header">
      <div style="width: 100px;"></div>
      <div class="title">{{ gameName }}</div>
      <div class="header-right"></div>
    </header>

    <!-- 核心机台 -->
    <div class="stage">
      <div class="machine-body" :class="{ 'is-win-glow': !isDrawing && result && result.value > 0 }">
        
        <!-- 3D 核心舞台 -->
        <div class="game-stage-3d" :class="`stage-${gameType}`">
          
          <!-- 1. 金魚すくい -->
          <div v-if="gameType === 'fish'" class="fish-bowl">
            <div class="water" :class="{ 'is-rippling': isDrawing }"></div>
            <div class="fish-entity" :class="{ 'is-swimming': !isDrawing, 'is-caught': !isDrawing && result && result.value > 0, 'is-escaped': !isDrawing && result && result.value === 0 }">🐟</div>
            <div class="poi" :class="{ 'is-scooping': isDrawing, 'is-broken': !isDrawing && result && result.value === 0 }">
               {{ (!isDrawing && result && result.value === 0) ? '🕸️' : '🥅' }}
            </div>
            <div class="splash-effect" v-if="!isDrawing && result && result.value > 0">💦</div>
            <div class="prize-tag fish-prize" v-if="!isDrawing && result && result.value > 0">+ ¥{{ result.value.toLocaleString() }}</div>
          </div>

          <!-- 2. 飞镖 -->
          <div v-else-if="gameType === 'dart'" class="dart-board">
            <div class="board-rings"></div>
            <div class="dart" :class="{ 'is-thrown': isDrawing, 'is-hit': !isDrawing && result }">🎯</div>
            <div class="prize-tag dart-prize" :class="result && result.value > 0 ? 'is-win' : 'is-lose'" v-if="!isDrawing && result">
              <span v-if="result.value > 0">+ ¥{{ result.value.toLocaleString() }}</span>
              <span v-else>MISS</span>
            </div>
          </div>

          <!-- 3. 抓娃娃 -->
          <div v-else-if="gameType === 'crane'" class="crane-scene">
            <div class="crane-rail"></div>
            <div class="claw-3d" :class="{ 'is-dropping': isDrawing, 'is-grabbing': !isDrawing && result && result.value > 0 }">
              <div class="claw-wire"></div>
              <div class="claw-motor"></div>
              <div class="claw-pincers">
                <div class="pincer left"></div>
                <div class="pincer right"></div>
              </div>
            </div>
            <div class="prize-bed" :class="{ 'is-caught': !isDrawing && result && result.value > 0 }">
              <span class="prize-3d">{{ gameIcon }}</span>
            </div>
            <div class="coin-drop" v-if="!isDrawing && result && result.value > 0">
              <div class="coin">+¥{{ result.value }}</div>
            </div>
          </div>

          <!-- 4. 扭蛋机 -->
          <div v-else-if="gameType === 'gacha'" class="bandai-gacha-machine">
            <div class="machine-brand">
              <span class="logo-red">BANDAI</span>
              <span class="logo-blue">GASHAPON</span>
            </div>
            <div class="acrylic-dome" :class="{ 'is-spinning': isDrawing }">
              <div class="dome-shelf"></div>
              <div class="capsule-pile">
                <div class="ball ball-1"></div><div class="ball ball-2"></div>
                <div class="ball ball-3"></div><div class="ball ball-4"></div>
                <div class="ball ball-5"></div><div class="ball ball-6"></div>
                <div class="ball ball-7"></div><div class="ball ball-8"></div>
              </div>
              <div class="spin-blur" v-if="isDrawing"></div>
              <div class="dome-highlight"></div>
            </div>
            <div class="machine-body-lower">
              <div class="lower-left">
                <div class="coin-slot">🪙</div>
                <div class="side-crank" :class="{ 'is-turning': isDrawing }">
                  <div class="crank-handle"></div>
                </div>
              </div>
              <div class="lower-right">
                <div class="big-knob" :class="{ 'is-turning': isDrawing }">
                  <div class="knob-inner">↻</div>
                </div>
                <div class="exit-chute">
                  <div class="chute-flap" :class="{ 'is-pushing': !isDrawing && result }">
                    <div class="dropped-capsule" v-if="!isDrawing && result">
                      <div class="capsule-half top" :class="result.value > 0 ? 'win-bg' : 'lose-bg'"></div>
                      <div class="capsule-half bottom" :class="result.value > 0 ? 'win-bg' : 'lose-bg'"></div>
                      <div class="capsule-prize-text" :class="result.value > 0 ? 'win-text' : 'lose-text'">
                        {{ result.value > 0 ? `+ ¥${result.value.toLocaleString()}` : '残念...' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="machine-stickers">
                <div class="sticker warning">{{ gameCost }}円</div>
                <div class="sticker instructions">
                  <span>カプセルを</span>
                  <span>取り出して</span>
                  <span>ください</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. 刮刮乐 -->
          <div v-else-if="gameType === 'scratch'" class="scratch-scene">
             <div class="scratch-card" :class="{ 'is-scratched': !isDrawing && result }">
                <div class="scratch-cover" :class="{ 'is-scratching': isDrawing }"></div>
                <div class="scratch-content">{{ (!isDrawing && result) ? (result.value > 0 ? '🏆' : '💧') : '🎁' }}</div>
             </div>
             <div class="prize-tag scratch-prize" :class="result && result.value > 0 ? 'is-win' : 'is-lose'" v-if="!isDrawing && result">
                <span v-if="result.value > 0">+ ¥{{ result.value.toLocaleString() }}</span>
                <span v-else>残念...</span>
             </div>
          </div>

          <!-- 6. 轮盘 -->
          <div v-else-if="gameType === 'roulette'" class="roulette-scene">
            <div class="roulette-ball-pointer">⚪</div>
            <div class="wheel-3d-container">
              <div 
                class="wheel-rotating-layer" 
                :class="{ 'is-spinning': isDrawing, 'is-settling': !isDrawing && result }"
                :style="wheelStyle"
              >
                <div class="wheel-blocks" :style="dynamicConicGradient"></div>
                <div 
                  v-for="(prize, index) in displayPrizes12" 
                  :key="index"
                  class="wheel-label"
                  :style="getLabelStyle12(index)"
                >
                  {{ formatPrize(prize.value) }}
                </div>
              </div>
              <div class="wheel-3d-sphere-overlay"></div>
              <div class="wheel-center-tower">
                <div class="tower-top">CASINO</div>
                <div class="tower-cross">
                  <div class="cross-bar"></div>
                  <div class="cross-bar"></div>
                </div>
              </div>
            </div>
            <div class="win-glow" v-if="!isDrawing && result && result.value > 0"></div>
            <div class="prize-tag roulette-prize" :class="result && result.value > 0 ? 'is-win' : 'is-lose'" v-if="!isDrawing && result">
              <span v-if="result.value > 0">+ ¥{{ result.value.toLocaleString() }}</span>
              <span v-else>残念...</span>
            </div>
          </div>

          <!-- 7. 寻宝 -->
          <div v-else-if="gameType === 'treasure'" class="treasure-chest">
            <div class="chest-lid" :class="{ 'is-opening': !isDrawing && result, 'is-shaking': isDrawing }"></div>
            <div class="chest-base" :class="{ 'is-shaking': isDrawing }"></div>
            <div class="golden-fountain" v-if="!isDrawing && result && result.value > 0">
              <div class="coin c1">¥</div><div class="coin c2">¥</div>
              <div class="coin main-coin">+ ¥{{ result.value.toLocaleString() }}</div>
            </div>
          </div>

          <!-- 8. 老虎机 -->
          <div v-else-if="gameType === 'slot'" class="slot-machine-3d">
            <div class="reel-container">
              <div class="reel-3d" :class="{ 'is-spinning': isDrawing, 'is-stopped': !isDrawing && result }">
                <div class="symbol face-0">🍒</div><div class="symbol face-1">🔔</div>
                <div class="symbol face-2">💎</div><div class="symbol face-3 win-symbol">7</div>
                <div class="symbol face-4">🍋</div><div class="symbol face-5">🍇</div>
              </div>
              <div class="cylinder-gloss"></div>
            </div>
            <div class="reel-container">
              <div class="reel-3d" :class="{ 'is-spinning': isDrawing, 'is-stopped': !isDrawing && result }" style="animation-delay: 0.15s;">
                <div class="symbol face-0">💎</div><div class="symbol face-1 win-symbol">7</div>
                <div class="symbol face-2">🍒</div><div class="symbol face-3">🍋</div>
                <div class="symbol face-4">🔔</div><div class="symbol face-5">🍇</div>
              </div>
              <div class="cylinder-gloss"></div>
            </div>
            <div class="reel-container">
              <div class="reel-3d" :class="{ 'is-spinning': isDrawing, 'is-stopped': !isDrawing && result }" style="animation-delay: 0.3s;">
                <div class="symbol face-0">🍋</div><div class="symbol face-1">🍇</div>
                <div class="symbol face-2 win-symbol">7</div><div class="symbol face-3">🍒</div>
                <div class="symbol face-4">🔔</div><div class="symbol face-5">💎</div>
              </div>
              <div class="cylinder-gloss"></div>
            </div>
            <div class="slot-machine-glass"></div>
          </div>

        </div>
        
        <!-- 机台底部控制台 -->
        <div class="control-panel">
          <div class="info-screen">
            <p class="desc">{{ gameDesc }}</p>
            
            <!-- 跑马灯 -->
            <div class="marquee-board" v-if="marqueePrizes.length > 0">
              <div class="marquee-scroll">
                <div 
                  v-for="(prize, index) in marqueePrizes" 
                  :key="index"
                  class="marquee-item"
                  :class="{ 
                    'is-active': currentMarqueeIndex === index,
                    'is-win': currentMarqueeIndex === index && !isDrawing && result && result.value > 0,
                    'is-lose': currentMarqueeIndex === index && !isDrawing && result && result.value === 0
                  }"
                >
                  <span class="name">{{ translateName(prize.name) }}</span>
                  <span class="value" v-if="prize.value > 0">¥{{ prize.value.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <div class="balance-display" style="margin-top: 15px;">
              <span class="label">残高</span>
              <span class="amount">¥ {{ currentBalance.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 抽奖按钮 -->
      <button 
        class="heavy-btn" 
        :style="{ background: `linear-gradient(180deg, ${currentColor} 0%, #222 100%)` }"
        @click="checkAuth" 
        :disabled="isDrawing"
      >
        <span class="btn-text">{{ isDrawing ? '抽選中...' : `¥${gameCost} で挑戦する` }}</span>
        <span class="btn-shine" v-if="!isDrawing"></span>
      </button>

      <!-- ================= 🏆 MLB 实时竞猜面板 ================= -->
      <div class="mlb-panel" v-if="mlbGame">
        <div class="mlb-header">
          <span class="live-tag" v-if="mlbGame.status === 'Live'">🔴 LIVE</span>
          <span class="preview-tag" v-else>待機中</span>
          <span class="inning-info" v-if="mlbGame.currentInning > 0">第 {{ mlbGame.currentInning }} 局</span>
        </div>
        
        <div class="match-info">
          <div class="team">
            <span class="name">{{ mlbGame.awayTeam }}</span>
            <span class="score">{{ mlbGame.awayScore }}</span>
          </div>
          <div class="vs">VS</div>
          <div class="team">
            <span class="score">{{ mlbGame.homeScore }}</span>
            <span class="name">{{ mlbGame.homeTeam }}</span>
          </div>
        </div>

        <!-- 下注区域 -->
        <div class="betting-area">
          <!-- 赛前盘 -->
          <div v-if="mlbGame.pregameOpen && mlbGame.status === 'Preview'" class="pregame-bet">
            <div class="bet-title">【試合前】勝敗予想 (1.5x)</div>
            <div class="btn-group">
              <button class="mlb-btn" @click="handleBet('pregame', 'away')">{{ mlbGame.awayTeam }} 勝利</button>
              <button class="mlb-btn" @click="handleBet('pregame', 'home')">{{ mlbGame.homeTeam }} 勝利</button>
            </div>
          </div>

          <!-- 单局盘 (带倒计时) -->
          <div v-if="mlbGame.inningOpen" class="inning-bet">
            <div class="bet-title">
              【第 {{ mlbGame.currentInning + 1 }} 局】スコア予想
              <span class="countdown">⏱ {{ formatTime(mlbGame.countdown) }}</span>
            </div>
            <div class="grid-3x2">
              <button class="mlb-btn score-btn" @click="handleBet('inning', '0:0', 1.8)">0:0 <span>1.8x</span></button>
              <button class="mlb-btn score-btn" @click="handleBet('inning', '1:0', 2.5)">1:0 <span>2.5x</span></button>
              <button class="mlb-btn score-btn" @click="handleBet('inning', '0:1', 2.5)">0:1 <span>2.5x</span></button>
              <button class="mlb-btn score-btn" @click="handleBet('inning', '2:0', 4.0)">2:0 <span>4.0x</span></button>
              <button class="mlb-btn score-btn" @click="handleBet('inning', '0:2', 4.0)">0:2 <span>4.0x</span></button>
              <button class="mlb-btn score-btn" @click="handleBet('inning', 'other', 10.0)">その他 <span>10x</span></button>
            </div>
          </div>

          <!-- 封盘提示 -->
          <div v-if="!mlbGame.pregameOpen && !mlbGame.inningOpen" class="closed-tip">
            🔒 現在、予想受付を停止しています。
          </div>
        </div>
      </div>

    </div>

    <!-- 购买确认弹窗 -->
    <Transition name="modal">
      <div v-if="showConfirm" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-icon">🎟️</div>
          <h3>購入の確認</h3>
          <p><strong>¥{{ gameCost }}</strong> を消費して「{{ gameName }}」に1回挑戦します。よろしいですか？</p>
          <p class="warning">※抽選結果はシステムによるランダムです。返金はできません。</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showConfirm = false">キャンセル</button>
            <button class="btn-confirm" :style="{ background: currentColor }" @click="executeDraw">購入して挑戦</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 结算凭证票根 (保留原有弹窗，仅改品牌名) -->
    <Transition name="ticket">
      <div v-if="result && showTicket" class="ticket-overlay">
        <div class="ticket-wrapper" :class="result.value > 0 ? 'win' : 'lose'">
          <div class="ticket-top">
            <!-- 🆕 品牌名替换 -->
            <div class="brand">GRANDSLAM OFFICIAL</div>
            <div class="status">{{ result.value > 0 ? '当せん' : 'ハズレ' }}</div>
          </div>
          <div class="ticket-content">
            <div class="result-icon">{{ result.value > 0 ? '🏆' : '💧' }}</div>
            <h2>{{ result.value > 0 ? 'おめでとうございます！' : '残念でした' }}</h2>
            <div class="prize-name">{{ translateName(result.prize) }}</div>
            <div class="prize-value" v-if="result.value > 0">+ ¥{{ result.value.toLocaleString() }}</div>
            <div class="ticket-divider"></div>
            <div class="ticket-info">
              <div class="row"><span>抽選日時</span><strong>{{ currentTime }}</strong></div>
              <div class="row"><span>消費コイン</span><strong>¥{{ gameCost }}</strong></div>
              <div class="row"><span>残高</span><strong>¥{{ result.remainingBalance.toLocaleString() }}</strong></div>
            </div>
          </div>
          <div class="ticket-bottom">
            <div class="barcode"></div>
            <button class="btn-close" @click="closeResult">画面を閉じる</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '../api/request';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

const gameName = route.query.name || '金魚すくい';
const gameCost = Number(route.query.price) || 200;
const gameIcon = route.query.icon || '🐟';

const gameTypeMap = {
  '金魚すくい': 'fish', 'ダーツチャレンジ': 'dart', 'クレーンゲーム': 'crane',
  'ガチャポン': 'gacha', 'スクラッチ': 'scratch', 'ルーレット': 'roulette',
  '宝探し': 'treasure', 'スロット': 'slot'
};
const gameType = computed(() => gameTypeMap[gameName] || 'fish');

const gameSettings = {
  '金魚すくい': { color: '#0ea5e9', bg: '#e0f2fe', desc: 'ポイを破らずに金魚を救え！' },
  'ダーツチャレンジ': { color: '#ef4444', bg: '#fee2e2', desc: 'ブルの真ん中を狙い撃て！' },
  'クレーンゲーム': { color: '#10b981', bg: '#d1fae5', desc: '超豪華プライズをゲットせよ！' },
  'ガチャポン': { color: '#8b5cf6', bg: '#ede9fe', desc: '金のカプセルを引き当てろ！' },
  'スクラッチ': { color: '#ffa502', bg: '#fff7ed', desc: '削って当てる！お手軽スクラッチ' },
  'ルーレット': { color: '#e84118', bg: '#fef2f2', desc: '超高額ルーレットに挑戦せよ！' }, 
  '宝探し': { color: '#009432', bg: '#f0fdf4', desc: '古代の財宝を見つけ出せ！' },
  'スロット': { color: '#f39c12', bg: '#fffbeb', desc: '7を揃えて大当たりを狙え！' }
};

const currentColor = computed(() => gameSettings[gameName]?.color || '#0ea5e9');
const gameDesc = computed(() => gameSettings[gameName]?.desc || 'ポイを破らずに金魚を救え！');

const showConfirm = ref(false);
const isDrawing = ref(false);
const result = ref(null);
const showTicket = ref(false);
const currentBalance = ref(0);
const currentTime = ref('');
const userId = ref(null);

// 跑马灯相关
const marqueePrizes = ref([]);
const currentMarqueeIndex = ref(0);
let marqueeTimer = null;

// ================= 🏆 MLB 竞猜相关状态 =================
const mlbGame = ref(null);
let mlbPollTimer = null;
let mlbCountdownTimer = null;

// 全局 Toast 提示
const toast = ref({ show: false, msg: '', type: 'info' });
const showToast = (msg, type = 'info') => {
  toast.value = { show: true, msg, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

// 格式化时间
const formatTime = (sec) => {
  if (sec <= 0) return '00:00';
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// 轮询获取 MLB 状态
const fetchMLBStatus = async () => {
  try {
    const res = await request.get('/mlb/current');
    if (res.data.success) {
      const prevOpen = mlbGame.value?.inningOpen;
      mlbGame.value = res.data.data;

      if (mlbGame.value.inningOpen && !prevOpen) {
        showToast('⚾ 第 ' + (mlbGame.value.currentInning + 1) + ' 局竞猜开启！', 'success');
      }
    } else {
      mlbGame.value = null;
    }
  } catch (err) {
    console.error('获取 MLB 数据失败', err);
  }
};

// 处理下注
const handleBet = async (betType, selection, odds = 1.5) => {
  if (!userId.value) return;
  
  const amountStr = prompt(
    `【${betType === 'pregame' ? '勝敗予想' : 'イニングスコア'}】\n選択：${selection}\nオッズ：${odds}x\n\nベット額を入力してください (最低 30,000):`, 
    '30000'
  );
  
  if (!amountStr) return;
  const amount = Number(amountStr);

  if (amount < 30000) {
    showToast('最低ベット額は 30,000 pt です', 'error');
    return;
  }
  }

  try {
    const res = await request.post('/mlb/bet', {
      userId: userId.value,
      gamePk: mlbGame.value.gamePk,
      betType,
      targetInning: betType === 'inning' ? mlbGame.value.currentInning + 1 : null,
      selection,
      amount
    });

    if (res.data.success) {
      showToast('下注成功！', 'success');
      currentBalance.value -= amount;
      const user = JSON.parse(localStorage.getItem('user'));
      user.balance = currentBalance.value;
      localStorage.setItem('user', JSON.stringify(user));
    }
  } catch (err) {
    showToast(err.response?.data?.msg || '下注失败', 'error');
  }
};

// ================= 🎯 轮盘核心逻辑 =================
const targetDeg = ref(0); 

const displayPrizes12 = computed(() => {
  let list = [];
  if (marqueePrizes.value.length > 0) {
    list = marqueePrizes.value.map(p => ({ ...p }));
  } else {
    list = [
      { value: 100000, name: '10万' }, { value: 0, name: '0円' },
      { value: 10000, name: '1万' }, { value: 0, name: '0円' },
      { value: 5000, name: '5000' }, { value: 0, name: '0円' }
    ];
  }
  while (list.length < 12) {
    list.push({ value: 0, name: '0円' });
  }
  return list.slice(0, 12);
});

const formatPrize = (val) => {
  if (!val || val === 0) return '0円';
  if (val >= 10000) {
    const w = val / 10000;
    return `${w % 1 === 0 ? w : w.toFixed(1)}万`;
  }
  return val.toLocaleString();
};

const dynamicConicGradient = computed(() => {
  let gradient = 'conic-gradient(';
  const step = 30; 
  displayPrizes12.value.forEach((prize, index) => {
    const startDeg = index * step - 15; 
    const endDeg = (index + 1) * step - 15;
    const color = prize.value > 0 ? '#dc2626' : '#0f172a'; 
    gradient += `${color} ${startDeg}deg ${endDeg}deg, `;
  });
  return { background: gradient.slice(0, -2) + ')' };
});

const getLabelStyle12 = (index) => {
  const angle = index * 30;
  return {
    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-90px) rotate(${-angle}deg)`
  };
};

const wheelStyle = computed(() => {
  if (isDrawing.value || !result.value) {
    return {};
  }
  const targetIdx = displayPrizes12.value.findIndex(p => p.value === result.value.value);
  const safeIdx = targetIdx !== -1 ? targetIdx : 1; 
  const anglePerBlock = 30;
  const finalDeg = 1800 + (360 - safeIdx * anglePerBlock);
  
  return {
    transform: `rotate(${finalDeg}deg)`,
    transition: 'transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)'
  };
});

// 🆕 只做了最轻量的兜底，原有逻辑不变
const translateName = (name) => {
  if (!name) return 'ハズレ';
  if (name === '不中奖' || name === '未中奖' || name === '没中奖' || name === '谢谢参与') {
    return 'ハズレ';
  }
  return name;
};

// 音效引擎
let audioCtx = null;
let spinInterval = null;
const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
};
const playSpinSound = () => {
  let tick = true;
  spinInterval = setInterval(() => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(tick ? 800 : 600, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    tick = !tick;
  }, 100); 
};
const playWinSound = () => {
  if (!audioCtx) return;
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
    setTimeout(() => {
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.type = 'triangle'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    }, i * 80);
  });
};
const playLoseSound = () => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
  osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + 0.5);
};

onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return router.push('/login');
  const user = JSON.parse(storedUser);
  userId.value = user.id;
  if (route.query.balance) currentBalance.value = Number(route.query.balance);

  try {
    const infoRes = await request.get(`/user/info/${user.id}`);
    if (infoRes.data.success) {
      currentBalance.value = infoRes.data.user.balance;
      user.balance = infoRes.data.user.balance;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    const poolRes = await request.get(`/admin/probability?gameName=${gameName}`);
    if (poolRes.data.success && poolRes.data.probability) {
      marqueePrizes.value = poolRes.data.probability
        .filter(p => p.probability > 0)
        .sort((a, b) => b.value - a.value); 
    }
  } catch (error) {
    console.warn('ユーザー情報の取得に失敗しました', error);
  }

  fetchMLBStatus();
  mlbPollTimer = setInterval(fetchMLBStatus, 30000); 
  
  mlbCountdownTimer = setInterval(() => {
    if (mlbGame.value && mlbGame.value.inningOpen && mlbGame.value.countdown > 0) {
      mlbGame.value.countdown--;
      if (mlbGame.value.countdown === 0) {
        mlbGame.value.inningOpen = false;
        showToast('🔒 第 ' + (mlbGame.value.currentInning + 1) + ' 局下注已封盘', 'warning');
      }
    }
  }, 1000);
});

onUnmounted(() => {
  if (spinInterval) clearInterval(spinInterval);
  if (marqueeTimer) clearInterval(marqueeTimer);
  if (audioCtx) audioCtx.close();
  if (mlbPollTimer) clearInterval(mlbPollTimer);
  if (mlbCountdownTimer) clearInterval(mlbCountdownTimer);
});

const checkAuth = () => {
  if (currentBalance.value < gameCost) {
    ElMessage.warning('残高が不足しています。入金してください。');
    return;
  }
  showConfirm.value = true;
};

const executeDraw = async () => {
  if (!userId.value) return;
  initAudio(); 
  showConfirm.value = false;
  isDrawing.value = true;
  result.value = null;
  showTicket.value = false;
  playSpinSound();
  
  if (marqueeTimer) clearInterval(marqueeTimer);
  marqueeTimer = setInterval(() => {
    currentMarqueeIndex.value = (currentMarqueeIndex.value + 1) % marqueePrizes.value.length;
  }, 60); 
  
  setTimeout(async () => {
    try {
      const res = await request.post('/user/draw', { userId: userId.value, gameName: gameName, cost: gameCost });
      
      if (res.data.success) {
        result.value = res.data.data;
        currentBalance.value = res.data.data.remainingBalance;
        currentTime.value = new Date().toLocaleString('ja-JP', { hour12: false });
        
        setTimeout(() => {
          if (spinInterval) clearInterval(spinInterval);
          
          isDrawing.value = false; 
          
          const targetIndexMarquee = marqueePrizes.value.findIndex(p => p.name === result.value.prize || (result.value.value === 0 && p.value === 0));
          if (marqueeTimer) clearInterval(marqueeTimer);
          if (targetIndexMarquee !== -1) {
            currentMarqueeIndex.value = targetIndexMarquee; 
          }
          
          setTimeout(() => {
            if (result.value.value > 0) playWinSound(); else playLoseSound();
            setTimeout(() => {
              showTicket.value = true;
            }, 500);
          }, 4500);
          
        }, 8500); 
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '通信エラーが発生しました。');
      if (spinInterval) clearInterval(spinInterval);
      if (marqueeTimer) clearInterval(marqueeTimer);
      isDrawing.value = false;
    }
  }, 0); 
};

const closeResult = () => { result.value = null; showTicket.value = false; };
</script>

<style scoped>
/* ================= 核心布局调整 ================= */
.stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; width: 100%; box-sizing: border-box; }
.machine-body { background: #ffffff; border-radius: 30px; padding: 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.1); margin-bottom: 40px; transition: all 0.5s; width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
.machine-body.is-win-glow { box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 80px rgba(255, 215, 0, 0.6); transform: scale(1.02); }
.game-stage-3d { width: 100%; max-width: 320px; aspect-ratio: 1 / 1; background: radial-gradient(circle at center, #ffffff 0%, #e2e8f0 100%); border-radius: 20px; position: relative; overflow: hidden; box-shadow: inset 0 15px 30px rgba(0,0,0,0.1); display: flex; justify-content: center; align-items: center; perspective: 1000px; }

/* ================= 🏆 MLB 竞猜面板样式 ================= */
.mlb-panel { width: 100%; max-width: 400px; background: #0f172a; border-radius: 20px; padding: 15px; margin-top: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #334155; box-sizing: border-box; }
.mlb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.live-tag { background: #ef4444; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 900; animation: pulse-live 1s infinite alternate; }
@keyframes pulse-live { 0% { opacity: 0.7; } 100% { opacity: 1; } }
.preview-tag { background: #64748b; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 900; }
.inning-info { color: #94a3b8; font-size: 13px; font-weight: bold; }
.match-info { display: flex; justify-content: space-between; align-items: center; background: #1e293b; border-radius: 12px; padding: 15px 20px; margin-bottom: 15px; }
.match-info .team { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.match-info .name { color: #e2e8f0; font-size: 14px; font-weight: bold; text-align: center; }
.match-info .score { color: #fbbf24; font-size: 28px; font-weight: 900; font-family: monospace; }
.match-info .vs { color: #475569; font-weight: 900; font-size: 14px; }
.betting-area { display: flex; flex-direction: column; gap: 12px; }
.bet-title { color: #e2e8f0; font-size: 13px; font-weight: bold; margin-bottom: 8px; display: flex; justify-content: space-between; }
.countdown { color: #ef4444; font-family: monospace; background: #450a0a; padding: 2px 6px; border-radius: 4px; }
.btn-group { display: flex; gap: 10px; }
.mlb-btn { flex: 1; background: #1e293b; border: 1px solid #334155; color: white; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.mlb-btn:hover { background: #334155; border-color: #3b82f6; }
.grid-3x2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.score-btn { font-size: 13px; padding: 10px 5px; display: flex; flex-direction: column; align-items: center; }
.score-btn span { font-size: 11px; color: #fbbf24; margin-top: 4px; }
.closed-tip { text-align: center; color: #64748b; font-size: 13px; font-weight: bold; padding: 15px; background: #1e293b; border-radius: 8px; }
.global-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); padding: 10px 24px; border-radius: 20px; font-weight: 900; color: white; z-index: 10000; white-space: nowrap; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
.global-toast.success { background: #10b981; }
.global-toast.warning { background: #f59e0b; }
.global-toast.error { background: #ef4444; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { transform: translate(-50%, -50px); opacity: 0; }

/* ================= 以下为其它游戏机的样式 (已全部包含) ================= */
.roulette-scene { position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
.roulette-ball-pointer { position: absolute; top: 2%; left: 50%; transform: translateX(-50%); font-size: 24px; color: #fff; text-shadow: 0 4px 10px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.8); z-index: 50; animation: bounce-ball 1.5s infinite alternate ease-in-out; }
@keyframes bounce-ball { 0% { transform: translateX(-50%) translateY(0) scale(1); } 100% { transform: translateX(-50%) translateY(-5px) scale(1.1); } }
.wheel-3d-container { width: 260px; height: 260px; position: relative; border-radius: 50%; box-shadow: 0 30px 40px rgba(0,0,0,0.7), 0 0 0 8px #111827, 0 0 0 10px #475569, inset 0 0 30px rgba(0,0,0,0.9); background: #0f172a; transform-style: preserve-3d; }
.wheel-rotating-layer { position: absolute; inset: 12px; border-radius: 50%; will-change: transform; }
.wheel-rotating-layer.is-spinning { animation: spin-fast 0.6s linear infinite; }
@keyframes spin-fast { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.wheel-blocks { position: absolute; inset: 0; border-radius: 50%; box-shadow: inset 0 0 20px rgba(0,0,0,0.8); }
.wheel-label { position: absolute; top: 50%; left: 50%; width: 44px; height: 20px; margin: -10px -22px; display: flex; justify-content: center; align-items: center; color: #fff; font-size: 13px; font-weight: 900; font-family: monospace, sans-serif; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 2px 4px rgba(0,0,0,0.9); z-index: 5; }
.wheel-3d-sphere-overlay { position: absolute; inset: 12px; border-radius: 50%; pointer-events: none; z-index: 8; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 40%), radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.7) 100%); box-shadow: inset 0 10px 20px rgba(255,255,255,0.1), inset 0 -10px 30px rgba(0,0,0,0.9); }
.wheel-center-tower { position: absolute; inset: 60px; border-radius: 50%; background: radial-gradient(circle at 40% 30%, #475569 0%, #0f172a 80%); box-shadow: inset 0 8px 15px rgba(255,255,255,0.2), inset 0 -8px 20px rgba(0,0,0,0.9), 0 10px 20px rgba(0,0,0,0.8), 0 0 0 4px #1e293b; z-index: 10; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 2px solid #64748b; }
.tower-top { color: #fbbf24; font-size: 22px; font-weight: 900; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.8); font-family: serif; }
.tower-cross { position: relative; width: 50px; height: 50px; margin-top: 5px; }
.cross-bar { position: absolute; top: 50%; left: 50%; width: 100%; height: 4px; background: linear-gradient(180deg, #fef08a, #ca8a04); border-radius: 2px; transform: translate(-50%, -50%); box-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.cross-bar:nth-child(2) { transform: translate(-50%, -50%) rotate(90deg); }
.win-glow { position: absolute; inset: -15px; border-radius: 50%; background: radial-gradient(circle, rgba(253, 224, 71, 0.5) 0%, transparent 70%); animation: pulse-glow 1.5s infinite alternate; z-index: 1; pointer-events: none; }
@keyframes pulse-glow { 0% { transform: scale(0.9); opacity: 0.5; } 100% { transform: scale(1.1); opacity: 1; } }
.roulette-prize { top: 15%; left: 50%; transform: translateX(-50%); animation-delay: 4.5s; z-index: 60; }

.bandai-gacha-machine { width: 260px; height: 300px; background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 40px 40px 20px 20px; position: relative; display: flex; flex-direction: column; align-items: center; box-shadow: inset 0 5px 10px rgba(255,255,255,1), inset 0 -10px 20px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.2); border: 2px solid #cbd5e1; transform-style: preserve-3d; }
.machine-brand { width: 100%; display: flex; justify-content: space-between; padding: 10px 20px; box-sizing: border-box; position: absolute; top: 0; z-index: 10; }
.logo-red { background: #ef4444; color: white; font-weight: 900; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-family: sans-serif; }
.logo-blue { color: #1d4ed8; font-weight: 900; font-size: 12px; font-style: italic; font-family: sans-serif; }
.acrylic-dome { width: 220px; height: 160px; margin-top: 30px; background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 50%, rgba(200,220,240,0.4) 100%); border-radius: 100px 100px 20px 20px; position: relative; overflow: hidden; box-shadow: inset 0 0 20px rgba(255,255,255,0.9), inset 10px 10px 20px rgba(255,255,255,0.5), 0 5px 15px rgba(0,0,0,0.1); border: 3px solid rgba(255,255,255,0.9); border-bottom: 8px solid #cbd5e1; z-index: 2; }
.dome-shelf { position: absolute; bottom: 25%; width: 100%; height: 8px; background: rgba(255,255,255,0.6); box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-radius: 4px; }
.capsule-pile { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
.ball { position: absolute; width: 32px; height: 32px; border-radius: 50%; box-shadow: inset -5px -5px 10px rgba(0,0,0,0.2), inset 4px 4px 8px rgba(255,255,255,0.8), 0 3px 6px rgba(0,0,0,0.15); }
.ball-1 { background: radial-gradient(circle at 30% 30%, #fca5a5, #ef4444); top: 40px; left: 30px; }
.ball-2 { background: radial-gradient(circle at 30% 30%, #93c5fd, #3b82f6); top: 60px; left: 70px; }
.ball-3 { background: radial-gradient(circle at 30% 30%, #86efac, #22c55e); top: 35px; left: 110px; }
.ball-4 { background: radial-gradient(circle at 30% 30%, #fde047, #eab308); top: 65px; left: 150px; }
.ball-5 { background: radial-gradient(circle at 30% 30%, #d8b4fe, #a855f7); top: 95px; left: 40px; }
.ball-6 { background: radial-gradient(circle at 30% 30%, #f9a8d4, #ec4899); top: 100px; left: 90px; }
.ball-7 { background: radial-gradient(circle at 30% 30%, #67e8f9, #06b6d4); top: 90px; left: 140px; }
.ball-8 { background: radial-gradient(circle at 30% 30%, #fdba74, #f97316); top: 120px; left: 70px; }
.acrylic-dome.is-spinning .ball { animation: ball-shake 0.15s infinite alternate; }
.acrylic-dome.is-spinning .ball:nth-child(odd) { animation-delay: 0.05s; }
.acrylic-dome.is-spinning .ball:nth-child(even) { animation-delay: 0.1s; }
@keyframes ball-shake { 0% { transform: translate(0, 0) rotate(0deg); } 100% { transform: translate(3px, -6px) rotate(30deg); } }
.spin-blur { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.4) 100%); z-index: 5; animation: blur-pulse 0.15s infinite alternate; }
@keyframes blur-pulse { 0% { opacity: 0.3; } 100% { opacity: 0.8; } }
.dome-highlight { position: absolute; top: 10px; left: 20px; width: 60px; height: 40px; background: linear-gradient(135deg, rgba(255,255,255,1) 0%, transparent 100%); border-radius: 50%; transform: rotate(-30deg); z-index: 6; pointer-events: none; }
.machine-body-lower { width: 100%; height: 110px; background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%); border-radius: 0 0 20px 20px; display: flex; position: relative; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border-top: 2px solid #e2e8f0; z-index: 1; }
.lower-left { width: 40%; display: flex; flex-direction: column; justify-content: space-around; align-items: center; border-right: 2px solid #cbd5e1; }
.coin-slot { font-size: 24px; color: #64748b; }
.side-crank { width: 30px; height: 30px; background: #cbd5e1; border-radius: 50%; position: relative; box-shadow: inset 0 -3px 5px rgba(0,0,0,0.2), 0 3px 5px rgba(0,0,0,0.1); }
.side-crank.is-turning { animation: crank-turn 0.5s infinite linear; }
@keyframes crank-turn { 100% { transform: rotate(360deg); } }
.crank-handle { position: absolute; top: 50%; left: 50%; width: 40px; height: 10px; background: #94a3b8; border-radius: 5px; transform: translate(-50%, -50%); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.lower-right { width: 60%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 10px 0; }
.big-knob { width: 60px; height: 60px; background: radial-gradient(circle at 30% 30%, #60a5fa, #2563eb); border-radius: 50%; border: 4px solid #e2e8f0; box-shadow: 0 5px 10px rgba(0,0,0,0.2), inset 0 -4px 8px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; margin-top: -30px; z-index: 5; }
.big-knob.is-turning { animation: knob-turn 0.5s infinite linear; }
@keyframes knob-turn { 100% { transform: rotate(360deg); } }
.knob-inner { font-size: 24px; color: white; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.exit-chute { width: 70px; height: 50px; background: #1e293b; border-radius: 10px 10px 5px 5px; margin-bottom: 5px; position: relative; box-shadow: inset 0 8px 15px rgba(0,0,0,0.8); perspective: 200px; }
.chute-flap { position: absolute; top: 0; width: 100%; height: 100%; background: linear-gradient(180deg, #e2e8f0, #94a3b8); border-radius: 10px 10px 0 0; transform-origin: top; transform: rotateX(0deg); transition: transform 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; overflow: hidden; }
.chute-flap.is-pushing { transform: rotateX(80deg); }
.dropped-capsule { position: absolute; bottom: 0; width: 50px; height: 60px; animation: drop-out 1s cubic-bezier(0.25, 1, 0.5, 1) forwards; transform-style: preserve-3d; }
@keyframes drop-out { 0% { transform: translateY(-30px) scale(0.8); opacity: 0; } 50% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
.capsule-half { position: absolute; width: 100%; height: 50%; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5); }
.capsule-half.top { top: 0; border-radius: 25px 25px 0 0; }
.capsule-half.bottom { bottom: 0; border-radius: 0 0 25px 25px; }
.win-bg { background: linear-gradient(180deg, #fef08a, #eab308); border: 1px solid #ca8a04; }
.lose-bg { background: linear-gradient(180deg, #e2e8f0, #94a3b8); border: 1px solid #64748b; }
.capsule-prize-text { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; font-size: 14px; font-weight: 900; z-index: 2; text-align: center; }
.win-text { color: #b45309; text-shadow: 0 1px 2px rgba(255,255,255,0.8); }
.lose-text { color: #334155; font-size: 11px; }
.machine-stickers { position: absolute; bottom: 8px; left: 8px; display: flex; flex-direction: column; gap: 6px; }
.sticker { font-size: 10px; font-weight: bold; padding: 3px 6px; border-radius: 3px; font-family: sans-serif; text-align: center; }
.sticker.warning { background: #fef08a; color: #854d0e; border: 1px solid #ca8a04; font-size: 12px; letter-spacing: 1px; }
.sticker.instructions { background: #e0f2fe; color: #0369a1; font-size: 9px; line-height: 1.2; display: flex; flex-direction: column; align-items: center; padding: 4px; width: 54px; }

.room-container { position: relative; min-height: 100vh; display: flex; flex-direction: column; overflow: hidden; background: #050508; font-family: 'Noto Sans JP', sans-serif; }
.hologram-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.aurora { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.5; mix-blend-mode: screen; animation: aurora-flow 15s infinite alternate ease-in-out; }
.aurora-1 { width: 800px; height: 800px; background: #e83862; top: -300px; left: -200px; }
.aurora-2 { width: 900px; height: 900px; background: #0ea5e9; bottom: -300px; right: -200px; animation-delay: -5s; }
.aurora-3 { width: 600px; height: 600px; background: #8b5cf6; top: 30%; left: 40%; animation-delay: -10s; }
.theme-slot .aurora-1 { background: #f39c12; } .theme-slot .aurora-2 { background: #e84118; }
.theme-crane .aurora-1 { background: #10b981; } .theme-crane .aurora-2 { background: #0abde3; }
.theme-roulette .aurora-1 { background: #e84118; } .theme-roulette .aurora-2 { background: #ff4757; }
.theme-gacha .aurora-1 { background: #8b5cf6; } .theme-gacha .aurora-2 { background: #d946ef; }
.theme-treasure .aurora-1 { background: #eab308; } .theme-treasure .aurora-2 { background: #ca8a04; }
.theme-fish .aurora-1 { background: #0ea5e9; } .theme-fish .aurora-2 { background: #2dd4bf; }
.theme-dart .aurora-1 { background: #ef4444; } .theme-dart .aurora-2 { background: #f97316; }
.theme-scratch .aurora-1 { background: #f59e0b; } .theme-scratch .aurora-2 { background: #eab308; }
@keyframes aurora-flow { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(100px, 100px) scale(1.2); } }
.stars-container { position: absolute; inset: 0; perspective: 800px; overflow: hidden; }
.star-group { position: absolute; inset: -50%; background-image: radial-gradient(1.5px 1.5px at 20px 30px, #fff, transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 90px 40px, #fff, transparent); background-repeat: repeat; background-size: 200px 200px; animation: stars-move 20s linear infinite; }
.star-1 { animation-duration: 30s; opacity: 0.6; } .star-2 { animation-duration: 20s; opacity: 0.8; background-size: 300px 300px; } .star-3 { animation-duration: 10s; opacity: 1; background-size: 150px 150px; }
@keyframes stars-move { 0% { transform: translateZ(0) translateY(0); } 100% { transform: translateZ(200px) translateY(-200px); } }
.floor-reflection { position: absolute; bottom: -10%; left: 0; width: 100%; height: 300px; background: linear-gradient(to top, rgba(255,255,255,0.05), transparent); transform: perspective(500px) rotateX(70deg); transform-origin: bottom; }
.room-header, .stage { position: relative; z-index: 10; }
.floating-back-btn { position: fixed; top: 60px; left: 20px; z-index: 999; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; color: white; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
.floating-back-btn:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }
.room-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; color: white; }
.title { font-weight: 900; font-size: 18px; letter-spacing: 1px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
.prize-tag { position: absolute; padding: 4px 12px; border-radius: 20px; font-weight: 900; font-size: 18px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 50; animation: pop-out 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
.prize-tag.is-win { background: linear-gradient(135deg, #fde047, #eab308); color: #b45309; border: 2px solid #fff; }
.prize-tag.is-lose { background: #64748b; color: #fff; border: 2px solid #475569; }
@keyframes pop-out { 0% { transform: scale(0) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }

.fish-bowl { width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle at 50% 20%, #bae6fd, #38bdf8); position: relative; box-shadow: inset 0 20px 40px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.1); overflow: hidden; border: 4px solid #e2e8f0; }
.water { position: absolute; bottom: 0; width: 100%; height: 70%; background: rgba(255,255,255,0.2); transition: 0.3s; }
.water.is-rippling { animation: ripple 0.3s linear infinite; }
@keyframes ripple { 0%, 100% { transform: scaleY(1); opacity: 0.2; } 50% { transform: scaleY(1.1); opacity: 0.4; } }
.fish-entity { position: absolute; bottom: 20px; left: 20%; font-size: 40px; transition: 0.3s; z-index: 2; }
.fish-entity.is-swimming { animation: swim 3s infinite alternate ease-in-out; }
@keyframes swim { 0% { transform: translate(0, 0) scaleX(1); } 100% { transform: translate(100px, -20px) scaleX(-1); } }
.fish-entity.is-caught { animation: caught 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes caught { 0% { bottom: 20px; left: 20%; } 100% { bottom: 140px; left: 50%; font-size: 60px; transform: translateX(-50%) rotate(15deg); } }
.fish-entity.is-escaped { animation: escape 0.5s ease-in forwards; }
@keyframes escape { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: translate(-50px, -50px) scale(0.5); } }
.poi { position: absolute; top: 20%; left: 50%; transform: translateX(-50%); font-size: 60px; transition: 0.5s; z-index: 5; }
.poi.is-scooping { animation: scoop 1.5s infinite alternate ease-in-out; }
@keyframes scoop { 0% { top: 20%; left: 50%; transform: translateX(-50%) rotate(0); } 100% { top: 60%; left: 40%; transform: translateX(-50%) rotate(-30deg); } }
.poi.is-broken { top: 60%; left: 40%; transform: translateX(-50%) rotate(-30deg); opacity: 0.6; }
.splash-effect { position: absolute; bottom: 140px; left: 50%; transform: translateX(-50%); font-size: 50px; animation: splash 0.8s ease-out forwards; }
@keyframes splash { 0% { transform: translate(-50%, 0) scale(0.5); opacity: 1; } 100% { transform: translate(-50%, -60px) scale(1.5); opacity: 0; } }
.fish-prize { top: 30%; left: 50%; transform: translateX(-50%); animation-delay: 0.8s; }

.dart-board { width: 220px; height: 220px; border-radius: 50%; background: conic-gradient(#ef4444 0deg 20deg, #f1f5f9 20deg 40deg, #3b82f6 40deg 60deg, #f1f5f9 60deg 80deg, #ef4444 80deg 100deg, #f1f5f9 100deg 120deg, #3b82f6 120deg 140deg, #f1f5f9 140deg 160deg, #ef4444 160deg 180deg, #f1f5f9 180deg 200deg, #3b82f6 200deg 220deg, #f1f5f9 220deg 240deg, #ef4444 240deg 260deg, #f1f5f9 260deg 280deg, #3b82f6 280deg 300deg, #f1f5f9 300deg 320deg, #ef4444 320deg 340deg, #f1f5f9 340deg 360deg); position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.2); border: 8px solid #334155; }
.board-rings { position: absolute; inset: 20%; border-radius: 50%; border: 4px solid #334155; background: #fff; }
.dart { position: absolute; top: -20%; left: 50%; font-size: 40px; transform: translateX(-50%); transition: 0.3s; }
.dart.is-thrown { animation: throw-dart 1s forwards ease-in; }
.dart.is-hit { top: 45%; animation: none; transform: translateX(-50%) scale(0.8); }
@keyframes throw-dart { 0% { top: -20%; transform: translateX(-50%) scale(1); } 100% { top: 45%; transform: translateX(-50%) scale(0.8); } }
.dart-prize { top: 10%; left: 50%; transform: translateX(-50%); animation-delay: 1s; }

.crane-scene { width: 100%; height: 100%; position: relative; perspective: 800px; }
.crane-rail { position: absolute; top: 10%; width: 100%; height: 15px; background: linear-gradient(180deg, #94a3b8, #64748b); transform: rotateX(60deg); }
.claw-3d { position: absolute; top: 10%; left: 50%; transform: translateX(-50%) translateZ(50px); transition: top 1.5s ease-in-out; transform-style: preserve-3d; display: flex; flex-direction: column; align-items: center; }
.claw-3d.is-dropping { top: 50%; }
.claw-3d.is-grabbing { animation: grab-up 1.5s ease-in-out forwards; animation-delay: 1s; }
@keyframes grab-up { 0% { top: 50%; } 100% { top: 15%; } }
.claw-wire { width: 4px; height: 70px; background: linear-gradient(90deg, #94a3b8, #e2e8f0, #94a3b8); }
.claw-motor { width: 40px; height: 25px; background: linear-gradient(180deg, #cbd5e1, #475569); border-radius: 5px; box-shadow: 0 5px 10px rgba(0,0,0,0.3); margin-bottom: 5px; }
.claw-pincers { position: relative; width: 50px; height: 40px; }
.pincer { position: absolute; top: 0; width: 8px; height: 50px; background: linear-gradient(90deg, #64748b, #cbd5e1); border-radius: 4px; transition: transform 0.3s; transform-origin: top center; }
.pincer.left { left: 10px; transform: rotate(20deg); }
.pincer.right { right: 10px; transform: rotate(-20deg); }
.claw-3d.is-grabbing .pincer.left { transform: rotate(0deg); }
.claw-3d.is-grabbing .pincer.right { transform: rotate(0deg); }
.prize-bed { position: absolute; bottom: 15%; width: 100%; text-align: center; transition: 0.5s; }
.prize-3d { font-size: 80px; filter: drop-shadow(0 20px 10px rgba(0,0,0,0.4)); transition: transform 0.5s; }
.prize-bed.is-caught .prize-3d { animation: prize-fly 1s forwards; animation-delay: 1s; }
@keyframes prize-fly { 0% { transform: scale(1); } 50% { transform: scale(0.8) translateY(-100px); opacity: 0; } 100% { transform: scale(0) translateY(-200px); opacity: 0; } }
.coin-drop { position: absolute; bottom: 30%; left: 50%; transform: translateX(-50%); z-index: 20; }
.coin { padding: 10px 20px; border-radius: 30px; background: radial-gradient(circle, #fde047, #ca8a04); font-size: 20px; font-weight: 900; color: #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.5); animation: drop-coin 1s cubic-bezier(0.25, 1, 0.5, 1) forwards; animation-delay: 1.8s; opacity: 0; border: 4px dashed #fef08a; }
@keyframes drop-coin { 0% { transform: translateY(-100px) scale(0.5); opacity: 0; } 60% { transform: translateY(0) scale(1.1); opacity: 1; } 80% { transform: translateY(-20px) scale(1); } 100% { transform: translateY(0) scale(1); opacity: 1; } }

.scratch-scene { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; position: relative; }
.scratch-card { width: 200px; height: 200px; background: #fff; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); position: relative; overflow: hidden; }
.scratch-content { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; font-size: 80px; background: #f8fafc; }
.scratch-cover { position: absolute; inset: 0; background: linear-gradient(45deg, #94a3b8, #cbd5e1); z-index: 10; transition: transform 0.5s; }
.scratch-cover.is-scratching { animation: scratch-action 0.2s infinite alternate; }
@keyframes scratch-action { 0% { transform: translate(0, 0) rotate(0); } 100% { transform: translate(10px, 10px) rotate(5deg); } }
.scratch-card.is-scratched .scratch-cover { transform: translateY(-100%); }
.scratch-prize { position: absolute; top: 30%; z-index: 20; animation-delay: 0.5s; }

.treasure-chest { width: 200px; height: 150px; position: relative; perspective: 500px; }
.chest-base { position: absolute; bottom: 0; width: 100%; height: 60%; background: #78350f; border-radius: 10px; border: 4px solid #451a03; }
.chest-lid { position: absolute; top: 0; width: 100%; height: 40%; background: #92400e; border-radius: 50% 50% 0 0; border: 4px solid #451a03; transform-origin: bottom; transition: transform 0.5s; }
.chest-lid.is-opening { transform: rotateX(110deg); }
.is-shaking { animation: shake 0.1s infinite; }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
.golden-fountain { position: absolute; top: 0; left: 50%; width: 100px; height: 100px; transform: translateX(-50%); pointer-events: none; z-index: 20; }
.golden-fountain .coin { position: absolute; width: 20px; height: 20px; background: radial-gradient(circle, #fde047, #ca8a04); border-radius: 50%; font-size: 12px; font-weight: bold; color: #fff; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); opacity: 0; }
.golden-fountain .c1 { left: 10%; animation: fly1 0.8s 0.5s forwards ease-out; }
.golden-fountain .c2 { right: 10%; animation: fly2 0.8s 0.6s forwards ease-out; }
.golden-fountain .main-coin { width: auto; border-radius: 20px; padding: 4px 12px; left: 50%; transform: translateX(-50%); top: 20px; font-size: 16px; animation: pop-coin 0.6s 0.7s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes fly1 { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(-40px, -50px) scale(0.5); opacity: 0; } }
@keyframes fly2 { 0% { transform: translate(0, 0); opacity: 1; } 100% { transform: translate(40px, -60px) scale(0.5); opacity: 0; } }
@keyframes pop-coin { 0% { opacity: 0; transform: translateX(-50%) scale(0.5); top: -20px; } 100% { opacity: 1; transform: translateX(-50%) scale(1); top: -40px; } }

.slot-machine-3d { display: flex; gap: 20px; position: relative; perspective: 800px; }
.reel-container { position: relative; width: 80px; height: 200px; background: #111827; border-radius: 10px; overflow: hidden; box-shadow: inset 0 0 20px rgba(0,0,0,0.9), 0 10px 20px rgba(0,0,0,0.5); border: 3px solid #475569; }
.reel-3d { width: 100%; height: 100%; position: absolute; transform-style: preserve-3d; transform: rotateX(-120deg); }
.reel-3d.is-spinning { animation: spin-cylinder 0.4s linear infinite; }
.reel-3d.is-stopped { animation: stop-cylinder 1.5s cubic-bezier(0.17, 0.89, 0.32, 1.25) forwards; }
@keyframes spin-cylinder { 0% { transform: rotateX(0deg); } 100% { transform: rotateX(360deg); } }
@keyframes stop-cylinder { 0% { transform: rotateX(-720deg); } 90% { transform: rotateX(-115deg); } 100% { transform: rotateX(-120deg); } }
.symbol { position: absolute; width: 100%; height: 60px; top: 50%; margin-top: -30px; display: flex; justify-content: center; align-items: center; font-size: 45px; font-weight: 900; color: #cbd5e1; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 6px; border: 1px solid #334155; backface-visibility: hidden; text-shadow: 0 4px 5px rgba(0,0,0,0.5); }
.face-0 { transform: rotateX(0deg) translateZ(52px); }
.face-1 { transform: rotateX(60deg) translateZ(52px); }
.face-2 { transform: rotateX(120deg) translateZ(52px); }
.face-3 { transform: rotateX(180deg) translateZ(52px); }
.face-4 { transform: rotateX(240deg) translateZ(52px); }
.face-5 { transform: rotateX(300deg) translateZ(52px); }
.symbol.win-symbol { color: #ef4444; font-size: 55px; text-shadow: 0 0 15px #ef4444, 0 0 30px #b91c1c; background: linear-gradient(180deg, #fff 0%, #f1f5f9 100%); }
.cylinder-gloss { position: absolute; inset: 0; pointer-events: none; border-radius: 8px; background: linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.85) 100%), linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(255,255,255,0.2) 15%, transparent 50%, rgba(255,255,255,0.2) 85%, rgba(0,0,0,0.6) 100%); z-index: 10; }
.slot-machine-glass { position: absolute; inset: -15px; border-radius: 15px; background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%); pointer-events: none; z-index: 20; }

.control-panel { margin-top: 20px; text-align: center; width: 100%; }
.desc { font-size: 13px; color: #64748b; margin-bottom: 15px; font-weight: bold; }
.balance-display { background: #0f172a; border-radius: 12px; padding: 12px 24px; display: inline-flex; flex-direction: column; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5); }
.balance-display .label { font-size: 10px; color: #94a3b8; letter-spacing: 2px; margin-bottom: 4px; }
.balance-display .amount { font-size: 24px; font-weight: 900; color: #38bdf8; font-family: monospace; text-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
.heavy-btn { width: 100%; max-width: 320px; padding: 20px; border: none; border-radius: 30px; color: white; font-size: 18px; font-weight: 900; letter-spacing: 2px; cursor: pointer; position: relative; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.3), inset 0 -4px 0 rgba(0,0,0,0.3); transition: all 0.1s; }
.heavy-btn:active { transform: translateY(4px); box-shadow: 0 4px 10px rgba(0,0,0,0.2), inset 0 -2px 0 rgba(0,0,0,0.3); }
.heavy-btn:disabled { background: #94a3b8 !important; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-shine { position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transform: skewX(-20deg); animation: shine 3s infinite; }
@keyframes shine { 100% { left: 200%; } }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-card { background: white; padding: 30px; border-radius: 24px; width: 85%; max-width: 320px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
.modal-icon { font-size: 40px; margin-bottom: 10px; }
.modal-card h3 { margin-bottom: 10px; font-size: 20px; font-weight: 900; }
.modal-card p { color: #64748b; font-size: 14px; margin-bottom: 10px; line-height: 1.5; }
.modal-card .warning { color: #ef4444; font-size: 12px; margin-bottom: 20px; }
.modal-actions { display: flex; gap: 12px; }
.modal-actions button { flex: 1; padding: 14px; border-radius: 16px; border: none; font-weight: bold; font-size: 15px; cursor: pointer; }
.btn-cancel { background: #f1f5f9; color: #64748b; }
.btn-confirm { color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }

.ticket-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.ticket-wrapper { width: 85%; max-width: 340px; background: #fff; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden; position: relative; }
.ticket-top { padding: 20px; display: flex; justify-content: space-between; align-items: center; color: white; }
.win .ticket-top { background: linear-gradient(135deg, #ef4444, #f43f5e); }
.lose .ticket-top { background: #64748b; }
.brand { font-weight: 900; font-size: 12px; letter-spacing: 1px; }
.status { font-weight: 900; font-size: 14px; }
.ticket-content { padding: 30px 20px; text-align: center; }
.result-icon { font-size: 60px; margin-bottom: 15px; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1)); }
.ticket-content h2 { font-size: 22px; margin-bottom: 10px; font-weight: 900; }
.prize-name { font-size: 16px; color: #64748b; margin-bottom: 10px; font-weight: bold; }
.prize-value { font-size: 36px; color: #ef4444; font-weight: 900; }
.ticket-divider { border-bottom: 2px dashed #e2e8f0; margin: 25px 0; position: relative; }
.ticket-divider::before, .ticket-divider::after { content: ''; position: absolute; top: -10px; width: 20px; height: 20px; background: #0f172a; border-radius: 50%; }
.ticket-divider::before { left: -30px; }
.ticket-divider::after { right: -30px; }
.ticket-info { text-align: left; font-size: 13px; color: #64748b; }
.ticket-info .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
.ticket-info strong { color: #1e293b; font-family: monospace; font-size: 14px; }
.ticket-bottom { padding: 20px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; }
.barcode { height: 40px; width: 80%; margin: 0 auto 15px; background: repeating-linear-gradient(90deg, #1e293b, #1e293b 2px, transparent 2px, transparent 5px); opacity: 0.8; }
.btn-close { width: 100%; padding: 15px; background: #1e293b; color: white; border: none; border-radius: 16px; font-weight: bold; font-size: 15px; cursor: pointer; transition: 0.2s; }
.btn-close:hover { background: #0f172a; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-card { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes popIn { 0% { transform: scale(0.8); } 100% { transform: scale(1); } }
.ticket-enter-active { transition: opacity 0.4s; }
.ticket-enter-active .ticket-wrapper { animation: ticketDrop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.ticket-leave-active { transition: opacity 0.3s; }
.ticket-leave-to { opacity: 0; }
@keyframes ticketDrop { 0% { transform: translateY(-50px) scale(0.9); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }

.marquee-board { width: 100%; margin-top: 15px; padding: 10px; background: rgba(0, 0, 0, 0.3); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-sizing: border-box; }
.marquee-scroll { display: flex; flex-wrap: nowrap; gap: 8px; overflow-x: auto; padding-bottom: 5px; }
.marquee-scroll::-webkit-scrollbar { height: 4px; }
.marquee-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
.marquee-item { flex-shrink: 0; background: #1e293b; color: #94a3b8; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; font-family: monospace; transition: all 0.1s; border: 2px solid transparent; }
.marquee-item.is-active { background: #e83862; color: white; transform: scale(1.1); box-shadow: 0 0 15px rgba(232, 56, 98, 0.8); z-index: 10; }
.marquee-item.is-active.is-win { background: linear-gradient(135deg, #fde047, #eab308); color: #b45309; border-color: #fff; box-shadow: 0 0 20px rgba(253, 224, 71, 1); animation: win-pulse 1.5s infinite alternate; }
.marquee-item.is-active.is-lose { background: #64748b; color: white; border-color: #cbd5e1; }
@keyframes win-pulse { 0% { transform: scale(1.1); } 100% { transform: scale(1.15); } }

@media (max-width: 768px) {
  .floating-back-btn { top: 50px; left: 15px; padding: 6px 12px; font-size: 13px; }
  .room-header { padding: 10px 15px; }
  .title { font-size: 16px; }
  .stage { padding: 10px; }
  .machine-body { padding: 10px; margin-bottom: 25px; }
  .game-stage-3d { width: 260px; height: 260px; }
  .heavy-btn { max-width: 100%; padding: 16px; font-size: 16px; }
  .balance-display { padding: 10px 18px; }
  .balance-display .amount { font-size: 20px; }
  .modal-card { width: 95%; padding: 20px; }
  .ticket-wrapper { width: 95%; }
  .marquee-item { font-size: 11px; padding: 4px 8px; }
  .bandai-gacha-machine { transform: scale(0.9); }
}
</style>