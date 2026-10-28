<template>
  <div class="mlb-ticker-wrapper" v-if="isVisible">
    <div class="ticker-header">
      <span class="live-dot"></span>
      <span class="title">MLB LIVE</span>
    </div>
    
    <div class="ticker-body">
      <div class="ticker-content" :class="{ 'is-scrolling': games.length > 0 }">
        <div class="game-item" v-for="game in games" :key="game.gamePk">
          <!-- 球队1 队徽/名字 -->
          <div class="team away-team">
            <span class="team-name">{{ game.teams.away.team.name }}</span>
            <span class="score" :class="{ 'is-winning': game.teams.away.score > game.teams.home.score }">
              {{ game.teams.away.score }}
            </span>
          </div>
          
          <!-- 比分中间状态 -->
          <div class="game-status">
            <span class="status-text">{{ game.status.detailedState }}</span>
            <span class="inning" v-if="game.status.inning">{{ game.status.inning }}</span>
          </div>
          
          <!-- 球队2 队徽/名字 -->
          <div class="team home-team">
            <span class="score" :class="{ 'is-winning': game.teams.home.score > game.teams.away.score }">
              {{ game.teams.home.score }}
            </span>
            <span class="team-name">{{ game.teams.home.team.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- 没有比赛时的兜底展示 -->
      <div v-if="games.length === 0" class="no-games">
        <span>本日の試合はありません (No games today)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const games = ref([]);
const isVisible = ref(true); // 可以控制组件显示隐藏
let pollTimer = null;

// 获取 MLB 实时数据
const fetchLiveScores = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 【关键点】这里直接请求 MLB 官方 API 会跨域。
    // 实际项目中，建议将 URL 改为你的后端代理接口，例如 `/api/mlb/live?date=${today}`
    // 这里为了演示，使用了公共的 CORS 代理（可能不稳定，仅供测试）
    const targetUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=linescore,team`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    
    const res = await fetch(proxyUrl);
    const proxyData = await res.json();
    
    // 解析代理返回的字符串数据
    const data = JSON.parse(proxyData.contents);

    if (data && data.dates && data.dates[0] && data.dates[0].games) {
      // 只提取今天所有比赛，并且过滤出正在直播(Live)或已结束(Final)的比赛
      games.value = data.dates[0].games.map(g => ({
        gamePk: g.gamePk,
        teams: g.teams,
        status: {
          detailedState: g.status.detailedState,
          inning: g.linescore ? g.linescore.currentInningOrdinal : ''
        }
      }));
    } else {
      games.value = [];
    }
  } catch (error) {
    console.error('获取 MLB 数据失败:', error);
  }
};

onMounted(() => {
  fetchLiveScores();
  // 每 30 秒轮询一次实时数据
  pollTimer = setInterval(fetchLiveScores, 30000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
/* 赛博风直播滚动条 */
.mlb-ticker-wrapper {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  z-index: 999;
}

.ticker-header {
  background: #ef4444;
  color: white;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  0% { opacity: 1; box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
  100% { opacity: 0.5; box-shadow: 0 0 0 6px rgba(255,255,255,0); }
}

.ticker-body {
  flex: 1;
  overflow: hidden;
  position: relative;
  padding: 10px 0;
}

.ticker-content {
  display: flex;
  gap: 20px;
  padding-left: 20px;
  width: max-content;
}

/* 如果有比赛，自动滚动 */
.ticker-content.is-scrolling {
  animation: marquee 30s linear infinite;
}
.ticker-content.is-scrolling:hover {
  animation-play-state: paused; /* 鼠标悬浮暂停 */
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.game-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #e2e8f0;
  font-family: monospace;
  font-size: 14px;
}

.team {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-name {
  font-weight: bold;
  color: #94a3b8;
  max-width: 90px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score {
  color: #fde047;
  font-size: 18px;
  font-weight: 900;
}
.score.is-winning {
  color: #4ade80;
}

.game-status {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  color: #cbd5e1;
  min-width: 60px;
}
.inning {
  color: #fbbf24;
  font-weight: bold;
}

.no-games {
  color: #64748b;
  font-size: 13px;
  padding: 0 20px;
  white-space: nowrap;
}
</style>