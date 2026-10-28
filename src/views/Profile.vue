<!-- src/views/Profile.vue -->
<template>
  <div class="profile-container">
    <header class="page-header">
      <button class="back-btn" @click="$router.push('/')">‹ ロビーに戻る</button>
      <h2>マイページ</h2>
      <div style="width: 60px;"></div>
    </header>

    <main class="content">
      <!-- 1. 顶部横幅 -->
      <div class="account-banner">
        <div v-if="!isLoadingUser" class="banner-top">
          <span class="username">{{ userInfo.username }} 様</span>
          <span v-if="verifyStatus === 0" class="verify-btn" @click="startKyc">本人確認へ</span>
          <span v-else-if="verifyStatus === 1" class="status-badge pending">審査中</span>
          <span v-else-if="verifyStatus === 2" class="status-badge verified">本人確認済み</span>
          <span v-else-if="verifyStatus === 3" class="verify-btn" @click="startKyc">再申請する</span>
        </div>
        <div class="banner-balance">
          <span class="label">現在の残高</span>
          <span class="amount">¥{{ userInfo.balance?.toLocaleString() }}</span>
        </div>
      </div>

      <!-- 2. 出金按钮 -->
      <div class="quick-actions">
        <button class="action-btn primary" @click="handleWithdrawClick">出金を申請する</button>
      </div>

      <!-- 3. 菜单列表 -->
      <div class="menu-list">
        <div class="menu-item" @click="showDepositModal = true">
          <span>入金履歴</span><span class="arrow">›</span>
        </div>
        <div class="menu-item" @click="showWithdrawHistoryModal = true">
          <span>出金履歴</span><span class="arrow">›</span>
        </div>
        <!-- 🆕 游戏记录入口 -->
        <div class="menu-item" @click="showGameHistoryModal = true">
          <span>ゲーム購入履歴</span><span class="arrow">›</span>
        </div>
        <!-- 🆕 棒球记录入口 -->
        <div class="menu-item" @click="showMlbHistoryModal = true">
          <span>MLB ベッティング履歴</span><span class="arrow">›</span>
        </div>
        <div class="menu-item" @click="showPasswordModal = true">
          <span>パスワード変更</span><span class="arrow">›</span>
        </div>
        <div class="menu-item" @click="showServiceModal = true">
          <span>オンラインサポート</span><span class="arrow">›</span>
        </div>
        <div class="menu-item logout-item" @click="handleLogout">
          <span>ログアウト</span><span class="arrow">›</span>
        </div>
      </div>

      <!-- 出金提示 -->
      <div class="deposit-notice-card">
        <div class="notice-icon">💡</div>
        <div class="notice-content">
          <h4>出金に関する重要なお知らせ</h4>
          <p>不正利用防止のため、<strong>キャンペーンや毎日ログイン（チェックイン）等で獲得したボーナス残高のみ</strong>でプレイされた場合、初回のご入金（デポジット）が完了するまで出金申請を行うことができません。あらかじめご了承ください。</p>
        </div>
      </div>
    </main>

    <!-- ================= 弹窗：两步认证 ================= -->
    <Transition name="modal">
      <div v-if="showKycModal" class="modal-overlay">
        <div class="modal-card">
          <h3>本人確認の申請</h3>
          <p class="sub">申請の審査には1〜2営業日かかる場合がございます。</p>
          <div v-if="kycStep === 1">
            <div class="form-group">
              <label>証明書の種類</label>
              <select v-model="kycForm.idType" class="form-select">
                <option value="license">運転免許証</option>
                <option value="my_number">マイナンバーカード</option>
                <option value="passport">パスポート</option>
              </select>
            </div>
            <div class="form-group"><label>本名</label><input v-model="kycForm.name" type="text" /></div>
            <div class="form-group"><label>証明書番号</label><input v-model="kycForm.idNumber" type="text" /></div>
            <div class="modal-actions">
              <button class="cancel" @click="showKycModal = false">キャンセル</button>
              <button class="confirm blue-btn" :disabled="!kycForm.name || !kycForm.idNumber" @click="kycStep = 2">次へ</button>
            </div>
          </div>
          <div v-if="kycStep === 2">
            <div class="form-group"><label>金融機関名</label><input v-model="kycBankForm.bankName" type="text" /></div>
            <div class="form-row">
              <div class="form-group half"><label>支店名</label><input v-model="kycBankForm.branchName" type="text" /></div>
              <div class="form-group half"><label>支店コード</label><input v-model="kycBankForm.branchCode" type="text" maxlength="3" /></div>
            </div>
            <div class="form-group"><label>口座番号</label><input v-model="kycBankForm.accountNumber" type="text" maxlength="7" /></div>
            <div class="form-group"><label>口座名義</label><input v-model="kycBankForm.accountName" type="text" /></div>
            <div class="modal-actions">
              <button class="cancel" @click="kycStep = 1">戻る</button>
              <button class="confirm blue-btn" :disabled="isSubmittingKyc" @click="submitKycAll">申請する</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ================= 弹窗：出金申请 ================= -->
    <Transition name="modal">
      <div v-if="showWithdrawModal" class="modal-overlay">
        <div class="modal-card">
          <h3>出金申請</h3>
          <div class="form-group">
            <input v-model.number="withdrawAmount" type="number" placeholder="出金金額を入力してください" />
          </div>
          <div class="modal-actions">
            <button class="cancel" @click="showWithdrawModal = false">キャンセル</button>
            <button class="confirm blue-btn" :disabled="isWithdrawing" @click="submitWithdraw">申請する</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ================= 弹窗：入金履历 ================= -->
    <Transition name="modal">
      <div v-if="showDepositModal" class="modal-overlay">
        <div class="modal-card">
          <h3>入金履歴</h3>
          <div class="history-list">
            <div v-if="deposits.length === 0" class="empty">履歴はありません</div>
            <div v-for="item in deposits" :key="item.id" class="history-item">
              <div>
                <p class="h-title">入金</p>
                <p class="h-time">{{ formatTime(item.created_at) }}</p>
              </div>
              <span class="h-amount text-green">+ ¥{{ item.amount.toLocaleString() }}</span>
            </div>
          </div>
          <button class="confirm blue-btn full-btn" @click="showDepositModal = false">閉じる</button>
        </div>
      </div>
    </Transition>

    <!-- ================= 弹窗：出金履历 ================= -->
    <Transition name="modal">
      <div v-if="showWithdrawHistoryModal" class="modal-overlay">
        <div class="modal-card">
          <h3>出金履歴</h3>
          <div class="history-list">
            <div v-if="withdrawals.length === 0" class="empty">履歴はありません</div>
            <div v-for="item in withdrawals" :key="item.id" class="history-item">
              <div>
                <p class="h-title">出金</p>
                <p class="h-time">{{ formatTime(item.created_at) }}</p>
              </div>
              <div style="text-align: right;">
                <p class="h-amount text-red">- ¥{{ item.amount.toLocaleString() }}</p>
                <p class="h-status" :class="getStatusClass(item.status)">{{ getStatusText(item.status) }}</p>
              </div>
            </div>
          </div>
          <button class="confirm blue-btn full-btn" @click="showWithdrawHistoryModal = false">閉じる</button>
        </div>
      </div>
    </Transition>

    <!-- ================= 🆕 弹窗：游戏购买履历 ================= -->
    <Transition name="modal">
      <div v-if="showGameHistoryModal" class="modal-overlay">
        <div class="modal-card">
          <h3>ゲーム購入履歴</h3>
          <div class="history-list">
            <div v-if="gameRecords.length === 0" class="empty">履歴はありません</div>
            <div v-for="record in gameRecords" :key="'g_'+record.id" class="history-item">
              <div>
                <p class="h-title">{{ record.title }}</p>
                <p class="h-time">{{ formatTime(record.created_at) }}</p>
              </div>
              <div style="text-align: right;">
                <span class="h-amount" :class="record.prize_value > 0 ? 'text-green' : 'text-red'">
                  {{ record.prize_value > 0 ? `+ ¥${record.prize_value.toLocaleString()}` : `- ¥${record.amount.toLocaleString()}` }}
                </span>
                <p class="h-status" style="color:#94a3b8;">{{ record.result }}</p>
              </div>
            </div>
          </div>
          <button class="confirm blue-btn full-btn" @click="showGameHistoryModal = false">閉じる</button>
        </div>
      </div>
    </Transition>

    <!-- ================= 🆕 弹窗：棒球预测履历 ================= -->
    <Transition name="modal">
      <div v-if="showMlbHistoryModal" class="modal-overlay">
        <div class="modal-card">
          <h3>MLB ベッティング履歴</h3>
          <div class="history-list">
            <div v-if="mlbRecords.length === 0" class="empty">履歴はありません</div>
            <div v-for="record in mlbRecords" :key="'m_'+record.id" class="history-item" style="flex-direction: column; align-items: stretch; gap: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <p class="h-title">{{ record.title }}</p>
                  <p class="h-time">{{ formatTime(record.created_at) }}</p>
                </div>
                <span class="h-amount" :class="record.result === 'won' ? 'text-green' : (record.result === 'lost' ? 'text-red' : 'text-orange')">
                  <template v-if="record.result === 'won'">+ ¥{{ record.payout.toLocaleString() }}</template>
                  <template v-else-if="record.result === 'lost'">- ¥{{ record.amount.toLocaleString() }}</template>
                  <template v-else>結果待ち</template>
                </span>
              </div>
              <!-- 比分对比区 -->
              <div style="display: flex; gap: 15px; background: #f8fafc; padding: 8px 12px; border-radius: 8px; font-size: 13px;">
                <span style="color: #64748b;">予想: <strong style="color: #ef4444;">{{ record.bet_selection }}</strong></span>
                <span style="color: #64748b;">最終: <strong style="color: #3b82f6;">{{ record.actual_score }}</strong></span>
              </div>
            </div>
          </div>
          <button class="confirm blue-btn full-btn" @click="showMlbHistoryModal = false">閉じる</button>
        </div>
      </div>
    </Transition>

    <!-- ================= 弹窗：修改密码 ================= -->
    <Transition name="modal">
      <div v-if="showPasswordModal" class="modal-overlay">
        <div class="modal-card">
          <h3>パスワード変更</h3>
          <div class="form-group"><label>新パスワード</label><input v-model="newPassword" type="password" /></div>
          <div class="modal-actions">
            <button class="cancel" @click="showPasswordModal = false">キャンセル</button>
            <button class="confirm blue-btn" :disabled="isChangingPwd" @click="submitPassword">変更する</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ================= 弹窗：联系客服 ================= -->
    <Transition name="modal">
      <div v-if="showServiceModal" class="modal-overlay">
        <div class="modal-card">
          <h3>オンラインサポート</h3>
          <div class="service-box">
            <p><strong>🕒 営業時間:</strong> 10:00 - 19:00 (土日祝除く)</p>
            <p><strong>📧 メール:</strong> support@quickone.cc.cd</p>
          </div>
          <a href="https://lin.ee/OHAOimh" target="_blank" class="line-btn">
            <span class="line-icon">💬</span> 公式LINEで問い合わせる
          </a>
          <div class="modal-actions" style="margin-top: 15px;">
            <button class="confirm blue-btn" @click="showServiceModal = false">閉じる</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const userInfo = ref({});
