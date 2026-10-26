<template>
  <div class="room-container" :style="{ background: currentBg }">
    <!-- 🆕 悬浮返回按钮 (固定在左上角) -->
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
      <div class="machine-body">
        <!-- 玻璃视窗 -->
        <div class="glass-window" :class="{ 'is-drawing': isDrawing }">
          <div class="glass-glare"></div>
          
          <div class="inner-reel" :style="{ '--theme-color': currentColor }">
            <!-- 待机状态 -->
            <div v-if="!isDrawing" class="idle-state">
              <div class="floating-icon">{{ gameIcon }}</div>
            </div>
            <!-- 抽奖状态 -->
            <div v-else class="rolling-state">
              <div class="reel-column">
                <span>{{ gameIcon }}</span><span>💎</span><span>{{ gameIcon }}</span><span>⭐</span><span>{{ gameIcon }}</span>
              </div>
            </div>
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
        :style="{ background: `linear-gradient(180deg, ${currentColor} 0%, #333 200%)` }"
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
      <div v-if="result" class="ticket-overlay">
        <div class="ticket-wrapper" :class="result.value > 0 ? 'win' : 'lose'">
          <div class="ticket-top">
            <div class="brand">QUICK ONE OFFICIAL</div>
            <div class="status">{{ result.value > 0 ? '当せん' : 'ハズレ' }}</div>
          </div>
          
          <div class="ticket-content">
            <div class="result-icon">{{ result.value > 0 ? '🏆' : '💧' }}</div>
            <h2>{{ result.value > 0 ? 'おめでとうございます！' : '残念でした' }}</h2>
            <div class="prize-name">{{ result.prize }}</div>
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

const gameSettings = {
  '金魚すくい': { color: '#0ea5e9', bg: '#e0f2fe', desc: 'ポイを破らずに金魚を救え！' },
  'ダーツチャレンジ': { color: '#ef4444', bg: '#fee2e2', desc: 'ブルの真ん中を狙い撃て！' },
  'クレーンゲーム': { color: '#10b981', bg: '#d1fae5', desc: '超豪華プライズをゲットせよ！' },
  'ガチャポン': { color: '#8b5cf6', bg: '#ede9fe', desc: '金のカプセルを引き当てろ！' },
  'スクラッチ': { color: '#ffa502', bg: '#fff7ed', desc: '削って当てる！お手軽スクラッチ' },
  'ルーレット': { color: '#e84118', bg: '#fef2f2', desc: '大富豪専用！超高額ルーレット' },
  '宝探し': { color: '#009432', bg: '#f0fdf4', desc: '古代の財宝を見つけ出せ！' },
  'スロット': { color: '#f39c12', bg: '#fffbeb', desc: '7を揃えて大当たりを狙え！' }
};

const currentColor = computed(() => gameSettings[gameName]?.color || '#0ea5e9');
const currentBg = computed(() => gameSettings[gameName]?.bg || '#f2f5f8');
const gameDesc = computed(() => gameSettings[gameName]?.desc || 'ポイを破らずに金魚を救え！');

const showConfirm = ref(false);
const isDrawing = ref(false);
const result = ref(null);
const currentBalance = ref(0);
const currentTime = ref('');
const userId = ref(null);
const verifyStatus = ref(0); 

// ==========================================
// 🆕 纯代码实时合成 8-bit 音效系统
// ==========================================
let audioCtx = null;
let spinInterval = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

// 播放转动音效（不同游戏不同频率）
const playSpinSound = () => {
  let tick = true;
  let freq = 800;
  
  // 根据游戏类型微调音调
  if (gameName === 'スロット') freq = 1000; // 老虎机更清脆
  if (gameName === 'クレーンゲーム') freq = 400; // 抓娃娃更低沉
  if (gameName === '金魚すくい') freq = 700; // 捞金鱼居中

  spinInterval = setInterval(() => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(tick ? freq : freq - 200, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime); // 音量小一点
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
    tick = !tick;
  }, 100); 
};

// 播放中奖音效（金币连击声）
const playWinSound = () => {
  if (!audioCtx) return;
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C大调
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    }, index * 80);
  });
};

// 播放未中奖音效（低沉滑音）
const playLoseSound = () => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.6);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);
};

onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return router.push('/login');
  const user = JSON.parse(storedUser);
  userId.value = user.id;
  
  try {
    const infoRes = await request.get(`/user/info/${user.id}`);
    if (infoRes.data.success) {
      currentBalance.value = infoRes.data.user.balance;
      verifyStatus.value = infoRes.data.user.verify_status; 
    }
  } catch (error) {
    console.error("获取用户信息失败", error);
  }
});

onUnmounted(() => {
  if (spinInterval) clearInterval(spinInterval);
  if (audioCtx) audioCtx.close();
});

const checkAuth = () => {
  if (verifyStatus.value !== 2) {
    if (confirm('本人確認が完了していません。マイページで認証を行ってください。\n(抽奖需实名认证，去认证？)')) {
      router.push('/profile');
    }
    return;
  }
  showConfirm.value = true; 
};

