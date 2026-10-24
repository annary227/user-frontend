<template>
  <div class="login-layout">
    <!-- 背景光斑 -->
    <div class="glow-circle circle-1"></div>
    <div class="glow-circle circle-2"></div>

    <div class="login-wrapper">
      <!-- 右侧：登录表单 (居中显示) -->
      <div class="form-section">
        <div class="login-card">
          <div class="mobile-logo">
            <div class="logo-icon">Q</div>
          </div>
          
          <h2 class="welcome-title">おかえりなさい</h2>
          <p class="welcome-sub">アカウントにログインして取引を開始</p>

          <div class="form-group">
            <label>ユーザー名 / 邮箱</label>
            <div class="input-wrapper">
              <el-icon><User /></el-icon>
              <input v-model="username" type="text" placeholder="ユーザー名を入力" />
            </div>
          </div>

          <div class="form-group">
            <label>パスワード / 密码</label>
            <div class="input-wrapper">
              <el-icon><Lock /></el-icon>
              <input v-model="password" type="password" placeholder="パスワードを入力" @keyup.enter="handleLogin" />
            </div>
          </div>

          <div class="form-actions">
            <!-- 🆕 替换为原生的可点击自定义勾选框 -->
            <div class="custom-checkbox" @click="rememberMe = !rememberMe">
              <div class="box" :class="{ active: rememberMe }">
                <span v-if="rememberMe">✓</span>
              </div>
              <span>ログイン状態を保持</span>
            </div>
            
            <a class="forgot-pwd" @click="showLineModal = true">パスワードをお忘れですか？</a>
          </div>
          
          <button class="login-btn" @click="handleLogin" :disabled="isLoading">
            {{ isLoading ? 'ログイン中...' : 'ログイン / 登 录' }}
          </button>

          <p class="register-link">
            アカウントをお持ちでないですか？ 
            <a @click="$router.push('/register')">新規登録</a>
          </p>

          <div class="social-login">
            <p>または以下でログイン</p>
            <div class="social-icons">
              <div class="social-icon">G</div>
              <div class="social-icon">X</div>
              <div class="social-icon">L</div>
            </div>
          </div>

          <p class="footer-text">※本サイトは18歳未満のご利用はできません。</p>

          <!-- 信任标签 -->
          <div class="trust-badges">
            <span>🔒 SSL暗号化通信</span>
            <span>🛡️ 公安委員会認可</span>
            <span>⚡ 即時入出金</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 🆕 忘记密码弹窗 -->
    <Transition name="fade">
      <div v-if="showLineModal" class="line-modal-overlay" @click.self="showLineModal = false">
        <div class="line-modal-card">
          <h3>パスワード再設定</h3>
          <p class="sub">パスワードをお忘れの場合は、公式LINEまでお問い合わせください。</p>
          
          <a href="https://lin.ee/sV2XGu5" target="_blank" class="line-btn">
            <span class="line-icon">💬</span> 公式LINEで問い合わせる
          </a>
          
          <button class="close-modal-btn" @click="showLineModal = false">閉じる</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request';
