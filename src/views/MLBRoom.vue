<!-- src/views/MLBRoom.vue -->
<template>
  <div class="mlb-room-layout">
    <AppHeader />

    <main class="main-content">
      <div class="room-header">
        <button class="back-btn" @click="$router.push('/')">＜ 戻る</button>
        <h2>⚾ リアルタイム予想 大厅</h2>
        <div class="balance-box">残高: {{ userBalance.toLocaleString() }} pt</div>
      </div>

      <!-- 加载状态展示 -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>データを取得中...</p>
      </div>

      <!-- 赛事列表区 -->
      <div class="games-container" v-else-if="games.length > 0">
        <div 
          v-for="game in games" 
          :key="game.game_pk" 
          class="match-card"
          @click="goToMatchRoom(game)"
        >
          <!-- 状态栏 -->
          <div class="status-bar" :class="game.status.toLowerCase()">
            <span v-if="game.status === 'Preview'">試合前 ({{ formatJST(game.game_date) }} JST)</span>
            <span v-else-if="game.status === 'Live'" class="live-text">
              <span class="live-dot"></span> 試合中 ({{ game.inning_half === 'Top' ? '表' : '裏' }} 第{{ game.current_inning }}回)
            </span>
            <span v-else-if="game.status === 'Final'">試合終了</span>
          </div>

          <!-- 对战队伍 (含队徽渲染) -->
          <div class="teams-display">
            <!-- 客队 -->
            <div class="team-row">
              <span class="team-label away-label">客</span>
              <div class="team-info">
                <div class="team-badge-box">
                  <!-- 使用组件内的状态控制，避免直接操作 DOM -->
                  <img 
                    v-if="getTeamLogo(game.away_team) && !awayImgError" 
                    :src="getTeamLogo(game.away_team)" 
                    class="team-logo-img"
                    alt="logo"
                    @error="awayImgError = true"
                  />
                  <div 
                    v-else 
                    class="team-badge-fallback" 
                    :style="{ background: getTeamColor(game.away_team) }"
                  >
                    {{ getTeamInitial(game.away_team) }}
                  </div>
                </div>
                <span class="team-name">{{ game.away_team }}</span>
              </div>
            </div>

            <div class="vs-text">VS</div>

            <!-- 主队 -->
            <div class="team-row">
              <span class="team-label home-label">主</span>
              <div class="team-info">
                <div class="team-badge-box">
                  <img 
                    v-if="getTeamLogo(game.home_team) && !homeImgError" 
                    :src="getTeamLogo(game.home_team)" 
                    class="team-logo-img"
                    alt="logo"
                    @error="homeImgError = true"
                  />
                  <div 
                    v-else 
                    class="team-badge-fallback" 
                    :style="{ background: getTeamColor(game.home_team) }"
                  >
                    {{ getTeamInitial(game.home_team) }}
                  </div>
                </div>
                <span class="team-name">{{ game.home_team }}</span>
              </div>
            </div>
          </div>

          <!-- 比分 / 比分盘口入口 -->
          <div class="score-display">
            <span class="score-text">{{ game.away_score }} - {{ game.home_score }}</span>
            <div class="action-btn">予想する ＞</div>
          </div>
        </div>
      </div>

      <!-- 确实没有数据时的展示 -->
      <div v-else class="empty-state">
        <p style="font-size: 24px; margin-bottom: 10px;">🏟️</p>
        <p>本日の試合はありません。</p>
        <p style="font-size: 13px; margin-top: 10px; color: #64748b;">
          現在、新しい試合データを取得しています。しばらくお待ちください。
        </p>
      </div>
    </main>

    <!-- 替换 alert 的高颜值日文 Toast 提示 -->
    <transition name="fade">
      <div v-if="toast.show" class="custom-toast">
        {{ toast.msg }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import request from '../api/request'; 
import AppHeader from '../components/AppHeader.vue';

const router = useRouter();
const games = ref([]);
const userBalance = ref(0);
const isLoading = ref(true); 
let pollTimer = null;

// 🆕 用于记录图片加载是否失败
const awayImgError = ref(false);
const homeImgError = ref(false);

// Toast 提示状态
const toast = reactive({ show: false, msg: '' });
const showToast = (msg) => {
  toast.msg = msg;
  toast.show = true;
  setTimeout(() => { toast.show = false; }, 2000);
};

// ==========================================
// 🎯 队徽渲染核心逻辑 (兼容英文与日文)
// ==========================================

// 1. 英文队名 -> 官方队徽链接 (MLB 官方 CDN)
const teamLogos = {
  "Syracuse Mets": "https://www.mlbstatic.com/team-logos/552.svg",
  "Scranton/Wilkes-Barre RailRiders": "https://www.mlbstatic.com/team-logos/531.svg",
  "Toledo Mud Hens": "https://www.mlbstatic.com/team-logos/533.svg",
  "Columbus Clippers": "https://www.mlbstatic.com/team-logos/534.svg",
  "Norfolk Tides": "https://www.mlbstatic.com/team-logos/550.svg",
  "Durham Bulls": "https://www.mlbstatic.com/team-logos/556.svg",
  "Lehigh Valley IronPigs": "https://www.mlbstatic.com/team-logos/541.svg",
  "Rochester Red Wings": "https://www.mlbstatic.com/team-logos/546.svg",
  "Nashville Sounds": "https://www.mlbstatic.com/team-logos/568.svg",
  "Charlotte Knights": "https://www.mlbstatic.com/team-logos/560.svg",
  "Gwinnett Stripers": "https://www.mlbstatic.com/team-logos/532.svg",
  "Jacksonville Jumbo Shrimp": "https://www.mlbstatic.com/team-logos/564.svg",
  "Buffalo Bisons": "https://www.mlbstatic.com/team-logos/542.svg",
  "Worcester Red Sox": "https://www.mlbstatic.com/team-logos/507.svg",
  "Memphis Redbirds": "https://www.mlbstatic.com/team-logos/553.svg",
  "Iowa Cubs": "https://www.mlbstatic.com/team-logos/502.svg",
  "Oklahoma City Baseball Club": "https://www.mlbstatic.com/team-logos/238.svg",
  "Sacramento River Cats": "https://www.mlbstatic.com/team-logos/257.svg",
  "Round Rock Express": "https://www.mlbstatic.com/team-logos/235.svg",
  "Salt Lake Bees": "https://www.mlbstatic.com/team-logos/236.svg",
  "Tacoma Rainiers": "https://www.mlbstatic.com/team-logos/237.svg",
  "Omaha Storm Chasers": "https://www.mlbstatic.com/team-logos/239.svg",
  "Albuquerque Isotopes": "https://www.mlbstatic.com/team-logos/240.svg",
  "El Paso Chihuahuas": "https://www.mlbstatic.com/team-logos/241.svg",
  "Reno Aces": "https://www.mlbstatic.com/team-logos/242.svg",
  "Las Vegas Aviators": "https://www.mlbstatic.com/team-logos/243.svg",
  "Sugar Land Space Cowboys": "https://www.mlbstatic.com/team-logos/244.svg",
  "St. Paul Saints": "https://www.mlbstatic.com/team-logos/245.svg",
  "Somerset Patriots": "https://www.mlbstatic.com/team-logos/1956.svg",
  "Reading Fightin Phils": "https://www.mlbstatic.com/team-logos/1961.svg",
  "Hartford Yard Goats": "https://www.mlbstatic.com/team-logos/1963.svg",
  "Portland Sea Dogs": "https://www.mlbstatic.com/team-logos/546.svg",
  "Binghamton Rumble Ponies": "https://www.mlbstatic.com/team-logos/505.svg",
  "New Hampshire Fisher Cats": "https://www.mlbstatic.com/team-logos/1962.svg",
  "Akron RubberDucks": "https://www.mlbstatic.com/team-logos/402.svg",
  "Richmond Flying Squirrels": "https://www.mlbstatic.com/team-logos/1964.svg",
  "Altoona Curve": "https://www.mlbstatic.com/team-logos/401.svg",
  "Harrisburg Senators": "https://www.mlbstatic.com/team-logos/547.svg",
  "Erie SeaWolves": "https://www.mlbstatic.com/team-logos/403.svg",
  "Bowie Baysox": "https://www.mlbstatic.com/team-logos/1965.svg"
};

// 2. 日文队名 -> 英文队名 的反向映射
const jaToEnMap = {
  "ミルウォーキー・ブルワーズ": "Milwaukee Brewers",
  "タンパベイ・レイズ": "Tampa Bay Rays",
  "ニューヨーク・ヤンキース": "New York Yankees",
  "ボストン・レッドソックス": "Boston Red Sox",
  "ロサンゼルス・ドジャース": "Los Angeles Dodgers",
  "サンフランシスコ・ジャイアンツ": "San Francisco Giants",
  "シカゴ・カブス": "Chicago Cubs",
  "シカゴ・ホワイトソックス": "Chicago White Sox",
  "ニューヨーク・メッツ": "New York Mets",
  "アトランタ・ブレーブス": "Atlanta Braves",
  "サンディエゴ・パドレス": "San Diego Padres",
  "フィラデルフィア・フィリーズ": "Philadelphia Phillies",
  "ヒューストン・アストロズ": "Houston Astros",
  "シアトル・マリナーズ": "Seattle Mariners",
  "ロサンゼルス・エンゼルス": "Los Angeles Angels",
  "オークランド・アスレチックス": "Oakland Athletics",
  "トロント・ブルージェイズ": "Toronto Blue Jays",
  "ボルチモア・オリオールズ": "Baltimore Orioles",
  "クリーブランド・ガーディアンズ": "Cleveland Guardians",
  "デトロイト・タイガース": "Detroit Tigers",
  "カンザスシティ・ロイヤルズ": "Kansas City Royals",
  "ミネソタ・ツインズ": "Minnesota Twins",
  "テキサス・レンジャーズ": "Texas Rangers",
  "セントルイス・カージナルス": "St. Louis Cardinals",
  "シンシナティ・レッズ": "Cincinnati Reds",
  "ピッツバーグ・パイレーツ": "Pittsburgh Pirates",
  "コロラド・ロッキーズ": "Colorado Rockies",
  "アリゾナ・ダイヤモンドバックス": "Arizona Diamondbacks",
  "マイアミ・マーリンズ": "Miami Marlins",
  "ワシントン・ナショナルズ": "Washington Nationals",
  "シラキュース・メッツ": "Syracuse Mets",
  "スクラントン・レイルライダース": "Scranton/Wilkes-Barre RailRiders",
  "トレド・マッドヘンズ": "Toledo Mud Hens",
  "コロンバス・クリッパーズ": "Columbus Clippers",
  "ノーフォーク・タイズ": "Norfolk Tides",
  "ダーラム・ブルズ": "Durham Bulls",
  "リーハイバレー・アイアンピッグス": "Lehigh Valley IronPigs",
  "ロチェスター・レッドウィングス": "Rochester Red Wings",
  "ナッシュビル・サウンズ": "Nashville Sounds",
  "シャーロット・ナイツ": "Charlotte Knights",
  "グウィネット・ストライパーズ": "Gwinnett Stripers",
  "ジャクソンビル・ジャンボシュリンプ": "Jacksonville Jumbo Shrimp",
  "バッファロー・バイソンズ": "Buffalo Bisons",
  "ウースター・レッドソックス": "Worcester Red Sox",
  "メンフィス・レッドバーズ": "Memphis Redbirds",
  "アイオワ・カブス": "Iowa Cubs",
  "オクラホマシティ・ベースボールクラブ": "Oklahoma City Baseball Club",
  "サクラメント・リバーキャッツ": "Sacramento River Cats",
  "ラウンドロック・エクスプレス": "Round Rock Express",
  "ソルトレイク・ビーズ": "Salt Lake Bees",
  "タコマ・レイニアーズ": "Tacoma Rainiers",
  "オマハ・ストームチェイサーズ": "Omaha Storm Chasers",
  "アルバカーキ・アイソトープス": "Albuquerque Isotopes",
  "エルパソ・チワワス": "El Paso Chihuahuas",
  "リノ・エース": "Reno Aces",
  "ラスベガス・エイビエイターズ": "Las Vegas Aviators",
  "シュガーランド・スペースカウボーイズ": "Sugar Land Space Cowboys",
  "セントポール・セインツ": "St. Paul Saints"
};

// 3. 终极获取队徽函数（兼容日英双语）
const getTeamLogo = (teamName) => {
  if (!teamName) return null;
  const englishName = jaToEnMap[teamName] || teamName;
  return teamLogos[englishName] || null;
};

// 4. 兜底：提取首字母 (支持英文转大写，日文取首字)
const getTeamInitial = (teamName) => {
  if (!teamName) return '?';
  const isEnglish = /^[A-Za-z]/.test(teamName);
  return isEnglish ? teamName.charAt(0).toUpperCase() : teamName.charAt(0);
};

// 5. 兜底：根据队名生成专属渐变色
const getTeamColor = (teamName) => {
  if (!teamName) return 'linear-gradient(135deg, #475569, #1e293b)';
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h}, 80%, 50%), hsl(${h + 30}, 80%, 30%))`;
};

// 格式化日本时间函数
const formatJST = (dateString) => {
  if (!dateString) return '--:--';
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// 获取比赛列表
const fetchGames = async () => {
  try {
    const res = await request.get('/mlb/current');
    
    if (res.data && res.data.success) {
      games.value = res.data.data;
    } else if (Array.isArray(res.data)) {
      games.value = res.data;
    } else {
      games.value = []; 
    }
    // 🆕 每次刷新列表时重置图片错误状态
    awayImgError.value = false;
    homeImgError.value = false;
    
  } catch (error) {
    console.error("取得失敗", error);
    games.value = []; 
  } finally {
    isLoading.value = false; 
  }
};

const fetchBalance = async () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return;
  try {
    const res = await request.get(`/user/info/${JSON.parse(storedUser).id}`);
    if (res.data.success) userBalance.value = res.data.user.balance;
  } catch (error) {}
};

// 进入比赛房间
const goToMatchRoom = (game) => {
  if (game.status === 'Final') {
    showToast('この試合は終了しました。');
    return;
  }
  router.push(`/mlb/room/${game.game_pk}`);
};

onMounted(() => {
  fetchGames();
  fetchBalance();
  pollTimer = setInterval(() => {
    fetchGames();
  }, 30000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
/* 沿用之前的暗黑电竞风格 */
.mlb-room-layout {
  font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
  background: #0b1120;
  min-height: 100vh;
  color: #f8fafc;
}
.main-content { max-width: 900px; margin: 0 auto; padding: 20px; }
.room-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #1e293b; }
.back-btn { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 8px 15px; border-radius: 20px; cursor: pointer; }
.back-btn:hover { background: #1e293b; color: #f8fafc; }
.room-header h2 { margin: 0; color: #ef4444; font-size: 22px; }
.balance-box { background: #1e293b; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: #fbbf24; border: 1px solid #334155; }

/* 加载动画样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #64748b;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(239, 68, 68, 0.2);
  border-top-color: #ef4444;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.games-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.match-card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; cursor: pointer; transition: all 0.2s; overflow: hidden; }
.match-card:hover { transform: translateY(-5px); border-color: #ef4444; box-shadow: 0 10px 20px rgba(239,68,68,0.15); }

.status-bar { background: #334155; padding: 8px; text-align: center; font-size: 12px; font-weight: bold; color: #cbd5e1; }
.status-bar.live { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.live-text { display: flex; align-items: center; justify-content: center; gap: 6px; }
.live-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulse-dot 1s infinite alternate; }
@keyframes pulse-dot { 0% { opacity: 1; } 100% { opacity: 0.3; } }

/* 队伍展示区排版 */
.teams-display { padding: 15px; display: flex; flex-direction: column; align-items: center; gap: 10px; background: #0f172a; }
.team-row { display: flex; align-items: center; width: 100%; gap: 10px; font-size: 15px; font-weight: bold; }
.team-label { font-size: 11px; padding: 2px 6px; border-radius: 4px; flex-shrink: 0; }
.away-label { background: #3b82f6; color: white; }
.home-label { background: #ef4444; color: white; }

/* 队伍信息容器 (队徽 + 队名) */
.team-info { display: flex; align-items: center; gap: 10px; flex: 1; }

/* 队徽外框 */
.team-badge-box {
  width: 34px; 
  height: 34px; 
  background: rgba(255, 255, 255, 0.05); 
  border: 1px solid rgba(255,255,255,0.1); 
  border-radius: 8px; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  flex-shrink: 0;
}
/* 官方队徽图片 */
.team-logo-img {
  width: 26px; 
  height: 26px; 
  object-fit: contain; 
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
}
/* 兜底：首字母渐变色徽章 */
.team-badge-fallback {
  width: 100%; 
  height: 100%; 
  border-radius: 6px; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  color: white; 
  font-size: 16px; 
  font-weight: 900; 
  font-family: 'Arial Black', sans-serif;
}

.team-name { flex: 1; text-align: left; padding-left: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-text { font-size: 12px; color: #64748b; font-weight: bold; }

.score-display { padding: 15px; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #334155; }
.score-text { font-size: 20px; font-weight: bold; color: #fbbf24; }
.action-btn { background: #ef4444; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; }

.empty-state { text-align: center; padding: 50px; color: #64748b; background: #1e293b; border-radius: 12px; border: 1px dashed #334155; }

/* Toast 提示样式 */
.custom-toast {
  position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
  padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold;
  z-index: 10000; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  background: #ef4444; color: white; text-align: center; pointer-events: none;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, -20px); }

@media (max-width: 768px) {
  .games-container { grid-template-columns: 1fr; }
}
</style>