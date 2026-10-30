<!-- src/views/Agent.vue -->
<template>
  <div class="agent-page">
    <header class="agent-header">
      <h2>👑 代理パートナーセンター</h2>
      <button class="logout-btn" @click="logout">ログアウト</button>
    </header>

    <div class="dashboard" v-if="agentData">
      <!-- 数据卡片 -->
      <div class="card-group">
        <div class="data-card highlight">
          <span class="label">総獲得コミッション</span>
          <span class="value">¥{{ Number(agentData.agentBalance).toLocaleString() }}</span>
        </div>
        <div class="data-card">
          <span class="label">紹介したプレイヤー</span>
          <span class="value">{{ agentData.totalSubordinates }} 人</span>
        </div>
      </div>

      <!-- 专属推广链接 -->
      <div class="link-box">
        <h3>あなたの専用招待リンク</h3>
        <div class="input-group">
          <input type="text" readonly :value="inviteLink" ref="linkInput" />
          <button @click="copyLink">コピー</button>
        </div>
        <p class="tip">※このリンクから登録したユーザーのベット額の1%が自動的にあなたの報酬になります。</p>
      </div>

      <!-- 下级列表 -->
      <div class="table-box">
        <h3>紹介したプレイヤー一覧</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>ユーザー名</th>
              <th>登録日</th>
              <th>総ベット額</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="agentData.subList.length === 0">
              <td colspan="4" style="text-align: center;">まだ紹介したユーザーはいません</td>
            </tr>
            <tr v-for="sub in agentData.subList" :key="sub.id">
              <td>#{{ sub.id }}</td>
              <td>{{ sub.username }}</td>
              <td>{{ formatTime(sub.created_at) }}</td>
              <td class="text-green">¥{{ Number(sub.total_bet).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="loading">データ読み込み中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request';

const router = useRouter();
const agentData = ref(null);
const linkInput = ref(null);

const userInfo = JSON.parse(localStorage.getItem('user'));
const agentId = userInfo ? userInfo.id : null;

// 生成专属链接 (自动获取当前域名)
const inviteLink = computed(() => {
  const domain = window.location.origin;
  return `${domain}/register?ref=${agentId}`;
});

const fetchData = async () => {
  if (!agentId) return router.push('/login');
  try {
    const res = await request.get(`/user/agent/dashboard/${agentId}`);
    if (res.data.success) {
      agentData.value = res.data;
    }
  } catch (error) {
    alert(error.response?.data?.error || 'データ取得に失敗しました');
    router.push('/');
  }
};

const copyLink = () => {
  linkInput.value.select();
  document.execCommand('copy');
  alert('専用リンクをコピーしました！');
};

const logout = () => {
  localStorage.removeItem('user');
  router.push('/login');
};

const formatTime = (t) => {
  if (!t) return '';
  const d = new Date(t);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 暗黑高级风格 */
.agent-page { min-height: 100vh; background: #0f172a; color: #f8fafc; font-family: 'Noto Sans JP', sans-serif; padding: 20px; }
.agent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #334155; padding-bottom: 15px; }
.agent-header h2 { margin: 0; color: #fbbf24; }
.logout-btn { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.dashboard { max-width: 800px; margin: 0 auto; }
.card-group { display: flex; gap: 20px; margin-bottom: 30px; }
.data-card { flex: 1; background: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; display: flex; flex-direction: column; gap: 10px; }
.data-card.highlight { border-color: #fbbf24; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); box-shadow: 0 0 20px rgba(251, 191, 36, 0.1); }
.data-card .label { font-size: 14px; color: #94a3b8; font-weight: bold; }
.data-card .value { font-size: 32px; font-weight: 900; color: #fbbf24; }
.link-box { background: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 30px; }
.link-box h3 { margin: 0 0 15px; font-size: 18px; color: #38bdf8; }
.input-group { display: flex; gap: 10px; margin-bottom: 10px; }
.input-group input { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-weight: bold; font-size: 16px; outline: none; }
.input-group button { background: #fbbf24; color: #0f172a; border: none; padding: 0 25px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.2s; }
.input-group button:hover { background: #fcd34d; transform: scale(1.05); }
.tip { font-size: 13px; color: #64748b; margin: 0; }
.table-box { background: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; }
.table-box h3 { margin: 0 0 15px; font-size: 18px; color: #38bdf8; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 12px; border-bottom: 1px solid #334155; font-size: 14px; }
th { color: #94a3b8; font-weight: bold; }
.text-green { color: #10b981; font-weight: bold; }
.loading { text-align: center; margin-top: 100px; font-size: 18px; color: #64748b; }
</style>