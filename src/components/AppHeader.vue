<!-- src/components/AppHeader.vue -->
<template>
  <header class="top-header-wrapper">
    <!-- 顶部滚动播报条 -->
    <div class="ticker-banner">
      <div class="ticker-label">
        <span class="dot"></span> ⚾ 試合速報
      </div>
      <div class="ticker-content">
        <Transition name="slide-up" mode="out-in">
          <div class="news-item" :key="currentNews.id" @click="goToGame(currentNews.game_pk)" :class="{ 'clickable': currentNews.game_pk }">
            <span class="text">{{ currentNews.text }}</span>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 原有的 Header 内容 -->
    <div class="top-header">
      <div class="logo-area" @click="$router.push('/')">
        <div class="logo-icon">G</div>
        <div class="logo-text">
          <h1>GrandSlam <span class="online-badge">LIVE</span></h1>
          <p>リアルタイム野球予想・一撃必殺の高配当</p>
        </div>
      </div>
      
      <div class="user-area">
        <!-- 动态余额 -->
        <div class="balance-box">
          <span class="balance-label">残高</span>
          <span class="balance-amount">¥{{ userBalance.toLocaleString() }}</span>
        </div>

        <!-- 入金 和 出金 -->
        <button class="charge-btn deposit-btn" @click="openDepositModal">入金</button>
        <button class="charge-btn withdraw-btn" @click="openWithdrawModal">出金</button>

        <!-- 签到按钮 -->
        <button class="checkin-btn" @click="handleCheckIn" :disabled="isCheckedIn">
          {{ isCheckedIn ? 'チェックイン済み' : 'デイリーボーナス +50円' }}
        </button>

        <!-- 个人中心 -->
        <div class="user-profile">
          <span class="username" @click="$router.push('/profile')">
            {{ username }} 様
          </span>
          <button class="profile-btn" @click="$router.push('/profile')">マイページ</button>
        </div>
      </div>
    </div>

    <!-- ================= 🆕 纯净金融风：入金弹窗 ================= -->
    <div v-if="depositVisible" class="fin-modal-overlay" @click.self="depositVisible = false">
      <div class="fin-modal-card">
        <div class="fin-header">
          <h3>ご入金手続き</h3>
          <p>ご希望の入金金額をご入力ください。</p>
        </div>
        
        <div class="fin-input-group">
          <span class="currency-symbol">¥</span>
          <input 
            type="number" 
            v-model="depositAmount" 
            placeholder="入金額を入力（最低 1,000円〜）" 
            class="fin-input"
          />
        </div>

        <p class="fin-notice">※確認後、公式サポートに接続し、お支払い方法をご案内いたします。</p>

        <div class="fin-actions">
          <button class="fin-btn cancel" @click="depositVisible = false">キャンセル</button>
          <button class="fin-btn confirm" @click="submitDeposit" :disabled="!isDepositValid">確認してサポートへ</button>
        </div>
      </div>
    </div>

    <!-- 出金弹窗 -->
    <div v-if="withdrawVisible" class="custom-modal-overlay" @click.self="withdrawVisible = false">
      <div class="custom-modal">
        <h3>出金申請</h3>
        
        <div class="input-group">
          <input 
            type="number" 
            v-model="withdrawAmount" 
            placeholder="出金金額を入力してください" 
            class="custom-input"
          />
        </div>

        <div class="modal-btns">
          <button class="btn-cancel" @click="withdrawVisible = false">キャンセル</button>
          <button class="btn-confirm" @click="submitWithdraw" :disabled="submittingWithdraw">
            {{ submittingWithdraw ? '処理中...' : '申請する' }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request'; 
import { ElMessage } from 'element-plus';

const router = useRouter();
const userBalance = ref(0);
const username = ref('ゲスト');
const userId = ref(null);

// ==========================================
// 签到逻辑
// ==========================================
const isCheckedIn = ref(false);

const checkCheckInStatus = async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  const user = JSON.parse(storedUser);
  userId.value = user.id;

  try {
    const res = await request.get(`/user/checkin-status/${user.id}`);
    if (res.data.success) {
      isCheckedIn.value = res.data.hasCheckedIn;
    }
  } catch (error) {
    console.error("チェックインステータスの取得に失敗しました", error);
  }
};

