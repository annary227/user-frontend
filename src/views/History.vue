<template>
  <header class="top-header">
    <div class="logo-area" @click="$router.push('/')">
      <div class="logo-icon">Q</div>
      <div class="logo-text">
        <h1>クイックワン <span class="online-badge">ONLINE</span></h1>
        <p>ネット専用いつでも秒で当たる宝くじ</p>
      </div>
    </div>
    
    <div class="user-area">
      <div class="sound-icon">🔊</div>
      
      <!-- 动态余额渲染 -->
      <div class="balance-box">
        <span class="balance-label">残高</span>
        <span class="balance-amount">¥{{ userBalance.toLocaleString() }}</span>
      </div>
      
      <!-- 🆕 入金按钮 -->
      <button class="charge-btn deposit-btn" @click="$router.push('/profile')">入金</button>

      <!-- 🆕 出金按钮 -->
      <button class="charge-btn withdraw-btn" @click="$router.push('/profile')">出金</button>

      <!-- 🆕 用户信息与个人中心 (最右侧) -->
      <div class="user-profile">
        <span class="username" @click="$router.push('/profile')" title="マイページへ">
          {{ username }} 様
        </span>
        <!-- 点击进入个人中心 -->
        <button class="profile-btn" @click="$router.push('/profile')">マイページ</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request'; 

const router = useRouter();
const userBalance = ref(0);
const username = ref('ゲスト');

// 页面加载时，读取本地缓存并拉取真实余额
onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  
  const user = JSON.parse(storedUser);
  username.value = user.username;
  
  try {
    const infoRes = await request.get(`/user/info/${user.id}`);
    if (infoRes.data.success) {
      userBalance.value = infoRes.data.user.balance;
    }
  } catch (error) {
    console.error("获取余额失败", error);
  }
});
</script>

<style scoped>
/* ================= 电脑端基础样式 ================= */
.top-header {
  background: #fff; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eaeaea;
  position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  font-family: 'Noto Sans JP', sans-serif;
}
.logo-area { display: flex; align-items: center; gap: 15px; cursor: pointer; }
.logo-icon { width: 40px; height: 40px; background: #e83862; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 24px; font-weight: bold; font-family: serif; flex-shrink: 0; }
.logo-text h1 { margin: 0; font-size: 20px; color: #e83862; display: flex; align-items: center; gap: 8px; font-weight: 900; white-space: nowrap; }
.online-badge { font-size: 10px; background: #fce4e8; color: #e83862; padding: 2px 6px; border-radius: 4px; }
.logo-text p { margin: 3px 0 0; font-size: 12px; color: #888; }

/* 右侧用户区 */
.user-area { display: flex; align-items: center; gap: 12px; }
.sound-icon { background: #f0f0f0; width: 35px; height: 35px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: #666; cursor: pointer; flex-shrink: 0; }

.balance-box { background: #0f172a; color: #fff; padding: 8px 15px; border-radius: 25px; display: flex; align-items: center; gap: 10px; font-size: 14px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2); flex-shrink: 0; }
.balance-label { font-size: 10px; color: #94a3b8; }
.balance-amount { font-weight: 900; font-size: 16px; color: #38bdf8; font-family: monospace; }

/* 入金 / 出金 按钮 */
.charge-btn { border: none; padding: 8px 20px; border-radius: 20px; font-weight: 900; cursor: pointer; transition: 0.2s; white-space: nowrap; font-size: 14px; }
.deposit-btn { background: linear-gradient(180deg, #10b981, #059669); color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.withdraw-btn { background: linear-gradient(180deg, #ffcc00, #ffb300); color: #333; box-shadow: 0 4px 10px rgba(255, 204, 0, 0.3); }
.charge-btn:hover { transform: translateY(-2px); }

/* 用户资料与个人中心 */
.user-profile { display: flex; align-items: center; gap: 12px; margin-left: 10px; padding-left: 15px; border-left: 1px solid #eaeaea; flex-shrink: 0; }
.username { font-size: 14px; font-weight: bold; color: #1e293b; cursor: pointer; transition: color 0.2s; white-space: nowrap; }
.username:hover { color: #e83862; text-decoration: underline; }

/* 个人中心按钮 */
.profile-btn { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.profile-btn:hover { background: #e2e8f0; color: #1e293b; }

/* ================= 📱 手机端极致适配 ================= */
@media (max-width: 768px) {
  .top-header {
    padding: 10px 15px;
    flex-direction: column; /* 变更为上下两行 */
    gap: 12px;
  }

  .logo-area {
    width: 100%;
    justify-content: center;
  }
  
  .logo-text p {
    display: none; /* 手机端隐藏副标题，节省空间 */
  }
  
  .logo-text h1 {
    font-size: 18px;
  }

  .user-area {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
  }

  /* 隐藏声音图标，手机上没必要 */
  .sound-icon {
    display: none; 
  }

  .balance-box {
    padding: 6px 12px;
    flex: 1; /* 撑满剩余空间 */
    justify-content: center;
  }
  
  .balance-amount {
    font-size: 15px;
  }

  /* 手机端按钮变小一点 */
  .charge-btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .user-profile {
    margin-left: 0;
    padding-left: 10px;
    border-left: none;
    gap: 8px;
  }

  .username {
    display: none; /* 手机端隐藏用户名，防止太长换行 */
  }

  .profile-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>