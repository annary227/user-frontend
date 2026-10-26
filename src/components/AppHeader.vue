<template>
  <header class="top-header-wrapper">
    <!-- 顶部滚动播报条 -->
    <div class="ticker-banner">
      <div class="ticker-label">
        <span class="dot"></span> 当せん速報
      </div>
      <div class="ticker-content">
        <Transition name="slide-up" mode="out-in">
          <div class="news-item" :key="currentNews.id">
            <span class="time">{{ currentNews.time }}</span>
            <span class="name">{{ currentNews.name }} さん</span> が 
            <span class="game">{{ currentNews.game }}</span> で 
            <span class="prize">{{ currentNews.prize }}</span> を獲得しました！
          </div>
        </Transition>
      </div>
    </div>

    <!-- 原有的 Header 内容 -->
    <div class="top-header">
      <div class="logo-area" @click="$router.push('/')">
        <div class="logo-icon">Q</div>
        <div class="logo-text">
          <h1>クイックワン <span class="online-badge">ONLINE</span></h1>
          <p>ネット専用いつでも秒で当たる宝くじ</p>
        </div>
      </div>
      
      <div class="user-area">
        <div class="sound-icon">🔊</div>
        
        <!-- 动态余额 -->
        <div class="balance-box">
          <span class="balance-label">残高</span>
          <span class="balance-amount">¥{{ userBalance.toLocaleString() }}</span>
        </div>
        
        <!-- 入金 和 出金 -->
        <a href="https://lin.ee/OHAOimh" target="_blank" class="charge-btn deposit-btn" style="text-decoration: none;">入金</a>
        <button class="charge-btn withdraw-btn" @click="openWithdrawModal">出金</button>

        <!-- 🆕 签到按钮 (纯日文显示) -->
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

    <!-- 🆕 纯原生出金弹窗 (就在这里，没少！) -->
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request'; 
import { ElMessage } from 'element-plus';

const router = useRouter();
const userBalance = ref(0);
const username = ref('ゲスト');
const userId = ref(null);

// ==========================================
// 🆕 签到逻辑 (完全交由后端硬编码日本时间判定)
// ==========================================
const isCheckedIn = ref(false);

const checkCheckInStatus = async () => {
  if (!userId.value) return;
  try {
    const res = await request.get(`/user/checkin-status/${userId.value}`);
    if (res.data.success) {
      isCheckedIn.value = res.data.hasCheckedIn;
    }
  } catch (error) {
    console.error("查询签到状态失败", error);
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
// 🆕 播报系统逻辑
// ==========================================
const currentNews = ref({ id: 0, time: '14:03', name: 'ゲスト', game: 'ゲーム', prize: '10円' });
let timer = null;

const randomNames = ['タカシ', 'ユウキ', 'ミキ', 'サクラ', 'リョウ', 'アヤ', 'ケンタ', 'ユナ', 'ソウタ', 'ハルカ', 'ケビン', 'マイケル', 'ジョン', 'エミリ'];
const gameNames = ['金魚すくい', 'ダーツチャレンジ', 'クレーンゲーム', 'ガチャポン', 'スクラッチ', 'ルーレット', '宝探し', 'スロット'];

const prizeWeights = [
  { name: '10円', weight: 40 },     
  { name: '50円', weight: 25 },     
  { name: '100円', weight: 15 },    
  { name: '200円', weight: 8 },     
  { name: '500円', weight: 5 },     
  { name: '1,000円', weight: 3 },   
  { name: '10,000円', weight: 1.5 }, 
  { name: '100,000円', weight: 0.5 },
  { name: '200万円', weight: 0.01 }, 
  { name: '500万円', weight: 0.005 }
];

const getRandomPrize = () => {
  const totalWeight = prizeWeights.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < prizeWeights.length; i++) {
    if (random < prizeWeights[i].weight) {
      return prizeWeights[i].name;
    }
    random -= prizeWeights[i].weight;
  }
  return prizeWeights[0].name;
};

const generateNews = () => {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  currentNews.value = {
    id: Date.now(), 
    time: timeStr,
    name: randomNames[Math.floor(Math.random() * randomNames.length)],
    game: gameNames[Math.floor(Math.random() * gameNames.length)],
    prize: getRandomPrize()
  };
};

// ==========================================
// 🆕 出金弹窗逻辑
// ==========================================
const withdrawVisible = ref(false);
const withdrawAmount = ref(null);
const submittingWithdraw = ref(false);

const openWithdrawModal = () => {
  withdrawAmount.value = null;
  withdrawVisible.value = true;
};

const submitWithdraw = async () => {
  if (!withdrawAmount.value || withdrawAmount.value < 100) {
    return ElMessage.warning('出金金額は 100 円以上を入力してください');
  }

  submittingWithdraw.value = true;
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return router.push('/login');
    const user = JSON.parse(storedUser);

    const res = await request.post(`/user/withdraw/${user.id}`, { 
      amount: withdrawAmount.value 
    });
    
    if (res.data.success) {
      ElMessage.success(res.data.message || '出金申請を受け付けました');
      withdrawVisible.value = false;
      const infoRes = await request.get(`/user/info/${user.id}`);
      if (infoRes.data.success) userBalance.value = infoRes.data.user.balance;
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.error || '出金申請に失敗しました');
  } finally {
    submittingWithdraw.value = false;
  }
};

