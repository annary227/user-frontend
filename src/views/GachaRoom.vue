<template>
  <div class="room-container" :class="`theme-${gameType}`">
    
    <!-- 高配：3D 动态极光与粒子背景 -->
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

    <!-- 悬浮返回按钮 -->
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
      <!-- 🆕 机台增加中奖发光特效 -->
      <div class="machine-body" :class="{ 'is-win-glow': !isDrawing && result && result.value > 0 }">
        
        <!-- 3D 核心舞台 -->
        <div class="game-stage-3d" :class="`stage-${gameType}`">
          
          <!-- 1. 金魚すくい -->
          <div v-if="gameType === 'fish'" class="fish-bowl">
            <div class="water" :class="{ 'is-rippling': isDrawing }"></div>
            <div class="poi" :class="{ 'is-scooping': isDrawing }">
               {{ (!isDrawing && result && result.value === 0) ? '🕸️' : '🥅' }}
            </div>
            <div class="jump-fish" v-if="!isDrawing && result && result.value > 0">🐟</div>
          </div>

          <!-- 2. 飞镖 -->
          <div v-else-if="gameType === 'dart'" class="dart-board">
            <div class="board-rings"></div>
            <div class="dart" :class="{ 'is-thrown': isDrawing, 'is-bullseye': !isDrawing && result && result.value > 0 }">🎯</div>
          </div>

          <!-- 3. 抓娃娃 -->
          <div v-else-if="gameType === 'crane'" class="crane-scene">
            <div class="crane-rail"></div>
            <div class="claw-3d" :class="{ 'is-dropping': isDrawing }">
              <div class="claw-wire"></div>
              <div class="claw-body">
                <div class="claw-pincer left"></div>
                <div class="claw-pincer right"></div>
              </div>
            </div>
            <div class="prize-bed" :class="{ 'is-caught': !isDrawing && result && result.value > 0 }">
              <span class="prize-3d">{{ gameIcon }}</span>
            </div>
          </div>

          <!-- 4. 扭蛋 -->
          <div v-else-if="gameType === 'gacha'" class="gacha-machine">
            <div class="gacha-glass" :class="{ 'is-spinning': isDrawing }">
              <div class="capsule cap-1"></div>
              <div class="capsule cap-2"></div>
              <div class="capsule cap-3"></div>
            </div>
            <div class="gacha-knob" :class="{ 'is-turning': isDrawing }">⚙️</div>
            <div class="golden-capsule" v-if="!isDrawing && result && result.value > 0">🥚</div>
          </div>

          <!-- 5. 刮刮乐 -->
          <div v-else-if="gameType === 'scratch'" class="scratch-scene">
             <div class="scratch-card" :class="{ 'is-scratched': !isDrawing && result }">
                <div class="scratch-cover" :class="{ 'is-scratching': isDrawing }"></div>
                <div class="scratch-content">
                  {{ (!isDrawing && result) ? (result.value > 0 ? '🏆' : '💧') : '🎁' }}
                </div>
             </div>
          </div>

          <!-- 6. 轮盘 -->
          <div v-else-if="gameType === 'roulette'" class="roulette-scene">
            <div class="wheel-3d" :class="{ 'is-spinning': isDrawing, 'is-stopped': !isDrawing && result }">
              <div class="wheel-rim"></div>
              <div class="wheel-inner"></div>
            </div>
            <div class="ball-3d" :class="{ 'is-spinning': isDrawing }"></div>
          </div>

          <!-- 7. 寻宝 -->
          <div v-else-if="gameType === 'treasure'" class="treasure-chest">
            <div class="chest-lid" :class="{ 'is-opening': !isDrawing && result, 'is-shaking': isDrawing }"></div>
            <div class="chest-base" :class="{ 'is-shaking': isDrawing }"></div>
            <div class="sparkle" v-if="!isDrawing && result && result.value > 0">✨</div>
          </div>

          <!-- 8. 老虎机 -->
          <div v-else-if="gameType === 'slot'" class="slot-machine-3d">
            <div class="reel-3d" :class="{ 'is-spinning': isDrawing }">
              <div class="slot-face" :class="{ 'is-win': !isDrawing && result && result.value > 0 }">
                {{ (!isDrawing && result) ? (result.value > 0 ? '7' : '🍒') : '7' }}
              </div>
            </div>
            <div class="reel-3d" :class="{ 'is-spinning': isDrawing }" style="animation-delay: 0.1s;">
              <div class="slot-face" :class="{ 'is-win': !isDrawing && result && result.value > 0 }">
                {{ (!isDrawing && result) ? (result.value > 0 ? '7' : '🔔') : '7' }}
              </div>
            </div>
            <div class="reel-3d" :class="{ 'is-spinning': isDrawing }" style="animation-delay: 0.2s;">
              <div class="slot-face" :class="{ 'is-win': !isDrawing && result && result.value > 0 }">
                {{ (!isDrawing && result) ? (result.value > 0 ? '7' : '💎') : '7' }}
              </div>
            </div>
            <div class="machine-glass"></div>
          </div>

        </div>
        
        <!-- 机台底部控制台 -->
        <div class="control-panel">
          <div class="info-screen">
            <p class="desc">{{ gameDesc }}</p>
            <div class="balance-display">
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
        <span class="btn-text">{{ isDrawing ? '抽選中...' : `${gameCost} コインで挑戦する` }}</span>
        <span class="btn-shine" v-if="!isDrawing"></span>
      </button>
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

    <!-- 结算凭证票根 -->
    <Transition name="ticket">
      <div v-if="result && showTicket" class="ticket-overlay">
        <div class="ticket-wrapper" :class="result.value > 0 ? 'win' : 'lose'">
          <div class="ticket-top">
            <div class="brand">QUICK ONE OFFICIAL</div>
            <div class="status">{{ result.value > 0 ? '当せん' : 'ハズレ' }}</div>
          </div>
          
          <div class="ticket-content">
            <div class="result-icon">{{ result.value > 0 ? '🏆' : '💧' }}</div>
            <h2>{{ result.value > 0 ? 'おめでとうございます！' : '残念でした' }}</h2>
            
            <div class="prize-name">
              {{ result.prize === '不中奖' ? 'ハズレ' : result.prize }}
            </div>
            
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
const currentBg = computed(() => gameSettings[gameName]?.bg || '#f2f5f8');
const gameDesc = computed(() => gameSettings[gameName]?.desc || 'ポイを破らずに金魚を救え！');

