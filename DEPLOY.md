# 部署到網路上（手機可用）

這個專案已經設定成單一服務部署：伺服器在正式環境會直接 serve 前端打包後的檔案，所以只需要部署一個服務、一個網址。以下用 [Render](https://render.com) 的免費方案示範（不需要信用卡）。

## 步驟

1. 註冊/登入 https://dashboard.render.com，用 GitHub 帳號登入即可。
2. 點 **New** → **Web Service**。
3. 選擇 `honeybx225-stack/calm-talk` 這個 repo（需要先在 Render 授權存取你的 GitHub）。
4. 設定：
   - **Name**：`calm-talk`（或你喜歡的名字）
   - **Region**：選離你最近的（例如 Singapore）
   - **Branch**：`main`
   - **Runtime**：Node
   - **Build Command**：`npm run build`
   - **Start Command**：`npm start`
   - **Plan**：Free
5. 在 **Environment Variables** 加入一個變數：
   - Key: `ANTHROPIC_API_KEY`
   - Value: 你自己的 Anthropic API key（不要 commit 進 repo，只在這裡填）
6. 點 **Create Web Service**，等待部署完成（第一次大概 2-5 分鐘）。
7. 部署完成後會得到一個網址，例如 `https://calm-talk-xxxx.onrender.com`，手機瀏覽器直接打開這個網址就能用，建立對話室後把連結傳給男友，他在自己手機打開同一個連結加入即可。

## 加到手機主畫面（像 App 一樣）

- **iPhone (Safari)**：打開網址 → 點分享 → 「加入主畫面」
- **Android (Chrome)**：打開網址 → 右上角選單 → 「加到主畫面」/「安裝應用程式」

## 注意事項

- Render 免費方案閒置一段時間會休眠，下次打開網址時第一次連線可能要等個 10-30 秒喚醒，這是免費方案的限制，之後若想要更穩定可以升級付費方案。
- 目前訊息存在伺服器記憶體，服務重啟（例如休眠後再啟動）會清空歷史訊息，這是已知限制（見 README Roadmap）。
- 如果之後想用其他平台（Railway、Fly.io、自己的 VPS 等）部署，流程大同小異：Build Command 用 `npm run build`、Start Command 用 `npm start`，並設定 `ANTHROPIC_API_KEY` 環境變數即可。