const verifyStatus = ref(0);
const bankStatus = ref(0);
const isLoadingUser = ref(true); 

// 弹窗控制
const showKycModal = ref(false);
const kycStep = ref(1);
const showWithdrawModal = ref(false);
const showDepositModal = ref(false);
const showWithdrawHistoryModal = ref(false);
const showPasswordModal = ref(false);
const showServiceModal = ref(false);

// 🆕 新增记录弹窗
const showGameHistoryModal = ref(false);
const showMlbHistoryModal = ref(false);

// 状态及表单
const isSubmittingKyc = ref(false);
const isWithdrawing = ref(false);
const isChangingPwd = ref(false);
const kycForm = ref({ idType: 'license', name: '', idNumber: '' });
const kycBankForm = ref({ bankName: '', branchName: '', branchCode: '', accountNumber: '', accountName: '', accountType: '普通' });
const withdrawAmount = ref(null);
const newPassword = ref('');
const deposits = ref([]);
const withdrawals = ref([]);

// 🆕 新增记录容器
const gameRecords = ref([]);
const mlbRecords = ref([]);

const fetchUserInfo = async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return router.push('/login');
  const cached = JSON.parse(storedUser);
  try {
    isLoadingUser.value = true; 
    const res = await request.get(`/user/info/${cached.id}`);
    if (res.data.success) {
      userInfo.value = res.data.user;
      verifyStatus.value = res.data.user.verify_status;
      bankStatus.value = res.data.user.bank_name ? 1 : 0;
      const merged = { ...cached, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(merged));
    }
  } catch (error) { console.error(error); } 
  finally { isLoadingUser.value = false; }
};

