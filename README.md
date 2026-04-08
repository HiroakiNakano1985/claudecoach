# ClaudeCoach

**Claude Codeのトークン使用量を可視化し、改善提案を行うローカルダッシュボード**

**A local dashboard that visualizes Claude Code token usage and provides optimization suggestions**

---

## Features / 機能

- **Token Usage Dashboard** / トークン使用量ダッシュボード
  - Weekly token trend chart / 週次トレンドグラフ
  - Per-project cost breakdown / プロジェクト別コスト内訳
- **Plan ROI Calculation** / プランROI計算
  - Auto-detects your plan (Pro / Max 5x / Max 20x / API) / プラン自動検出
  - Shows API-equivalent cost and ROI ratio / API換算コスト・ROI倍率表示
- **Privacy-First** / プライバシー重視
  - Runs entirely on localhost / 完全ローカル動作
  - Only extracts metadata (token counts, timestamps) — never stores conversation content / メタデータのみ抽出、会話内容は一切保存しません

## Screenshots / スクリーンショット

*Coming soon*

## Tech Stack / 技術スタック

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.10+ / FastAPI / JSON Database |
| Frontend | Next.js 14 / Tailwind CSS / shadcn/ui / Recharts |
| CLI | Python (`claudecoach ingest`) |

## Getting Started / セットアップ

### Prerequisites / 前提条件

- Python 3.10+
- Node.js 18+
- Claude Code installed (`~/.claude/projects/` directory exists)

### Installation / インストール

```bash
git clone https://github.com/HiroakiNakano1985/claudecoach.git
cd claudecoach
bash setup.sh
```

### Configuration / 設定

Edit `.env` if needed / 必要に応じて`.env`を編集:

`.env` is auto-created by `setup.sh` from `.env.example`.
`setup.sh`が`.env.example`から`.env`を自動作成します。

Edit `.env` as needed / 必要に応じて`.env`を編集:

```env
CLAUDE_PROJECTS_PATH=~/.claude/projects   # Path to Claude Code logs
CLAUDE_PLAN=auto                           # auto / pro / max_5x / max_20x / api
```

### Running / 起動

```bash
# 1. Ingest Claude Code logs / ログデータ取込
claudecoach ingest
# or: python -m agent.cli ingest

# 2. Start backend / バックエンド起動
uvicorn server.main:app --reload --port 8000

# 3. Start frontend / フロントエンド起動
cd web && npm run dev

# 4. Open browser / ブラウザで開く
# → http://localhost:3000
```

## Project Structure / ディレクトリ構成

```
claudecoach/
├── agent/              # CLI & JSONL parser / CLIとログパーサー
│   ├── cli.py
│   └── parser.py
├── server/             # FastAPI backend / バックエンドAPI
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routers/
│   └── services/
│       └── plan_service.py   # Plan detection & ROI / プラン検出・ROI計算
└── web/                # Next.js frontend / フロントエンド
    └── src/
        ├── app/
        ├── components/
        └── lib/
```

## API Endpoints / APIエンドポイント

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | Dashboard summary with ROI / ダッシュボードサマリー |
| GET | `/api/roi` | ROI calculation / ROI計算 |
| GET | `/api/plan` | Plan auto-detection / プラン自動検出 |
| GET | `/api/sessions` | Session list / セッション一覧 |
| GET | `/api/sessions/{id}` | Session detail / セッション詳細 |
| POST | `/api/sessions/ingest` | Ingest session data / セッションデータ取込 |

## Roadmap / ロードマップ

- [x] **Phase 1**: Data ingestion, dashboard, plan detection & ROI
- [ ] **Phase 2**: Pattern analysis, Haiku-powered improvement suggestions
- [ ] **Phase 3**: File watcher (auto-ingest), subscription & deployment

## License / ライセンス

MIT
