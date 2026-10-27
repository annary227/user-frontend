<template>
  <div class="register-layout">
    <!-- 背景光斑 (与登录页保持一致的高级感) -->
    <div class="glow-circle circle-1"></div>
    <div class="glow-circle circle-2"></div>

    <div class="register-wrapper">
      <div class="form-section">
        <div class="register-card">
          <h2 class="welcome-title">新規登録</h2>
          <p class="welcome-sub">アカウントを作成して取引を開始</p>

          <div class="form-group">
            <label>ユーザー名</label>
            <div class="input-wrapper">
              <el-icon><User /></el-icon>
              <input v-model="username" type="text" placeholder="ユーザー名を入力してください" />
            </div>
          </div>

          <div class="form-group">
            <label>パスワード</label>
            <div class="input-wrapper">
              <el-icon><Lock /></el-icon>
              <input v-model="password" type="password" placeholder="パスワードを入力してください" />
            </div>
          </div>

          <!-- 确认密码输入框 -->
          <div class="form-group">
            <label>パスワード（確認）</label>
            <div class="input-wrapper">
              <el-icon><Lock /></el-icon>
              <input v-model="confirmPassword" type="password" placeholder="もう一度パスワードを入力" @keyup.enter="register" />
            </div>
            <!-- 实时校验提示 (纯日文) -->
            <p v-if="passwordMismatch" class="error-text">パスワードが一致しません</p>
          </div>

          <button class="register-btn" @click="register" :disabled="isLoading">
            {{ isLoading ? '登録中...' : '新規登録' }}
          </button>

          <p class="login-link">
            すでにアカウントをお持ちですか？ 
            <a @click="$router.push('/login')">ログイン</a>
          </p>
        </div>
      </div>
    </div>

    <!-- 🆕 注册成功高级弹窗 -->
    <Transition name="modal">
      <div v-if="showSuccessModal" class="success-modal-overlay">
        <div class="success-modal-card">
          <div class="success-icon">🎉</div>
          <h3>登録が完了しました！</h3>
          <p>アカウントの作成に成功しました。<br>ログインしてゲームを始めましょう。</p>
          <button class="success-confirm-btn" @click="goToLogin">ログイン画面へ</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const showSuccessModal = ref(false); // 🆕 控制成功弹窗
const router = useRouter();

// 实时计算两次密码是否不一致
const passwordMismatch = computed(() => {
  return confirmPassword.value.length > 0 && password.value !== confirmPassword.value;
});

const register = async () => {
  if (!username.value || !password.value || !confirmPassword.value) {
    return ElMessage.warning('すべての項目を入力してください');
  }

  if (username.value.length < 3) {
    return ElMessage.warning('ユーザー名は3文字以上で入力してください');
  }
  if (password.value.length < 6) {
    return ElMessage.warning('パスワードは6文字以上で入力してください');
  }

  if (password.value !== confirmPassword.value) {
    return ElMessage.error('パスワードが一致しません');
  }

  isLoading.value = true;
  try {
    const res = await request.post('/user/register', { 
      username: username.value, 
      password: password.value 
    });
    
    if (res.data.success) {
      // 🆕 注册成功后，不再直接跳转，而是打开成功弹窗
      showSuccessModal.value = true;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.error || '登録に失敗しました。もう一度お試しください。';
    ElMessage.error(errorMsg);
  } finally {
    isLoading.value = false;
  }
};

// 🆕 点击弹窗按钮后，再去登录页
const goToLogin = () => {
  showSuccessModal.value = false;
  router.push('/login');
};
</script>

<style scoped>
/* 整体布局 */
.register-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #0b1120;
  font-family: 'Noto Sans JP', sans-serif;
  position: relative;
  overflow: hidden;
}

/* 背景光斑 */
.glow-circle { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.4; }
.circle-1 { width: 600px; height: 600px; background: #e83862; top: -15%; left: -10%; }
.circle-2 { width: 700px; height: 700px; background: #0ea5e9; bottom: -20%; right: -10%; }

/* 核心卡片 */
.register-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 520px;
  min-height: 560px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}

.form-section { width: 100%; padding: 40px; }
.register-card { width: 100%; max-width: 380px; margin: 0 auto; }

.welcome-title { margin: 0 0 10px; font-size: 28px; color: white; font-weight: 900; text-align: center; }
.welcome-sub { margin: 0 0 30px; font-size: 14px; color: #94a3b8; text-align: center; }

/* 输入框 */
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: bold; color: #cbd5e1; margin-bottom: 8px; }
.input-wrapper {
  display: flex; align-items: center; gap: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; padding: 14px 16px; transition: 0.3s;
}
.input-wrapper:focus-within { border-color: #e83862; background: rgba(232, 56, 98, 0.05); box-shadow: 0 0 0 4px rgba(232, 56, 98, 0.1); }
.input-wrapper .el-icon { color: #64748b; font-size: 18px; }
.input-wrapper input { flex: 1; border: none; outline: none; background: transparent; font-size: 15px; color: white; }
.input-wrapper input::placeholder { color: #475569; }

/* 错误提示文字 */
.error-text { color: #ef4444; font-size: 12px; margin-top: 6px; padding-left: 4px; }

/* 注册按钮 */
.register-btn {
  width: 100%; padding: 16px; background: linear-gradient(135deg, #e83862, #f43f5e);
  color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 900;
  cursor: pointer; transition: 0.3s; box-shadow: 0 8px 20px rgba(232, 56, 98, 0.4); letter-spacing: 1px; margin-top: 10px;
}
.register-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(232, 56, 98, 0.6); }
.register-btn:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

/* 底部跳转 */
.login-link { margin-top: 25px; font-size: 14px; color: #94a3b8; text-align: center; }
.login-link a { color: #e83862; font-weight: bold; cursor: pointer; text-decoration: underline; margin-left: 5px; }

/* 手机端适配 */
@media (max-width: 768px) {
  .register-wrapper { min-height: 100vh; border-radius: 0; border: none; background: transparent; backdrop-filter: none; box-shadow: none; }
  .form-section { padding: 20px; }
  .register-card { padding: 20px; }
}

/* 🆕 注册成功弹窗样式 */
.success-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.success-modal-card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px 30px;
  border-radius: 24px;
  width: 90%;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6), 0 0 40px rgba(232, 56, 98, 0.2);
}

.success-icon {
  font-size: 60px;
  margin-bottom: 20px;
  animation: bounce 1s infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}

.success-modal-card h3 {
  margin: 0 0 15px 0;
  font-size: 22px;
  font-weight: 900;
  color: #f8fafc;
}

.success-modal-card p {
  margin: 0 0 30px 0;
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
}

.success-confirm-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #e83862, #f43f5e);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(232, 56, 98, 0.4);
  transition: 0.3s;
}

.success-confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(232, 56, 98, 0.6);
}

/* 弹窗动画 */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-active .success-modal-card {
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>