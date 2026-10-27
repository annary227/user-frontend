<template>
  <div class="social-chat-page">
    <!-- 顶部导航 -->
    <header class="chat-header">
      <button class="back-btn" @click="$router.push('/')">‹ ロビーに戻る</button>
      <h2>メッセージ (私聊)</h2>
      <div style="width: 60px;"></div>
    </header>

    <!-- 主列表区域 -->
    <div class="chat-content" v-show="!activeChatUser">
      <!-- 搜索框 -->
      <div class="search-box">
        <input v-model="searchKeyword" type="text" placeholder="ユーザー名で検索..." @input="handleSearch" />
        <span class="search-icon">🔍</span>
      </div>

      <!-- 用户列表 -->
      <div class="user-list">
        <div class="list-title" v-if="!searchKeyword">
          <span class="status-dot"></span> オンラインユーザー ({{ onlineUsers.length }})
        </div>
        <div class="list-title" v-else>検索結果</div>

        <div v-if="displayUsers.length === 0" class="empty-text">
          <span style="font-size: 40px; display: block; margin-bottom: 10px;">👤</span>
          ユーザーが見つかりません
        </div>

        <div 
          v-for="user in displayUsers" 
          :key="user.id" 
          class="user-item"
          @click="openChat(user)"
        >
          <!-- 头像 -->
          <div class="avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
          
          <div class="user-info">
            <span class="name">{{ user.username }}</span>
            <!-- 伪造的在线状态 -->
            <span class="status">
              <span class="status-dot green"></span> オンライン
            </span>
          </div>
          
          <div class="chat-icon">💬</div>
        </div>
      </div>
    </div>

    <!-- 私聊窗口 (点开后覆盖列表) -->
    <div class="chat-window" v-show="activeChatUser">
      <!-- 窗口头部 -->
      <div class="window-header">
        <button class="back-btn" @click="closeChat">‹ 戻る</button>
        <span>{{ activeChatUser?.username }} とのチャット</span>
      </div>
      
      <!-- 聊天记录区 -->
      <div class="window-body" ref="chatBody">
        <div class="security-warning">
          ⚠️ 外部サイトへの誘導や、現金・口座情報のやり取りは禁止されています。違反した場合、アカウントが凍結されます。
        </div>

        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="message-row" 
          :class="{ 'is-me': msg.sender_id === myId }"
        >
          <div class="bubble">{{ msg.content }}</div>
        </div>
      </div>

      <!-- 发送框 -->
      <div class="window-footer">
        <input 
          v-model="newMessage" 
          type="text" 
          placeholder="メッセージを入力..." 
          @keyup.enter="sendMessage" 
        />
        <button @click="sendMessage" :disabled="!newMessage.trim()">送信</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request';
import { ElMessage } from 'element-plus';

const router = useRouter();

const myId = ref(null);
const onlineUsers = ref([]);
const searchResults = ref([]);
const searchKeyword = ref('');
const activeChatUser = ref(null);
const messages = ref([]);
const newMessage = ref('');
const chatBody = ref(null);
let pollTimer = null; // 🆕 定时拉取消息定时器

// 获取本地用户ID并加载列表
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return router.push('/login');
  
  myId.value = user.id;
  fetchOnlineUsers();
});

// 组件销毁时清理定时器
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});

// 获取在线假人和真实用户
const fetchOnlineUsers = async () => {
  try {
    const res = await request.get(`/user/social/online-users/${myId.value}`);
    if (res.data.success) onlineUsers.value = res.data.users;
  } catch (e) {
    console.error(e);
    ElMessage.error('ユーザーリストの取得に失敗しました');
  }
};

// 搜索防抖
let searchTimer = null;
const handleSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    if (!searchKeyword.value.trim()) {
      searchResults.value = [];
      return;
    }
    try {
      const res = await request.get(`/user/social/search`, {
        params: { myId: myId.value, keyword: searchKeyword.value }
      });
      if (res.data.success) searchResults.value = res.data.users;
    } catch (e) {
      console.error(e);
    }
  }, 500);
};

// 根据是否有搜索词决定显示列表
const displayUsers = computed(() => {
  return searchKeyword.value.trim() ? searchResults.value : onlineUsers.value;
});

// 打开聊天窗口
const openChat = async (user) => {
  activeChatUser.value = user;
  messages.value = []; // 清空上一段记录
  await fetchChatHistory(user.id);
  
  // 🆕 核心修复：每 3 秒自动拉取一次最新消息，解决收不到消息的问题
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    if (activeChatUser.value) {
      fetchChatHistory(activeChatUser.value.id);
    }
  }, 3000);
};

// 关闭聊天窗口
const closeChat = () => {
  activeChatUser.value = null;
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
};