const executeDraw = async () => {
  if (!userId.value) return;
  
  initAudio(); // 必须在点击事件里初始化
  
  showConfirm.value = false;
  isDrawing.value = true;
  result.value = null;
  
  // 开始转动音效
  playSpinSound();
  
  setTimeout(async () => {
    try {
      const res = await request.post('/user/draw', {
        userId: userId.value,
        gameName: gameName,
        cost: gameCost
      });
      if (res.data.success) {
        result.value = res.data.data;
        currentBalance.value = res.data.data.remainingBalance;
        currentTime.value = new Date().toLocaleString('ja-JP', { hour12: false });
        
        // 停止转动音效
        if (spinInterval) clearInterval(spinInterval);

        // 播放中奖/未中奖音效
        if (result.value.value > 0) {
          playWinSound();
        } else {
          playLoseSound();
        }
      }
    } catch (error) {
      alert(error.response?.data?.error || '通信エラーが発生しました。');
      if (spinInterval) clearInterval(spinInterval);
    } finally {
      isDrawing.value = false;
    }
  }, 2500);
};

const closeResult = () => {
  result.value = null;
};
</script>

<style scoped>
/* 这里保留你所有的原有样式，无需任何改动，直接粘贴下面的即可 */
.room-container { font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif; min-height: 100vh; display: flex; flex-direction: column; transition: background 0.5s; }
.floating-back-btn { position: fixed; top: 60px; left: 20px; z-index: 999; background: rgba(255, 255, 255, 0.95); border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; color: #1e293b; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s; }
.floating-back-btn:hover { background: #e83862; color: white; border-color: #e83862; transform: translateY(-2px); }
.floating-back-btn .icon { font-size: 20px; line-height: 1; margin-top: -2px; }
.room-header { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 50; }
.title { font-weight: 900; font-size: 18px; letter-spacing: 1px; }
.header-right { width: 60px; }
.stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
.machine-body { background: #ffffff; border-radius: 24px; padding: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.08), inset 0 -4px 10px rgba(0,0,0,0.05), inset 0 4px 10px #ffffff; position: relative; margin-bottom: 40px; }
.glass-window { width: 280px; height: 280px; background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%); border-radius: 50%; position: relative; overflow: hidden; box-shadow: inset 0 10px 20px rgba(0,0,0,0.2), inset 0 -10px 20px rgba(255,255,255,0.8), 0 0 0 6px #e2e8f0; }
.glass-glare { position: absolute; top: -20%; left: -20%; width: 80%; height: 80%; background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 10; pointer-events: none; }
.idle-state { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; }
.floating-icon { font-size: 90px; z-index: 2; animation: float 3s ease-in-out infinite; filter: drop-shadow(0 15px 15px rgba(0,0,0,0.2)); }
@keyframes float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.05); } }
.rolling-state { position: absolute; inset: 0; background: #fff; display: flex; justify-content: center; }
.reel-column { display: flex; flex-direction: column; align-items: center; animation: spin-reel 0.15s linear infinite; }
.reel-column span { height: 280px; display: flex; justify-content: center; align-items: center; font-size: 90px; }
@keyframes spin-reel { 0% { transform: translateY(0); } 100% { transform: translateY(-1400px); } }
.control-panel { margin-top: 20px; text-align: center; }
.desc { font-size: 13px; color: #64748b; margin-bottom: 15px; font-weight: bold; }
.balance-display { background: #0f172a; border-radius: 12px; padding: 12px 24px; display: inline-flex; flex-direction: column; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5); }
.balance-display .label { font-size: 10px; color: #94a3b8; letter-spacing: 2px; margin-bottom: 4px; }
.balance-display .amount { font-size: 24px; font-weight: 900; color: #38bdf8; font-family: monospace; text-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
.heavy-btn { width: 100%; max-width: 320px; padding: 20px; border: none; border-radius: 30px; color: white; font-size: 18px; font-weight: 900; letter-spacing: 2px; cursor: pointer; position: relative; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.2), inset 0 -4px 0 rgba(0,0,0,0.3); transition: all 0.1s; }
.heavy-btn:active { transform: translateY(4px); box-shadow: 0 4px 10px rgba(0,0,0,0.2), inset 0 -2px 0 rgba(0,0,0,0.3); }
.heavy-btn:disabled { background: #94a3b8 !important; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-shine { position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transform: skewX(-20deg); animation: shine 3s infinite; }
@keyframes shine { 100% { left: 200%; } }
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
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
  .machine-body { padding: 8px; margin-bottom: 25px; }
  .glass-window { width: 220px; height: 220px; }
  .floating-icon { font-size: 70px; }
  .reel-column span { height: 220px; font-size: 70px; }
  @keyframes spin-reel { 0% { transform: translateY(0); } 100% { transform: translateY(-1100px); } }
  .heavy-btn { max-width: 100%; padding: 16px; font-size: 16px; }
  .balance-display { padding: 10px 18px; }
  .balance-display .amount { font-size: 20px; }
  .modal-card { width: 95%; padding: 20px; }
  .ticket-wrapper { width: 95%; }
}
</style>