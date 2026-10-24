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
      
      <!-- 动态余额 -->
      <div class="balance-box">
        <span class="balance-label">残高</span>
        <span class="balance-amount">¥{{ userBalance.toLocaleString() }}</span>
      </div>
      
      <!-- 入金 和 出金 -->
      <button class="charge-btn deposit-btn" @click="$router.push('/profile')">入金</button>
      <button class="charge-btn withdraw-btn" @click="$router.push('/profile')">出金</button>

      <!-- 个人中心 -->
      <div class="user-profile">
        <span class="username" @click="$router.push('/profile')">
          {{ username }} 様
        </span>
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
/* ================= 电脑端 ================= */
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

/* 右侧区域 */
.user-area { display: flex; align-items: center; gap: 12px; }
.sound-icon { background: #f0f0f0; width: 35px; height: 35px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: #666; cursor: pointer; flex-shrink: 0; }

.balance-box { background: #0f172a; color: #fff; padding: 8px 15px; border-radius: 25px; display: flex; align-items: center; gap: 10px; font-size: 14px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2); flex-shrink: 0; }
.balance-label { font-size: 10px; color: #94a3b8; }
.balance-amount { font-weight: 900; font-size: 16px; color: #38bdf8; font-family: monospace; }

/* 入金/出金按钮 */
.charge-btn { border: none; padding: 8px 20px; border-radius: 20px; font-weight: 900; cursor: pointer; transition: 0.2s; white-space: nowrap; font-size: 14px; }
.deposit-btn { background: linear-gradient(180deg, #10b981, #059669); color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.withdraw-btn { background: linear-gradient(180deg, #ffcc00, #ffb300); color: #333; box-shadow: 0 4px 10px rgba(255, 204, 0, 0.3); }
.charge-btn:hover { transform: translateY(-2px); }

/* 个人中心入口 */
.user-profile { display: flex; align-items: center; gap: 12px; margin-left: 10px; padding-left: 15px; border-left: 1px solid #eaeaea; flex-shrink: 0; }
.username { font-size: 14px; font-weight: bold; color: #1e293b; cursor: pointer; transition: color 0.2s; white-space: nowrap; }
.username:hover { color: #e83862; text-decoration: underline; }

/* 🆕 个人中心按钮：深邃黑底，完美融入 */
.profile-btn { 
  background: #1e293b; 
  color: #ffffff; 
  border: none; 
  padding: 8px 16px; 
  border-radius: 20px; 
  font-size: 13px; 
  font-weight: bold; 
  cursor: pointer; 
  transition: 0.2s; 
  white-space: nowrap; 
  box-shadow: 0 4px 10px rgba(30, 41, 59, 0.2);
}
.profile-btn:hover { 
  background: #0f172a; 
  transform: translateY(-2px); 
  box-shadow: 0 6px 15px rgba(30, 41, 59, 0.3);
}

/* ================= 📱 手机端 ================= */
@media (max-width: 768px) {
  .top-header { padding: 10px 15px; flex-direction: column; gap: 12px; }
  .logo-area { width: 100%; justify-content: center; }
  .logo-text p { display: none; }
  .logo-text h1 { font-size: 18px; }
  .user-area { width: 100%; justify-content: space-between; gap: 8px; }
  .sound-icon { display: none; }
  .balance-box { padding: 6px 12px; flex: 1; justify-content: center; }
  .balance-amount { font-size: 15px; }
  .charge-btn { padding: 6px 12px; font-size: 13px; }
  .user-profile { margin-left: 0; padding-left: 10px; border-left: none; gap: 8px; }
  .username { display: none; }
  .profile-btn { padding: 6px 10px; font-size: 12px; }
}
</style>