// 获取聊天记录
const fetchChatHistory = async (targetId) => {
  try {
    const res = await request.get(`/user/chat/player/history/${myId.value}/${targetId}`);
    if (res.data.success) {
      // 比对旧数据，如果长度不同才重新渲染并滚动到底部
      if (messages.value.length !== res.data.messages.length) {
        messages.value = res.data.messages;
        scrollToBottom();
      }
    }
  } catch (e) {
    console.error(e);
  }
};

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeChatUser.value) return;
  const text = newMessage.value;
  newMessage.value = '';

  // 前端先乐观更新，让用户感觉秒发
  const tempId = Date.now();
  messages.value.push({ id: tempId, sender_id: myId.value, content: text });
  scrollToBottom();

  try {
    await request.post('/user/chat/player/send', {
      senderId: myId.value,
      receiverId: activeChatUser.value.id,
      content: text
    });
    
    // 发送成功后立刻拉取一次，不用等3秒轮询
    fetchChatHistory(activeChatUser.value.id);

  } catch (error) {
    ElMessage.error(error.response?.data?.error || '送信に失敗しました');
    // 如果发送失败（例如触发了风控），把刚才发的那条撤回
    messages.value.pop();
  }
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight;
  });
};
</script>

<style scoped>
/* 全局页面底色 (配合你的极光暗黑风) */
.social-chat-page { min-height: 100vh; background: #0f172a; color: white; font-family: 'Noto Sans JP', sans-serif; display: flex; flex-direction: column; }

/* 顶部导航 */
.chat-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: #1e293b; border-bottom: 1px solid #334155; }
.chat-header h2 { margin: 0; font-size: 18px; font-weight: 900; }
.back-btn { background: rgba(255,255,255,0.05); border: 1px solid #334155; color: #cbd5e1; font-size: 14px; cursor: pointer; padding: 6px 12px; border-radius: 20px; transition: 0.2s; }
.back-btn:hover { color: white; background: #334155; }

/* 列表内容区 */
.chat-content { flex: 1; display: flex; flex-direction: column; max-width: 600px; margin: 0 auto; width: 100%; padding: 20px; }

/* 搜索框 */
.search-box { position: relative; margin-bottom: 20px; }
.search-box input { width: 100%; padding: 14px 20px 14px 45px; background: #1e293b; border: 1px solid #334155; border-radius: 30px; color: white; font-size: 15px; outline: none; box-sizing: border-box; transition: 0.3s; }
.search-box input:focus { border-color: #e83862; box-shadow: 0 0 0 3px rgba(232, 56, 98, 0.2); }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 16px; }

/* 用户列表 */
.user-list { flex: 1; overflow-y: auto; padding-bottom: 20px; }
.list-title { font-size: 13px; color: #94a3b8; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
.status-dot { width: 8px; height: 8px; background: #94a3b8; border-radius: 50%; display: inline-block; }
.status-dot.green { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }

.user-item { display: flex; align-items: center; gap: 15px; padding: 15px; background: #1e293b; border-radius: 12px; margin-bottom: 10px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
.user-item:hover { border-color: #e83862; background: #2a3a52; transform: translateX(5px); }
.avatar { width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, #e83862, #f43f5e); display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 20px; box-shadow: 0 5px 10px rgba(232, 56, 98, 0.3); }
.user-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.user-info .name { font-weight: bold; font-size: 16px; }
.user-info .status { font-size: 12px; color: #10b981; display: flex; align-items: center; gap: 4px; }
.chat-icon { font-size: 22px; opacity: 0.7; }
.empty-text { text-align: center; color: #64748b; margin-top: 60px; font-size: 14px; }

/* 聊天窗口 (全屏浮层) */
.chat-window { flex: 1; display: flex; flex-direction: column; background: #0f172a; position: fixed; inset: 0; z-index: 100; max-width: 600px; margin: 0 auto; left: 50%; transform: translateX(-50%); box-shadow: 0 0 50px rgba(0,0,0,0.5); }
.window-header { padding: 15px 20px; background: #1e293b; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #334155; font-weight: bold; font-size: 16px; }
.window-body { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
.security-warning { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #fca5a5; font-size: 12px; padding: 10px; border-radius: 8px; line-height: 1.5; text-align: center; }

/* 气泡样式 */
.message-row { display: flex; }
.message-row.is-me { justify-content: flex-end; }
.bubble { max-width: 80%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; word-break: break-all; }
.is-me .bubble { background: #e83862; color: white; border-bottom-right-radius: 4px; }
.message-row:not(.is-me) .bubble { background: #334155; color: white; border-bottom-left-radius: 4px; }

/* 发送框 */
.window-footer { padding: 15px 20px; background: #1e293b; display: flex; gap: 10px; border-top: 1px solid #334155; }
.window-footer input { flex: 1; padding: 12px 18px; background: #0f172a; border: 1px solid #334155; border-radius: 25px; color: white; outline: none; font-size: 15px; }
.window-footer input:focus { border-color: #e83862; }
.window-footer button { background: #e83862; color: white; border: none; padding: 0 25px; border-radius: 25px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.window-footer button:hover:not(:disabled) { background: #f43f5e; transform: scale(1.05); }
.window-footer button:disabled { background: #64748b; cursor: not-allowed; }

/* 手机端适配 */
@media (max-width: 600px) {
  .chat-content { padding: 15px; }
  .window-footer { padding: 12px 15px; }
}
</style>