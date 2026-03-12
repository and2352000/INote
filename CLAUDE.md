# Note Project — CLAUDE.md

## 專案概述

Next.js 15+ 靜態筆記知識庫，從 Hugo 遷移而來。解決 Hugo live reload 導致瀏覽器 web terminal 斷線問題，改用 `router.refresh()` 局部更新。

## 技術棧

- **框架**: Next.js 16+ (App Router, SSG)
- **Markdown (SSR)**: `next-mdx-remote` v6 (RSC)
- **Markdown (編輯預覽)**: `react-markdown` v10 + `remark-gfm`
- **Front matter**: `gray-matter`
- **樣式**: CSS Modules / 純 CSS（沿用原 Hugo CSS Variables 設計）
- **File watcher**: `chokidar` + `ws` WebSocket server（透過 `tsx` 執行）
- **語言**: TypeScript, zh-TW

## 目錄結構

```
note-next/
├── app/
│   ├── layout.tsx              # 全站 layout，含 Sidebar + FileWatcher
│   ├── page.tsx                # 首頁（分類列表）
│   ├── [category]/
│   │   ├── page.tsx            # 分類文章列表頁
│   │   └── [slug]/
│   │       └── page.tsx        # 文章頁（SSR MDX，傳 rawContent 給 ArticleClient）
│   └── api/
│       ├── revalidate/route.ts  # on-demand revalidation
│       ├── save/route.ts        # 儲存 markdown 至磁碟（POST { filePath, content }）
│       ├── new-category/route.ts# 新增分類（POST { name, title, description }）
│       ├── new-article/route.ts # 新增文章（POST { category, slug, title }）
│       └── search/route.ts      # 搜尋 API
├── components/
│   ├── Sidebar.tsx             # 側欄導覽（折疊、active state、新增分類/文章入口）
│   ├── Search.tsx              # 搜尋框（debounce, /api/search）
│   ├── ThemeToggle.tsx         # 深色模式切換
│   ├── TerminalPanel.tsx       # AI Terminal 滑入面板（iframe ttyd）
│   ├── Topbar.tsx              # 頂部欄（breadcrumb、actions）
│   ├── ArticleClient.tsx       # 文章頁 client wrapper（管理 view/edit 模式切換）
│   ├── MarkdownEditor.tsx      # 分割畫面 Markdown 編輯器（textarea + react-markdown 預覽）
│   ├── CreationModal.tsx       # 新增分類 / 新增文章 modal（slug 自動從標題生成）
│   └── FileWatcher.tsx         # 掛載 useFileWatch hook 的 client component
├── hooks/
│   └── useFileWatch.ts         # WebSocket 監聽 → router.refresh()
├── lib/
│   ├── posts.ts                # 讀取、解析 content/ 工具函式
│   └── filePathToRoute.ts      # 檔案路徑 → Next.js route 轉換
├── content/                    # 筆記內容 (Markdown)
│   ├── dev/                    # 開發筆記
│   ├── ecommerce/              # 電商筆記
│   ├── investment/             # 投資筆記
│   └── life/                   # 生活記錄
├── styles/
│   └── main.css                # 全部樣式（CSS Variables，深色模式）
├── watcher.ts                  # 獨立 Node process：chokidar + WebSocket server
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 常用指令

```bash
# 開發模式（同時啟動 Next.js + file watcher）
npm run dev

# 建置
npm run build

# 生產啟動
npm start
```

## 新增筆記分類

在 `content/` 下建立新資料夾並加入 `_index.md`：

```bash
mkdir content/new-category
cat > content/new-category/_index.md << 'EOF'
---
title: "分類名稱"
description: "分類說明"
---
EOF
```

分類會自動出現在首頁與側欄，無需額外設定。

如需自訂分類 icon，在以下檔案加入對應 key：
- [app/page.tsx](app/page.tsx) 的 `CATEGORY_ICONS`
- [components/Sidebar.tsx](components/Sidebar.tsx) 的 `CATEGORY_ICONS`

## 即時更新機制

```
修改 content/**/*.md
  → chokidar 偵測變更（watcher.ts）
  → POST /api/revalidate { path }  → revalidatePath()
  → WebSocket 推送 { path } 給瀏覽器
  → useFileWatch 比對 pathname，符合則 router.refresh()
  → 頁面資料更新，不全頁刷新，web terminal 不斷線
```

WebSocket server 端口：`3001`
ttyd terminal 端口：`7681`

## 自訂樣式

- **CSS 變數**: [styles/main.css](styles/main.css) `:root` 區塊
- **深色模式**: `[data-theme="dark"]` selector（透過 ThemeToggle 切換）
- **主題狀態持久化**: `localStorage.theme`
- **Sidebar 折疊狀態**: `localStorage.sidebar-collapsed`

## Front Matter 格式

```yaml
---
title: "筆記標題"
date: 2026-03-11
tags: ["tag1", "tag2"]
description: "簡短說明（列表頁顯示）"
draft: false
---
```

## 網頁內 Markdown 編輯

文章頁 Topbar 有 ✏️ 編輯 / 👁 閱讀 切換按鈕：

- **閱讀模式**：顯示 SSR 渲染的 MDX（zero client JS）
- **編輯模式**：分割畫面
  - 左側：monospace textarea，內容為完整原始檔案（含 front matter）
  - 右側：`react-markdown` 即時預覽
  - 停止輸入 1.5 秒後自動 debounce 儲存 → `POST /api/save`
  - 儲存後 chokidar 偵測變更 → revalidate → 切回閱讀模式即反映最新內容

`/api/save` 安全限制：filePath 必須在 `content/` 目錄內，否則回傳 400。

## 新增分類 / 新增文章（UI）

Sidebar 底部有 **+ 新增分類** 按鈕；每個分類 header hover 時出現 **+** 按鈕可新增文章。兩者皆開啟 `CreationModal`。

**新增分類欄位：** 分類 ID（`^[a-z0-9-]+$`）、顯示名稱、說明（選填）
**新增文章欄位：** 分類（下拉）、標題、Slug（自動從標題生成，可手動覆蓋）

- API 驗證格式後建立檔案 → `revalidatePath` → modal 關閉並跳轉到新頁面
- 分類 ID / Slug 衝突時回傳 409

## 注意事項

- `content/` 下的 `_index.md` 為分類 metadata（title、description），不會出現在文章列表
- 文章依 `date` 降冪排序，`draft: true` 的文章不顯示
- 搜尋走 `/api/search`，依 title / description / tags 比對，回傳前 8 筆
- `watcher.ts` 已整合進 `npm run dev`（透過 `concurrently` 同時啟動）
- `TerminalPanel` 連線至 `http://localhost:7681`（ttyd），未啟動時顯示離線狀態
- 編輯器 rawContent 包含完整 front matter，使用者可直接編輯 metadata