import { User, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const username = ref('test_user');
const password = ref('123456');
const rememberMe = ref(true);
const isLoading = ref(false);
const showLineModal = ref(false);
const router = useRouter();

const handleLogin = async () => {
  if (!username.value || !password.value) return ElMessage.warning('请输入账号密码');
  
  isLoading.value = true;
  try {
    const res = await request.post('/user/login', { 
      username: username.value, 
      password: password.value 
    });
    if (res.data.success) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
      ElMessage.success('ログイン成功');
      router.push('/');
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.error || '登录失败，请检查账号密码');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* ================= 整体布局 ================= */
.login-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #0b1120;
  font-family: 'Noto Sans JP', sans-serif;
  position: relative;
  overflow: hidden;
}

/* 背景动态光斑 */
.glow-circle { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.4; }
.circle-1 { width: 600px; height: 600px; background: #e83862; top: -15%; left: -10%; }
.circle-2 { width: 700px; height: 700px; background: #0ea5e9; bottom: -20%; right: -10%; }

/* 核心包裹层 */
.login-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 520px;
  min-height: 650px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  overflow: hidden;
}

/* ================= 表单区 ================= */
.form-section {
  width: 100%;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 100%;
  max-width: 380px;
}

.mobile-logo { display: none; }

.welcome-title { margin: 0 0 10px; font-size: 28px; color: white; font-weight: 900; }
.welcome-sub { margin: 0 0 30px; font-size: 14px; color: #94a3b8; }

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

/* 操作区 */
.form-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }

/* 🆕 自定义勾选框样式 */
.custom-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #cbd5e1; font-size: 14px; }
.custom-checkbox .box { width: 18px; height: 18px; border: 1px solid #64748b; border-radius: 4px; display: flex; justify-content: center; align-items: center; font-size: 12px; color: white; transition: 0.2s; }
.custom-checkbox .box.active { background: #e83862; border-color: #e83862; }

.forgot-pwd { font-size: 13px; color: #e83862; cursor: pointer; font-weight: bold; }
.forgot-pwd:hover { text-decoration: underline; }

.login-btn {
  width: 100%; padding: 16px; background: linear-gradient(135deg, #e83862, #f43f5e);
  color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 900;
  cursor: pointer; transition: 0.3s; box-shadow: 0 8px 20px rgba(232, 56, 98, 0.4); letter-spacing: 1px;
}
.login-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(232, 56, 98, 0.6); }
.login-btn:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

.register-link { margin-top: 25px; font-size: 14px; color: #94a3b8; text-align: center; }
.register-link a { color: #e83862; font-weight: bold; cursor: pointer; text-decoration: underline; }

/* 第三方登录 */
.social-login { margin-top: 30px; text-align: center; }
.social-login p { font-size: 12px; color: #64748b; margin-bottom: 15px; position: relative; }
.social-login p::before, .social-login p::after { content: ""; position: absolute; top: 50%; width: 30%; height: 1px; background: #334155; }
.social-login p::before { left: 0; }
.social-login p::after { right: 0; }
.social-icons { display: flex; justify-content: center; gap: 15px; }
.social-icon { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; justify-content: center; align-items: center; font-weight: bold; color: #cbd5e1; cursor: pointer; transition: 0.2s; border: 1px solid rgba(255,255,255,0.1); }
.social-icon:hover { background: rgba(255,255,255,0.1); color: white; }

.footer-text { margin-top: 20px; font-size: 11px; color: #475569; text-align: center; }

/* 信任标签 */
.trust-badges { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 25px; }
.trust-badges span { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 20px; font-size: 11px; color: #cbd5e1; }

/* ================= 🆕 忘记密码弹窗样式 ================= */
.line-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.line-modal-card {
  background: #1e293b;
  border: 1px solid #334155;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}
.line-modal-card h3 { color: white; margin: 0 0 15px; font-size: 20px; }
.line-modal-card .sub { color: #94a3b8; font-size: 13px; margin-bottom: 25px; line-height: 1.6; }
.line-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: #06C755; color: white; padding: 14px; border-radius: 12px; font-size: 16px; font-weight: bold; text-decoration: none; transition: 0.2s; margin-bottom: 15px; }
.line-btn:hover { background: #05b04b; transform: translateY(-2px); }
.close-modal-btn { background: transparent; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 10px; text-decoration: underline; }
.close-modal-btn:hover { color: white; }

/* 弹窗淡入淡出动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ================= 📱 手机端适配 ================= */
@media (max-width: 900px) {
  .login-wrapper {
    min-height: 100vh;
    border-radius: 0;
    border: none;
    background: transparent;
    backdrop-filter: none;
    box-shadow: none;
  }
  
  .form-section { padding: 20px; }
  
  .login-card { max-width: 100%; padding: 20px; }
  
  .mobile-logo { display: flex; justify-content: center; margin-bottom: 20px; }
  .mobile-logo .logo-icon { width: 70px; height: 70px; font-size: 36px; border-radius: 16px; }
  
  .welcome-title, .welcome-sub { text-align: center; }
}
</style>