const handleCheckIn = async () => {
  if (isCheckedIn.value || !userId.value) return;

  try {
    const res = await request.post(`/user/checkin/${userId.value}`);
    
    if (res.data.success) {
      ElMessage.success(res.data.message || 'チェックイン成功！50円を獲得しました！');
      isCheckedIn.value = true;
      userBalance.value += 50; 
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.error || 'チェックインに失敗しました。後でもう一度お試しください。');
  }
};

// ==========================================
// 棒球比赛速报逻辑
// ==========================================
const currentNews = ref({ id: 0, text: '⚾ まもなく新しい試合が発表されます。お楽しみに！', game_pk: null });
let tickerTimer = null;
let currentIndex = 0;
let tickerDataList = [];

const goToGame = (gamePk) => {
  if (!gamePk) return;
  router.push(`/mlb/detail/${gamePk}`);
};

const fetchTickerData = async () => {
  try {
    const res = await request.get('/mlb/ticker');
    if (res.data.success && res.data.data.length > 0) {
      tickerDataList = res.data.data;
      if (currentNews.value.id === 0) {
        currentNews.value = { ...tickerDataList[0], id: Date.now() };
      }
    }
  } catch (error) {
    console.error('速報データの取得に失敗しました', error);
  }
};

const rotateNews = () => {
  if (tickerDataList.length === 0) return;
  currentIndex = (currentIndex + 1) % tickerDataList.length;
  const nextNews = tickerDataList[currentIndex];
  currentNews.value = { ...nextNews, id: Date.now() };
};

// ==========================================
// 入金弹窗逻辑 (金融版)
// ==========================================
const depositVisible = ref(false);
const depositAmount = ref(null);

const isDepositValid = computed(() => {
  return depositAmount.value !== null && Number(depositAmount.value) >= 1000;
});

const openDepositModal = () => {
  depositAmount.value = null;
  depositVisible.value = true;
};

const submitDeposit = () => {
  if (!isDepositValid.value) {
    return ElMessage.warning('入金金額は最低 1,000円 からです。');
  }

  if (window.Tawk_API && window.Tawk_API.toggle) {
    depositVisible.value = false;
    window.Tawk_API.toggle();
    
    // 顺便在客服后台标记一下该用户的充值意向
    if (window.Tawk_API.setAttributes) {
      window.Tawk_API.setAttributes({
        'want_deposit_amount': `¥${Number(depositAmount.value).toLocaleString()}`
      }, function(error){});
    }
    
    ElMessage.success(`¥${Number(depositAmount.value).toLocaleString()} の入金手続きを開始します。チャットにてお支払い方法をご案内します。`);
  } else {
    ElMessage.warning('サポートシステムを読み込み中です。少々お待ちください。');
  }
};

// ==========================================
// 出金弹窗逻辑
// ==========================================
const withdrawVisible = ref(false);
const withdrawAmount = ref(null);
const submittingWithdraw = ref(false);

const openWithdrawModal = () => {
  withdrawAmount.value = null;
  withdrawVisible.value = true;
};

const submitWithdraw = async () => {
  if (!withdrawAmount.value || Number(withdrawAmount.value) < 100) {
    return ElMessage.warning('出金金額は 100 円以上を入力してください');
  }

  if (Number(withdrawAmount.value) > userBalance.value) {
    return ElMessage.error('残高が不足しています');
  }

  submittingWithdraw.value = true;
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return router.push('/login');
    const user = JSON.parse(storedUser);

    const res = await request.post(`/user/withdraw/${user.id}`, { 
      amount: Number(withdrawAmount.value) 
    });
    
    if (res.data.success) {
      ElMessage.success(res.data.message || '出金申請を受け付けました');
      withdrawVisible.value = false;
      const infoRes = await request.get(`/user/info/${user.id}`);
      if (infoRes.data.success) userBalance.value = infoRes.data.user.balance;
    }
  } catch (error) {
    let errorMsg = error.response?.data?.error || '出金申請に失敗しました';
    // 兼容后端可能返回的中文报错，进行前端日文替换
    if (errorMsg.includes('残高') || errorMsg.includes('余额')) {
      errorMsg = '残高が不足しています';
    }
    ElMessage.error(errorMsg);
  } finally {
    submittingWithdraw.value = false;
  }
};

