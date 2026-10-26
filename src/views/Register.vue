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
              <input v-model="password" type="password" placeholder="パスワードを入力してください" @keyup.enter="register" />
            </div>
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
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

const username = ref('');
const password = ref('');
const isLoading = ref(false);
const router = useRouter();

const register = async () => {
  if (!username.value || !password.value) {
    return ElMessage.warning('ユーザー名とパスワードを入力してください');
  }

  isLoading.value = true;
  try {
    const res = await request.post('/user/register', { 
      username: username.value, 
      password: password.value 
    });
    
    if (res.data.success) {
      ElMessage.success('登録が完了しました。ログインしてください。');
      router.push('/login');
    }
  } catch (error) {
    // 后端返回的报错也已经被你改成日文了，这里直接透传
    ElMessage.error(error.response?.data?.error || '登録に失敗しました。');
  } finally {
    isLoading.value = false;
  }
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
  min-height: 500px;
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
</style>