// ==========================================
// 获取用户信息（含实名状态同步 & 签到查询）
// ==========================================
onMounted(async () => {
  generateNews();
  timer = setInterval(generateNews, 3500);

  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  
  const user = JSON.parse(storedUser);
  username.value = user.username;
  userId.value = user.id;
  
  await checkCheckInStatus();

  try {
    const infoRes = await request.get(`/user/info/${user.id}`);
    if (infoRes.data.success) {
      userBalance.value = infoRes.data.user.balance;
      
      if (user.verify_status !== infoRes.data.user.verify_status) {
        user.verify_status = infoRes.data.user.verify_status;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  } catch (error) {
    console.error("获取余额失败", error);
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
/* 滚动播报条 */
.top-header-wrapper {}

.ticker-banner {
  background: #0f172a; 
  display: flex;
  align-items: center;
  height: 40px;
  overflow: hidden;
  color: white;
  font-size: 13px;
  font-weight: 500;
}

.ticker-label {
  background: #e83862; 
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-weight: 900;
  font-size: 14px;
  clip-path: polygon(0 0, 100% 0, 95% 100%, 0% 100%); 
  z-index: 2;
  white-space: nowrap;
}

.ticker-label .dot {
  width: 8px; height: 8px; background: white; border-radius: 50%; margin-right: 8px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.ticker-content {
  flex: 1;
  padding-left: 20px;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.news-item {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.news-item .time { color: #64748b; font-size: 12px; }
.news-item .name { color: #38bdf8; font-weight: bold; }
.news-item .game { color: #cbd5e1; }
.news-item .prize { color: #fde047; font-weight: bold; font-size: 14px; } 

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 原有的 Header */
.top-header {
  background: #fff; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eaeaea;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  font-family: 'Noto Sans JP', sans-serif;
}
.logo-area { display: flex; align-items: center; gap: 15px; cursor: pointer; }
.logo-icon { width: 40px; height: 40px; background: #e83862; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 24px; font-weight: bold; font-family: serif; flex-shrink: 0; }
.logo-text h1 { margin: 0; font-size: 20px; color: #e83862; display: flex; align-items: center; gap: 8px; font-weight: 900; white-space: nowrap; }
.online-badge { font-size: 10px; background: #fce4e8; color: #e83862; padding: 2px 6px; border-radius: 4px; }
.logo-text p { margin: 3px 0 0; font-size: 12px; color: #888; }

/* 右侧区域 */
.user-area { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.sound-icon { background: #f0f0f0; width: 35px; height: 35px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: #666; cursor: pointer; flex-shrink: 0; }

.balance-box { background: #0f172a; color: #fff; padding: 8px 15px; border-radius: 25px; display: flex; align-items: center; gap: 10px; font-size: 14px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2); flex-shrink: 0; }
.balance-label { font-size: 10px; color: #94a3b8; }
.balance-amount { font-weight: 900; font-size: 16px; color: #38bdf8; font-family: monospace; }

/* 入金/出金按钮 */
.charge-btn { border: none; padding: 8px 20px; border-radius: 20px; font-weight: 900; cursor: pointer; transition: 0.2s; white-space: nowrap; font-size: 14px; }
.deposit-btn { background: linear-gradient(180deg, #10b981, #059669); color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.withdraw-btn { background: linear-gradient(180deg, #ffcc00, #ffb300); color: #333; box-shadow: 0 4px 10px rgba(255, 204, 0, 0.3); }
.charge-btn:hover { transform: translateY(-2px); }

/* 🆕 签到按钮 */
.checkin-btn {
  background: linear-gradient(180deg, #f43f5e, #e83862);
  color: white; border: none; padding: 8px 16px; border-radius: 20px;
  font-weight: 900; cursor: pointer; transition: 0.2s; white-space: nowrap; font-size: 14px;
  box-shadow: 0 4px 10px rgba(232, 56, 98, 0.3);
}
.checkin-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(232, 56, 98, 0.5); }
.checkin-btn:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }

/* 个人中心入口 */
.user-profile { display: flex; align-items: center; gap: 12px; margin-left: 10px; padding-left: 15px; border-left: 1px solid #eaeaea; flex-shrink: 0; }
.username { font-size: 14px; font-weight: bold; color: #1e293b; cursor: pointer; transition: color 0.2s; white-space: nowrap; }
.username:hover { color: #e83862; text-decoration: underline; }

/* 个人中心按钮 */
.profile-btn { 
  background: #1e293b; color: #ffffff; border: none; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer; transition: 0.2s; white-space: nowrap; box-shadow: 0 4px 10px rgba(30, 41, 59, 0.2);
}
.profile-btn:hover { background: #0f172a; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(30, 41, 59, 0.3); }

/* 🆕 纯原生弹窗样式 */
.custom-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; z-index: 9999;
}
.custom-modal {
  background: #fff; width: 90%; max-width: 400px; border-radius: 16px; padding: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2); text-align: center;
}
.custom-modal h3 { margin: 0 0 20px; font-size: 20px; font-weight: 900; color: #1e293b; }
.custom-input {
  width: 100%; padding: 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 16px;
  outline: none; box-sizing: border-box; margin-bottom: 20px;
}
.custom-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.modal-btns { display: flex; gap: 12px; }
.modal-btns button { flex: 1; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; border: none; }
.btn-cancel { background: #f1f5f9; color: #64748b; }
.btn-confirm { background: #3b82f6; color: #fff; }
.btn-confirm:disabled { background: #94a3b8; cursor: not-allowed; }

/* 手机端 */
@media (max-width: 768px) {
  .ticker-label { padding: 0 10px; font-size: 12px; clip-path: none; }
  .ticker-content { padding-left: 10px; font-size: 12px; }
  .news-item { gap: 5px; }
  .news-item .prize { font-size: 13px; }

  .top-header { padding: 10px 15px; flex-direction: column; gap: 12px; }
  .logo-area { width: 100%; justify-content: center; }
  .logo-text p { display: none; }
  .logo-text h1 { font-size: 18px; }
  .user-area { width: 100%; justify-content: space-between; gap: 8px; }
  .sound-icon { display: none; }
  .balance-box { padding: 6px 12px; flex: 1; justify-content: center; }
  .balance-amount { font-size: 15px; }
  .charge-btn { padding: 6px 12px; font-size: 13px; }
  .checkin-btn { padding: 6px 12px; font-size: 13px; }
  .user-profile { margin-left: 0; padding-left: 10px; border-left: none; gap: 8px; }
  .username { display: none; }
  .profile-btn { padding: 6px 10px; font-size: 12px; }
}
</style>