const showConfirm = ref(false);
const isDrawing = ref(false);
const result = ref(null);
const showTicket = ref(false);
const currentBalance = ref(0);
const currentTime = ref('');
const userId = ref(null);

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
  
  if (route.query.balance) {
    currentBalance.value = Number(route.query.balance);
  }

  try {
    const infoRes = await request.get(`/user/info/${user.id}`);
    if (infoRes.data.success) {
      currentBalance.value = infoRes.data.user.balance;
      // 实名状态由账户层永久保存，房间层不再读取/写入 verify_status
      user.balance = infoRes.data.user.balance;
      localStorage.setItem('user', JSON.stringify(user));
    }
  } catch (error) {
    console.warn('获取用户信息失败', error);
  }
});

onUnmounted(() => {
  if (spinInterval) clearInterval(spinInterval);
  if (audioCtx) audioCtx.close();
});

// 账户实名永久保存制：实名在账户层完成一次后永久生效，房间层不再拦截
const checkAuth = () => {
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
  
  setTimeout(async () => {
    try {
      const res = await request.post('/user/draw', { userId: userId.value, gameName: gameName, cost: gameCost });
      if (res.data.success) {
        result.value = res.data.data;
        currentBalance.value = res.data.data.remainingBalance;
        currentTime.value = new Date().toLocaleString('ja-JP', { hour12: false });
        if (spinInterval) clearInterval(spinInterval);
        if (result.value.value > 0) playWinSound(); else playLoseSound();
        
        setTimeout(() => {
          showTicket.value = true;
        }, 1200);
      }
    } catch (error) {
      alert(error.response?.data?.error || '通信エラーが発生しました。');
      if (spinInterval) clearInterval(spinInterval);
    } finally {
      isDrawing.value = false;
    }
  }, 3000);
};

const closeResult = () => { 
  result.value = null; 
  showTicket.value = false;
};
</script>

