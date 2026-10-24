<template>
  <div class="banner">
    <div class="banner-left">
      <span class="highlight-badge">最高当せん金 5,000万円！</span>
      <h2>待ち時間なし！購入した瞬間に結果がわかる！</h2>
      <p>選んで・買って・すぐ挑戦！スキップ機能で一括抽選も対応。</p>
    </div>
    <button class="banner-btn">今すぐチャレンジ ↓</button>
  </div>
</template>

<style scoped>
.banner {
  background: linear-gradient(90deg, #e83862 0%, #ff8c00 100%);
  border-radius: 12px; padding: 25px 30px; display: flex; justify-content: space-between; align-items: center; color: white; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(232, 56, 98, 0.2);
}
.banner-left { flex: 1; }
.highlight-badge { background: #ffcc00; color: #333; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 10px; }
.banner h2 { margin: 0 0 5px; font-size: 20px; }
.banner p { margin: 0; font-size: 14px; opacity: 0.9; }
.banner-btn { background: white; color: #e83862; border: none; padding: 12px 25px; border-radius: 25px; font-weight: bold; font-size: 14px; cursor: pointer; white-space: nowrap; }

@media (max-width: 768px) {
  .banner { flex-direction: column; text-align: center; gap: 15px; }
}
</style>