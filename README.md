# 無線電情報白板系統 (Radio Intel Board)

聯訓計畫組專用即時情報白板，支援 AI 自動解析無線電內容、拖拉排序、多人即時協作。

## 快速啟動（本機開發）

### 前置需求
- Python 3.11+
- Node.js 18+
- PostgreSQL（或使用 Docker）

### 1. 啟動資料庫（Docker）
```bash
docker run -d --name rib-pg \
  -e POSTGRES_DB=radio_intel_board \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16
```

### 2. 啟動後端
```bash
cd backend
cp .env.example .env
# 編輯 .env，填入 GEMINI_API_KEY 與 ACCESS_PASSWORD
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. 啟動前端
```bash
cd frontend
npm install
npm run dev
```

開啟 http://localhost:5173

---

## 部署至 Railway

1. 建立 Railway 專案，加入 PostgreSQL 服務
2. 設定環境變數：`GEMINI_API_KEY`、`ACCESS_PASSWORD`、`JWT_SECRET`
3. `DATABASE_URL` 由 Railway 自動注入
4. 建構指令：
   ```bash
   cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
   ```
5. 啟動指令：`uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 環境變數

| 變數名稱 | 說明 |
|---|---|
| `DATABASE_URL` | PostgreSQL 連線字串 |
| `GEMINI_API_KEY` | Google Gemini API 金鑰 |
| `ACCESS_PASSWORD` | 系統存取密碼 |
| `JWT_SECRET` | JWT 簽署密鑰（請設為隨機長字串） |
| `PORT` | 服務埠號（預設 8000） |