// ==========================================
// 生命周期管理
// ==========================================
onMounted(async () => {
  await fetchTickerData();
  tickerTimer = setInterval(rotateNews, 5000);
  setInterval(fetchTickerData, 60000);

  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  
  const user = JSON.parse(storedUser);
  username.value = user.username;
  userId.value = user.id;
  
  if (user.balance !== undefined) {
    userBalance.value = user.balance;
  }
  
  checkCheckInStatus();

  try {
    const infoRes = await request.get(`/user/info/${user.id}`);
    if (infoRes.data.success) {
      userBalance.value = infoRes.data.user.balance;
      
      user.balance = infoRes.data.user.balance;
      localStorage.setItem('user', JSON.stringify(user));
      
      if (user.verify_status !== infoRes.data.user.verify_status) {
        user.verify_status = infoRes.data.user.verify_status;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  } catch (error) {
    console.error("残高の取得に失敗しました", error);
  }
});

onUnmounted(() => {
  if (tickerTimer) clearInterval(tickerTimer);
});
</script>

<style scoped>
.top-header-wrapper {}
.ticker-banner { background: #0f172a; display: flex; align-items: center; height: 40px; overflow: hidden; color: white; font-size: 13px; font-weight: 500; }
.ticker-label { background: #e83862; height: 100%; display: flex; align-items: center; padding: 0 20px; font-weight: 900; font-size: 14px; clip-path: polygon(0 0, 100% 0, 95% 100%, 0% 100%); z-index: 2; white-space: nowrap; }
.ticker-label .dot { width: 8px; height: 8px; background: white; border-radius: 50%; margin-right: 8px; animation: blink 1s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.ticker-content { flex: 1; padding-left: 20px; position: relative; height: 100%; display: flex; align-items: center; }
.news-item { position: absolute; display: flex; align-items: center; gap: 8px; white-space: nowrap; }

.news-item .text { color: #e2e8f0; letter-spacing: 0.5px; }
.news-item.clickable { cursor: pointer; }
.news-item.clickable:hover .text { color: #38bdf8; text-decoration: underline; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.5s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(20px); }
.slide-up-leave-to { opacity: 0; transform: translateY(-20px); }
.top-header { background: #fff; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eaeaea; box-shadow: 0 2px 10px rgba(0,0,0,0.02); font-family: 'Noto Sans JP', sans-serif; }
.logo-area { display: flex; align-items: center; gap: 15px; cursor: pointer; }
.logo-icon { width: 40px; height: 40px; background: #e83862; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 24px; font-weight: bold; font-family: serif; flex-shrink: 0; }
.logo-text h1 { margin: 0; font-size: 20px; color: #e83862; display: flex; align-items: center; gap: 8px; font-weight: 900; white-space: nowrap; }
.online-badge { font-size: 10px; background: #fce4e8; color: #e83862; padding: 2px 6px; border-radius: 4px; }
.logo-text p { margin: 3px 0 0; font-size: 12px; color: #888; }
.user-area { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.balance-box { background: #0f172a; color: #fff; padding: 8px 15px; border-radius: 25px; display: flex; align-items: center; gap: 10px; font-size: 14px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2); flex-shrink: 0; }
.balance-label { font-size: 10px; color: #94a3b8; }
.balance-amount { font-weight: 900; font-size: 16px; color: #38bdf8; font-family: monospace; }

.charge-btn { border: none; padding: 8px 20px; border-radius: 20px; font-weight: 900; cursor: pointer; transition: 0.2s; white-space: nowrap; font-size: 14px; }
.deposit-btn { background: linear-gradient(180deg, #10b981, #059669); color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.withdraw-btn { background: linear-gradient(180deg, #ffcc00, #ffb300); color: #333; box-shadow: 0 4px 10px rgba(255, 204, 0, 0.3); }
.charge-btn:hover { transform: translateY(-2px); }
.checkin-btn { background: linear-gradient(180deg, #f43f5e, #e83862); color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: 900; cursor: pointer; transition: 0.2s; white-space: nowrap; font-size: 14px; box-shadow: 0 4px 10px rgba(232, 56, 98, 0.3); }
.checkin-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(232, 56, 98, 0.5); }
.checkin-btn:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }
.user-profile { display: flex; align-items: center; gap: 12px; margin-left: 10px; padding-left: 15px; border-left: 1px solid #eaeaea; flex-shrink: 0; }
.username { font-size: 14px; font-weight: bold; color: #1e293b; cursor: pointer; transition: color 0.2s; white-space: nowrap; }
.username:hover { color: #e83862; text-decoration: underline; }
.profile-btn { background: #1e293b; color: #ffffff; border: none; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer; transition: 0.2s; white-space: nowrap; box-shadow: 0 4px 10px rgba(30, 41, 59, 0.2); }
.profile-btn:hover { background: #0f172a; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(30, 41, 59, 0.3); }

/* ================= 🆕 纯净金融风：入金弹窗 ================= */
.fin-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.fin-modal-card {
  background: #ffffff;
  width: 90%;
  max-width: 420px;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
.fin-header {
  text-align: center;
  margin-bottom: 25px;
}
.fin-header h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
}
.fin-header p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}
.fin-input-group {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 15px;
  transition: all 0.2s;
}
.fin-input-group:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #ffffff;
}
.currency-symbol {
  font-size: 18px;
  font-weight: 900;
  color: #1e293b;
  margin-right: 10px;
}
.fin-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: bold;
  color: #1e293b;
  outline: none;
}
.fin-input::placeholder {
  font-size: 14px;
  font-weight: normal;
  color: #94a3b8;
}
.fin-notice {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 25px;
  line-height: 1.5;
}
.fin-actions {
  display: flex;
  gap: 12px;
}
.fin-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.fin-btn.cancel {
  background: #f1f5f9;
  color: #64748b;
}
.fin-btn.cancel:hover { background: #e2e8f0; }
.fin-btn.confirm {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
.fin-btn.confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}
.fin-btn.confirm:disabled {
  background: #cbd5e1;
  color: #f8fafc;
  cursor: not-allowed;
  box-shadow: none;
}

/* ================= 出金弹窗 (保留原样) ================= */
.custom-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.custom-modal { background: #fff; width: 90%; max-width: 400px; border-radius: 16px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); text-align: center; }
.custom-modal h3 { margin: 0 0 20px; font-size: 20px; font-weight: 900; color: #1e293b; }
.custom-input { width: 100%; padding: 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 16px; outline: none; box-sizing: border-box; margin-bottom: 20px; }
.custom-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.modal-btns { display: flex; gap: 12px; }
.modal-btns button { flex: 1; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; border: none; }
.btn-cancel { background: #f1f5f9; color: #64748b; }
.btn-confirm { background: #3b82f6; color: #fff; }
.btn-confirm:disabled { background: #94a3b8; cursor: not-allowed; }

@media (max-width: 768px) {
  .ticker-label { padding: 0 10px; font-size: 12px; clip-path: none; }
  .ticker-content { padding-left: 10px; font-size: 12px; }
  .news-item { gap: 5px; }
  .top-header { padding: 10px 15px; flex-direction: column; gap: 12px; }
  .logo-area { width: 100%; justify-content: center; }
  .logo-text p { display: none; }
  .logo-text h1 { font-size: 18px; }
  .user-area { width: 100%; justify-content: space-between; gap: 8px; }
  .balance-box { padding: 6px 12px; flex: 1; justify-content: center; }
  .balance-amount { font-size: 15px; }
  
  .charge-btn { padding: 6px 12px; font-size: 13px; }
  .checkin-btn { padding: 6px 12px; font-size: 13px; }
  .user-profile { margin-left: 0; padding-left: 10px; border-left: none; gap: 8px; }
  .username { display: none; }
  .profile-btn { padding: 6px 10px; font-size: 12px; }
}
</style>