<style scoped>
/* ================= 🆕 高配 3D 星空与极光流体背景 ================= */
.room-container { 
  position: relative; min-height: 100vh; display: flex; flex-direction: column; overflow: hidden; 
  background: #050508; 
  font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;
}

.hologram-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }

.aurora {
  position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.5; mix-blend-mode: screen;
  animation: aurora-flow 15s infinite alternate ease-in-out;
}
.aurora-1 { width: 800px; height: 800px; background: #e83862; top: -300px; left: -200px; }
.aurora-2 { width: 900px; height: 900px; background: #0ea5e9; bottom: -300px; right: -200px; animation-delay: -5s; }
.aurora-3 { width: 600px; height: 600px; background: #8b5cf6; top: 30%; left: 40%; animation-delay: -10s; }

.theme-slot .aurora-1 { background: #f39c12; }
.theme-slot .aurora-2 { background: #e84118; }
.theme-crane .aurora-1 { background: #10b981; }
.theme-crane .aurora-2 { background: #0abde3; }
.theme-roulette .aurora-1 { background: #e84118; }
.theme-roulette .aurora-2 { background: #ff4757; }
.theme-gacha .aurora-1 { background: #8b5cf6; }
.theme-gacha .aurora-2 { background: #d946ef; }
.theme-treasure .aurora-1 { background: #eab308; }
.theme-treasure .aurora-2 { background: #ca8a04; }
.theme-fish .aurora-1 { background: #0ea5e9; }
.theme-fish .aurora-2 { background: #2dd4bf; }
.theme-dart .aurora-1 { background: #ef4444; }
.theme-dart .aurora-2 { background: #f97316; }
.theme-scratch .aurora-1 { background: #f59e0b; }
.theme-scratch .aurora-2 { background: #eab308; }

@keyframes aurora-flow {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(100px, 100px) scale(1.2); }
}

.stars-container { position: absolute; inset: 0; perspective: 800px; overflow: hidden; }
.star-group {
  position: absolute; inset: -50%;
  background-image: radial-gradient(1.5px 1.5px at 20px 30px, #fff, transparent),
                    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                    radial-gradient(1.5px 1.5px at 130px 80px, rgba(255,255,255,0.6), transparent);
  background-repeat: repeat; background-size: 200px 200px;
  animation: stars-move 20s linear infinite;
}
.star-1 { animation-duration: 30s; opacity: 0.6; }
.star-2 { animation-duration: 20s; background-size: 300px 300px; opacity: 0.8; }
.star-3 { animation-duration: 10s; background-size: 150px 150px; opacity: 1; }

@keyframes stars-move {
  0% { transform: translateZ(0) translateY(0); }
  100% { transform: translateZ(200px) translateY(-200px); }
}

.floor-reflection {
  position: absolute; bottom: -10%; left: 0; width: 100%; height: 300px;
  background: linear-gradient(to top, rgba(255,255,255,0.05), transparent);
  transform: perspective(500px) rotateX(70deg); transform-origin: bottom;
}

.room-header, .stage { position: relative; z-index: 10; }

/* ================= 基础组件样式 ================= */
.floating-back-btn { position: fixed; top: 60px; left: 20px; z-index: 999; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; color: white; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
.floating-back-btn:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }
.room-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; color: white; }
.title { font-weight: 900; font-size: 18px; letter-spacing: 1px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }

.stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
.machine-body { background: #ffffff; border-radius: 30px; padding: 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.1); margin-bottom: 40px; transition: all 0.5s; }
.machine-body.is-win-glow { box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 80px rgba(255, 215, 0, 0.6); transform: scale(1.02); }

.game-stage-3d { width: 320px; height: 320px; background: radial-gradient(circle at center, #ffffff 0%, #e2e8f0 100%); border-radius: 20px; position: relative; overflow: hidden; box-shadow: inset 0 15px 30px rgba(0,0,0,0.1); display: flex; justify-content: center; align-items: center; perspective: 1000px; }

/* ================= 1. 金鱼すくい ================= */
.fish-bowl { width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle at 50% 20%, #bae6fd, #38bdf8); position: relative; box-shadow: inset 0 20px 40px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.1); overflow: hidden; border: 4px solid #e2e8f0; }
.water { position: absolute; bottom: 0; width: 100%; height: 70%; background: rgba(255,255,255,0.2); transition: 0.3s; }
.water.is-rippling { animation: ripple 0.3s linear infinite; }
@keyframes ripple { 0%, 100% { transform: scaleY(1); opacity: 0.2; } 50% { transform: scaleY(1.1); opacity: 0.4; } }
.poi { position: absolute; top: 20%; left: 50%; transform: translateX(-50%); font-size: 60px; transition: 0.5s; }
.poi.is-scooping { animation: scoop 1.5s infinite alternate ease-in-out; }
@keyframes scoop { 0% { top: 20%; left: 50%; transform: translateX(-50%) rotate(0); } 100% { top: 60%; left: 20%; transform: translateX(-50%) rotate(-30deg); } }
.jump-fish { position: absolute; top: 10%; left: 50%; transform: translateX(-50%); font-size: 50px; animation: jump 1s infinite alternate; }
@keyframes jump { 0% { top: 10%; } 100% { top: 0%; } }

/* ================= 2. 飞镖 ================= */
.dart-board { width: 220px; height: 220px; border-radius: 50%; background: conic-gradient(#ef4444 0deg 20deg, #f1f5f9 20deg 40deg, #3b82f6 40deg 60deg, #f1f5f9 60deg 80deg, #ef4444 80deg 100deg, #f1f5f9 100deg 120deg, #3b82f6 120deg 140deg, #f1f5f9 140deg 160deg, #ef4444 160deg 180deg, #f1f5f9 180deg 200deg, #3b82f6 200deg 220deg, #f1f5f9 220deg 240deg, #ef4444 240deg 260deg, #f1f5f9 260deg 280deg, #3b82f6 280deg 300deg, #f1f5f9 300deg 320deg, #ef4444 320deg 340deg, #f1f5f9 340deg 360deg); position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.2); border: 8px solid #334155; }
.board-rings { position: absolute; inset: 20%; border-radius: 50%; border: 4px solid #334155; background: #fff; }
.dart { position: absolute; top: -20%; left: 50%; font-size: 40px; transform: translateX(-50%); transition: 0.3s; }
.dart.is-thrown { animation: throw-dart 1.5s infinite alternate ease-in; }
.dart.is-bullseye { top: 45%; animation: none; transform: translateX(-50%) scale(0.7); }
@keyframes throw-dart { 0% { top: -20%; transform: translateX(-50%) scale(1); } 100% { top: 40%; transform: translateX(-50%) scale(0.8); } }

/* ================= 3. 抓娃娃 ================= */
.crane-scene { width: 100%; height: 100%; position: relative; }
.crane-rail { position: absolute; top: 10%; width: 100%; height: 15px; background: linear-gradient(180deg, #94a3b8, #64748b); transform: rotateX(60deg); }
.claw-3d { position: absolute; top: 10%; left: 50%; transform: translateX(-50%) translateZ(50px); transition: top 1.5s ease-in-out, transform 0.5s; transform-style: preserve-3d; }
.claw-3d.is-dropping { top: 60%; }
.claw-wire { width: 4px; height: 80px; background: #cbd5e1; margin: 0 auto; }
.claw-body { width: 40px; height: 30px; background: #334155; border-radius: 5px; position: relative; margin: 0 auto; }
.claw-pincer { width: 10px; height: 50px; background: #475569; position: absolute; top: 20px; border-radius: 5px; transition: transform 0.3s; }
.claw-pincer.left { left: -5px; transform: rotate(15deg); }
.claw-pincer.right { right: -5px; transform: rotate(-15deg); }
.is-dropping .claw-pincer.left { transform: rotate(30deg); }
.is-dropping .claw-pincer.right { transform: rotate(-30deg); }
.prize-bed { position: absolute; bottom: 10%; width: 100%; text-align: center; transform: translateZ(-20px); transition: 0.5s; }
.prize-bed.is-caught .prize-3d { opacity: 0; }
.prize-3d { font-size: 80px; filter: drop-shadow(0 20px 10px rgba(0,0,0,0.4)); transition: transform 0.5s; }
.is-dropping + .prize-bed .prize-3d { transform: translateY(-30px) scale(1.1); }

/* ================= 4. 扭蛋 ================= */
.gacha-machine { width: 200px; height: 240px; background: #f1f5f9; border-radius: 20px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.2); border: 4px solid #cbd5e1; display: flex; flex-direction: column; align-items: center; padding-top: 20px; }
.gacha-glass { width: 160px; height: 140px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.2)); box-shadow: inset 0 10px 20px rgba(0,0,0,0.1); position: relative; overflow: hidden; }
.gacha-glass.is-spinning { animation: shake-gacha 0.2s infinite alternate; }
@keyframes shake-gacha { 0% { transform: rotate(-5deg); } 100% { transform: rotate(5deg); } }
.capsule { position: absolute; width: 30px; height: 30px; border-radius: 50%; background: #f43f5e; box-shadow: inset -5px -5px 10px rgba(0,0,0,0.2); }
.cap-1 { bottom: 10px; left: 20px; background: #3b82f6; }
.cap-2 { bottom: 30px; right: 30px; background: #f43f5e; }
.cap-3 { bottom: 5px; left: 70px; background: #fbbf24; }
.gacha-knob { font-size: 40px; margin-top: 20px; }
.gacha-knob.is-turning { animation: turn-knob 0.5s infinite linear; }
@keyframes turn-knob { 100% { transform: rotate(360deg); } }
.golden-capsule { position: absolute; bottom: 10px; font-size: 40px; animation: drop-capsule 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes drop-capsule { 0% { transform: translateY(-50px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }

/* ================= 5. 刮刮乐 ================= */
.scratch-scene { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; }
.scratch-card { width: 200px; height: 200px; background: #fff; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); position: relative; overflow: hidden; }
.scratch-content { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; font-size: 80px; background: #f8fafc; }
.scratch-cover { position: absolute; inset: 0; background: linear-gradient(45deg, #94a3b8, #cbd5e1); z-index: 10; transition: transform 0.5s; }
.scratch-cover.is-scratching { animation: scratch-action 0.2s infinite alternate; }
@keyframes scratch-action { 0% { transform: translate(0, 0) rotate(0); } 100% { transform: translate(10px, 10px) rotate(5deg); } }
.scratch-card.is-scratched .scratch-cover { transform: translateY(-100%); }

/* ================= 6. 轮盘 ================= */
.roulette-scene { position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
.wheel-3d { width: 220px; height: 220px; border-radius: 50%; position: relative; transform: rotateX(60deg); transform-style: preserve-3d; box-shadow: 0 30px 40px rgba(0,0,0,0.4); }
.wheel-rim { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(#ef4444 0deg 30deg, #1e293b 30deg 60deg, #ef4444 60deg 90deg, #1e293b 90deg 120deg, #ef4444 120deg 150deg, #1e293b 150deg 180deg, #ef4444 180deg 210deg, #1e293b 210deg 240deg, #ef4444 240deg 270deg, #1e293b 270deg 300deg, #ef4444 300deg 330deg, #1e293b 330deg 360deg); border: 10px solid #0f172a; }
.wheel-inner { position: absolute; inset: 20%; background: radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%); border-radius: 50%; transform: translateZ(10px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
.is-spinning { animation: spin-3d 0.3s linear infinite; }
.is-stopped { animation: stop-3d 3s cubic-bezier(0.17, 0.67, 0.12, 1) forwards; }
@keyframes spin-3d { 100% { transform: rotateX(60deg) rotateZ(360deg); } }
@keyframes stop-3d { 100% { transform: rotateX(60deg) rotateZ(720deg); } }
.ball-3d { position: absolute; top: 20%; left: 50%; width: 15px; height: 15px; background: #fff; border-radius: 50%; box-shadow: 0 0 10px #fff; transform: translateZ(30px); opacity: 0; }
.ball-3d.is-spinning { opacity: 1; animation: ball-bounce 0.5s infinite alternate; }
@keyframes ball-bounce { 0% { transform: translateX(-60px) translateZ(30px); } 100% { transform: translateX(60px) translateZ(30px); } }

/* ================= 7. 寻宝 ================= */
.treasure-chest { width: 200px; height: 150px; position: relative; perspective: 500px; }
.chest-base { position: absolute; bottom: 0; width: 100%; height: 60%; background: #78350f; border-radius: 10px; border: 4px solid #451a03; }
.chest-lid { position: absolute; top: 0; width: 100%; height: 40%; background: #92400e; border-radius: 50% 50% 0 0; border: 4px solid #451a03; transform-origin: bottom; transition: transform 0.5s; }
.chest-lid.is-opening { transform: rotateX(110deg); }
.is-shaking { animation: shake 0.1s infinite; }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
.sparkle { position: absolute; top: -20%; left: 50%; transform: translateX(-50%); font-size: 40px; animation: pop-sparkle 0.5s infinite alternate; }
@keyframes pop-sparkle { 0% { transform: translateX(-50%) scale(1); opacity: 1; } 100% { transform: translateX(-50%) scale(1.5); opacity: 0.5; } }

/* ================= 8. 老虎机 ================= */
.slot-machine-3d { display: flex; gap: 15px; transform: rotateY(-15deg) rotateX(10deg); transform-style: preserve-3d; }
.reel-3d { width: 70px; height: 180px; background: #1e293b; border-radius: 10px; position: relative; transform-style: preserve-3d; box-shadow: inset 0 0 20px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; }
.slot-face { width: 100%; height: 100%; background: linear-gradient(180deg, #fff, #e2e8f0); border-radius: 8px; display: flex; justify-content: center; align-items: center; font-size: 50px; font-weight: 900; color: #ef4444; transition: 0.3s; }
.slot-face.is-win { color: #10b981; text-shadow: 0 0 20px #10b981; }
.reel-3d.is-spinning { animation: roll-3d 0.15s linear infinite; }
@keyframes roll-3d { 0% { transform: rotateX(0); } 100% { transform: rotateX(360deg); } }
.machine-glass { position: absolute; inset: -10px; background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0)); border-radius: 15px; transform: translateZ(50px); pointer-events: none; }

/* 控制台 & 按钮 */
.control-panel { margin-top: 20px; text-align: center; }
.desc { font-size: 13px; color: #64748b; margin-bottom: 15px; font-weight: bold; }
.balance-display { background: #0f172a; border-radius: 12px; padding: 12px 24px; display: inline-flex; flex-direction: column; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5); }
.balance-display .label { font-size: 10px; color: #94a3b8; letter-spacing: 2px; margin-bottom: 4px; }
.balance-display .amount { font-size: 24px; font-weight: 900; color: #38bdf8; font-family: monospace; text-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
.heavy-btn { width: 100%; max-width: 320px; padding: 20px; border: none; border-radius: 30px; color: white; font-size: 18px; font-weight: 900; letter-spacing: 2px; cursor: pointer; position: relative; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.3), inset 0 -4px 0 rgba(0,0,0,0.3); transition: all 0.1s; }
.heavy-btn:active { transform: translateY(4px); box-shadow: 0 4px 10px rgba(0,0,0,0.2), inset 0 -2px 0 rgba(0,0,0,0.3); }
.heavy-btn:disabled { background: #94a3b8 !important; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-shine { position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transform: skewX(-20deg); animation: shine 3s infinite; }
@keyframes shine { 100% { left: 200%; } }

/* 弹窗与票根 */
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

@media (max-width: 768px) {
  .floating-back-btn { top: 50px; left: 15px; padding: 6px 12px; font-size: 13px; }
  .room-header { padding: 10px 15px; }
  .title { font-size: 16px; }
  .stage { padding: 10px; }
  .machine-body { padding: 10px; margin-bottom: 25px; }
  .game-stage-3d { width: 260px; height: 260px; }
  .cube-wrapper, .cube-face { width: 90px; height: 90px; }
  .front { transform: translateZ(45px); }
  .back { transform: rotateY(180deg) translateZ(45px); }
  .left { transform: rotateY(-90deg) translateZ(45px); }
  .right { transform: rotateY(90deg) translateZ(45px); }
  .heavy-btn { max-width: 100%; padding: 16px; font-size: 16px; }
  .balance-display { padding: 10px 18px; }
  .balance-display .amount { font-size: 20px; }
  .modal-card { width: 95%; padding: 20px; }
  .ticket-wrapper { width: 95%; }
}
</style>