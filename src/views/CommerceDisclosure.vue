<template>
  <div class="legal-page">
    <div class="legal-container">
      <header class="legal-header">
        <button class="back-btn" @click="$router.back()">‹ 戻る</button>
        <h1>特定商取引法に基づく表記</h1>
      </header>

      <main class="legal-content">
        <p class="intro">
          本ウェブサイト（以下「本サイト」といいます）における役務の提供条件等について、特定商取引に関する法律（特定商取引法）第11条に基づき、以下の通り表示いたします。本サイトは、リアルタイムの野球予想（ベッティング）サービスを提供するエンターテインメントプラットフォームです。
        </p>

        <table class="info-table">
          <tbody>
            <tr>
              <th>販売業者名（会社名）</th>
              <td>GrandSlam 運営事務局（※ダミー：実際の会社名を入力してください）</td>
            </tr>
            <tr>
              <th>代表者氏名</th>
              <td>山田 太郎（※ダミー：実際の代表者名を入力してください）</td>
            </tr>
            <tr>
              <th>所在地</th>
              <td>
                〒100-0001<br>
                東京都千代田区千代田1-1-1（※ダミー：実際のオフィス所在地を入力してください）
              </td>
            </tr>
            <tr>
              <th>電話番号</th>
              <td>
                03-1234-5678<br>
                <span class="note">※お問い合わせは原則としてメール・LINEにて受け付けております。電話での対応は行っておりません。</span>
              </td>
            </tr>
            <tr>
              <th>メールアドレス</th>
              <td>support@grandslam.cc.cd</td>
            </tr>
            <tr>
              <th>運営責任者</th>
              <td>鈴木 一郎（※ダミー：責任者名を入力してください）</td>
            </tr>
            <tr>
              <th>販売価格</th>
              <td>各競技（MLB・3A等）の予想チケット、およびサイト内ポイント購入ページに記載の金額（消費税込み）</td>
            </tr>
            <tr>
              <th>商品代金以外の必要料金</th>
              <td>
                ・インターネット接続に必要な通信料（お客様負担）<br>
                ・出金（ポイント換金）時の振込手数料（1回につき〇〇円 ※実際の規定に合わせてください）
              </td>
            </tr>
            <tr>
              <th>支払方法</th>
              <td>クレジットカード決済、各種オンラインバンキング、コンビニ決済（※実際の決済方法に合わせてください）</td>
            </tr>
            <tr>
              <th>支払時期</th>
              <td>購入時（都度払い）</td>
            </tr>
            <tr>
              <th>役務の提供時期</th>
              <td>決済完了後、直ちに予想（ベッティング）サービスをご利用いただけます。</td>
            </tr>
            <tr>
              <th>返品・キャンセルについて</th>
              <td>
                デジタルコンテンツ・役務の性質上、決済完了後の返品・キャンセル・返金は一切お受けできません。また、一度ベットした予想チケットの取り消しはできません。予めご了承ください。
              </td>
            </tr>
            <tr>
              <th>動作環境</th>
              <td>
                推奨ブラウザ：Google Chrome / Safari / Microsoft Edge の最新版<br>
                <span class="note">※一部端末・ブラウザでは正常に動作しない場合がございます。</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="footer-note">
          <p>制定日：2026年10月1日</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
// 如果需要在页面加载时设置特定的滚动位置或其他逻辑，可以在这里写
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: #0b1120; /* 与 C 端一致的暗色背景 */
  color: #cbd5e1;
  font-family: 'Noto Sans JP', sans-serif;
  padding: 20px;
}

.legal-container {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.legal-header {
  position: relative;
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-btn {
  position: absolute;
  left: 0;
  top: 5px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #fff;
}

.legal-header h1 {
  font-size: 24px;
  color: #fff;
  margin: 0;
  font-weight: 800;
}

.intro {
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 30px;
  color: #94a3b8;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  line-height: 1.6;
}

.info-table th, .info-table td {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  text-align: left;
  vertical-align: top;
}

.info-table th {
  background: rgba(255, 255, 255, 0.03);
  width: 250px;
  color: #e2e8f0;
  font-weight: bold;
}

.info-table td {
  color: #cbd5e1;
}

.note {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-top: 6px;
}

.footer-note {
  margin-top: 40px;
  text-align: right;
  font-size: 13px;
  color: #64748b;
}

@media (max-width: 768px) {
  .legal-container {
    padding: 20px;
  }
  .info-table th, .info-table td {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }
  .info-table th {
    border-bottom: none;
  }
}
</style>