const fetchHistory = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;
  try {
    const dep = await request.get(`/user/deposits/${user.id}`);
    if (dep.data.success) deposits.value = dep.data.records;
    const wit = await request.get(`/user/withdrawals/${user.id}`);
    if (wit.data.success) withdrawals.value = wit.data.records;

    // 🆕 获取分离的购彩记录
    const rec = await request.get(`/user/all-records/${user.id}`);
    if (rec.data.success) {
      gameRecords.value = rec.data.gameRecords || [];
      mlbRecords.value = rec.data.mlbRecords || [];
    }
  } catch (e) { console.error(e); }
};

const startKyc = () => {
  kycStep.value = verifyStatus.value === 2 ? 2 : 1;
  showKycModal.value = true;
};

const handleWithdrawClick = () => {
  if (verifyStatus.value === 0 || verifyStatus.value === 3) {
    kycStep.value = 1; showKycModal.value = true;
  } else if (verifyStatus.value === 1) {
    ElMessage.warning('本人確認は現在審査中です。結果をお待ちください。');
  } else if (bankStatus.value !== 1) {
    kycStep.value = 2; showKycModal.value = true;
  } else {
    withdrawAmount.value = null; showWithdrawModal.value = true;
  }
};

const submitKycAll = async () => {
  isSubmittingKyc.value = true;
  try {
    if (verifyStatus.value !== 2) {
      const verifyRes = await request.post(`/user/verify/${userInfo.value.id}`, kycForm.value);
      if (verifyRes.data.success && verifyRes.data.user) {
        userInfo.value = { ...userInfo.value, ...verifyRes.data.user };
        verifyStatus.value = verifyRes.data.user.verify_status;
        const cached = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...cached, ...verifyRes.data.user }));
      }
    }
    await request.post(`/user/bind-bank/${userInfo.value.id}`, kycBankForm.value);
    ElMessage.success('申請が完了しました。審査結果をお待ちください。');
    showKycModal.value = false;
    await fetchUserInfo();
  } catch (error) { ElMessage.error(error.response?.data?.error || '申請に失敗しました。'); } 
  finally { isSubmittingKyc.value = false; }
};

