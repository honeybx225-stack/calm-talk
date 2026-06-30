# Calm Talk

兩人即時聊天中的 AI 調解員。兩人在共用的對話室裡聊天，AI 在背景監看語氣，當對話開始升溫、出現指責或可能被誤解時才介入，幫忙把話重新表達清楚，或建議先暫停冷靜一下。

## 架構

- `server/`：Node.js + Express + Socket.io，管理對話室與即時訊息，每則訊息會送給 Claude 分析是否需要介入。
- `client/`：React + Vite 網頁前端，建立/加入對話室並即時收發訊息。

AI 介入邏輯：每則使用者訊息送出後，後端把最近的對話紀錄交給 Claude 判斷，回傳是否需要介入（`reframe` 重新表達 / `pause` 建議暫停 / `clarify` 釐清誤解）。大部分時候 AI 應保持沉默，只有偵測到指責語氣、人身攻擊或明顯誤解時才會在對話中插入一則「AI 調解員」訊息。

## 本機開發

### 1. 啟動後端

```bash
cd server
cp .env.example .env   # 填入 ANTHROPIC_API_KEY
npm install
npm run dev
```

### 2. 啟動前端

```bash
cd client
npm install
npm run dev
```

開啟瀏覽器訪問 Vite 顯示的網址，點「建立新對話」會產生一個邀請連結，把連結傳給另一半即可一起加入同一個對話室。

## Roadmap

- [ ] 對話紀錄持久化（目前訊息只存在記憶體中，重啟伺服器會清空）
- [ ] 使用者驗證與身份綁定（目前只用暱稱辨識，未防止假冒）
- [ ] 行動裝置 PWA 化
- [ ] 串接 LINE Bot（先做官方帳號 + Webhook，作為次要入口）
- [ ] 調解風格客製化（例如選擇較溫和 / 較直接的介入方式）

## 已知限制

- WhatsApp / WeChat 官方 API 對「第三方即時介入私訊內容」限制極嚴，短期內不在規劃範圍內，建議先把核心調解邏輯在獨立 App 上打磨成熟。