const submitWithdraw = async () => {
  if (!withdrawAmount.value || withdrawAmount.value < 100) return ElMessage.warning('最低出金金額は 100円 です。');
  isWithdrawing.value = true;
  try {
    const res = await request.post(`/user/withdraw/${userInfo.value.id}`, { amount: withdrawAmount.value });
    if (res.data.success) {
      ElMessage.success('出金申請を受け付けました。');
      showWithdrawModal.value = false;
      fetchUserInfo();
      fetchHistory();
    }
  } catch (error) { ElMessage.error(error.response?.data?.error || '申請に失敗しました。'); } 
  finally { isWithdrawing.value = false; }
};

const submitPassword = async () => {
  if (!newPassword.value) return ElMessage.warning('新しいパスワードを入力してください。');
  isChangingPwd.value = true;
  try {
    await request.post(`/user/change-password/${userInfo.value.id}`, { newPassword: newPassword.value });
    ElMessage.success('パスワードが変更されました。');
    showPasswordModal.value = false;
    newPassword.value = '';
  } catch (error) { ElMessage.error('変更に失敗しました。'); } 
  finally { isChangingPwd.value = false; }
};

const handleLogout = () => {
  ElMessageBox.confirm('ログアウトしますか？', '確認', {
    confirmButtonText: '確定',
    cancelButtonText: 'キャンセル',
    type: 'warning',
  }).then(() => {
    localStorage.removeItem('user');
    router.push('/login');
  }).catch(() => {});
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
const getStatusText = (status) => {
  if (status === 0) return '審査中';
  if (status === 1) return '完了';
  return '却下';
};
const getStatusClass = (status) => {
  if (status === 0) return 'text-orange';
  if (status === 1) return 'text-green';
  return 'text-gray';
};

onMounted(() => {
  fetchUserInfo();
  fetchHistory();
});
</script>

<style scoped>
/* 样式完全保留并新增了注单颜色标识 */
.profile-container { min-height: 100vh; background: #f1f5f9; font-family: 'Noto Sans JP', sans-serif; }
.page-header { background: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eaeaea; }
.back-btn { background: none; border: none; font-size: 16px; color: #1e293b; cursor: pointer; font-weight: bold; }
.page-header h2 { margin: 0; font-size: 18px; font-weight: bold; }
.content { max-width: 600px; margin: 20px auto; padding: 0 20px; }
.account-banner { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 20px; padding: 25px; color: white; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2); margin-bottom: 20px; }
.banner-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; min-height: 30px; }
.username { font-size: 18px; font-weight: bold; }
.verify-btn { background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; }
.status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
.status-badge.pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.status-badge.verified { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.banner-balance .label { font-size: 12px; color: #94a3b8; display: block; margin-bottom: 5px; }
.banner-balance .amount { font-size: 34px; font-weight: 900; font-family: monospace; color: #38bdf8; }
.quick-actions { margin-bottom: 25px; }
.action-btn { width: 100%; padding: 16px; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; border: none; transition: 0.2s; }
.action-btn.primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
.action-btn:active { transform: scale(0.96); }
.menu-list { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; font-size: 15px; font-weight: 500; color: #334155; cursor: pointer; border-bottom: 1px solid #f1f5f9; transition: 0.2s; }
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: #f8fafc; }
.arrow { font-size: 18px; color: #94a3b8; font-family: monospace; }
.logout-item { color: #ef4444; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-card { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 420px; text-align: center; max-height: 90vh; overflow-y: auto; }
.modal-card h3 { margin: 0 0 10px; font-size: 22px; font-weight: bold; }
.modal-card .sub { font-size: 13px; color: #64748b; margin-bottom: 20px; }
.form-group { text-align: left; margin-bottom: 15px; flex: 1; }
.form-row { display: flex; gap: 15px; }
.form-group label { display: block; font-size: 13px; font-weight: bold; margin-bottom: 5px; color: #334155; }
.form-group input, .form-select { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
.modal-actions { display: flex; gap: 10px; margin-top: 25px; }
.modal-actions button { flex: 1; padding: 14px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer; font-size: 15px; }
.cancel { background: #f1f5f9; color: #64748b; }
.confirm.blue-btn { background: #3b82f6; color: white; }
.confirm:disabled { opacity: 0.5; cursor: not-allowed; }
.full-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; font-weight: bold; background: #3b82f6; color: white; cursor: pointer; margin-top: 15px; }
.history-list { max-height: 300px; overflow-y: auto; margin-bottom: 20px; text-align: left; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; }
.h-title { margin: 0; font-size: 15px; font-weight: bold; color: #1e293b; }
.h-time { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
.h-amount { margin: 0; font-weight: bold; font-family: monospace; }
.h-status { margin: 4px 0 0; font-size: 12px; font-weight: bold; }
.text-green { color: #10b981; }
.text-red { color: #ef4444; }
.text-orange { color: #f59e0b; }
.text-gray { color: #64748b; }
.empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
.service-box { text-align: left; background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 20px; font-size: 14px; line-height: 1.8; }
.line-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: #06C755; color: white; padding: 14px; border-radius: 12px; font-size: 16px; font-weight: bold; text-decoration: none; transition: 0.2s; }
.line-btn:hover { background: #05b04b; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.deposit-notice-card {
  margin-top: 20px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.05);
}
.notice-icon { font-size: 20px; line-height: 1.5; }
.notice-content h4 { margin: 0 0 6px 0; font-size: 14px; color: #b45309; font-weight: 800; }
.notice-content p { margin: 0; font-size: 12px; color: #78350f; line-height: 1.6; }
.notice-content strong { font-weight: 900; color: #b45309; }
</style>