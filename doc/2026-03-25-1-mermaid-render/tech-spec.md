---
status: approved
user-story: ./user-story.md
---

## 技術方案

Mermaid.js 需要瀏覽器 DOM 才能渲染，因此採用 **client-side dynamic import** 策略：

1. 建立 `MermaidBlock` client component，接收 mermaid 語法字串，呼叫 `mermaid.render()` 產生 SVG
2. 使用 `next/dynamic` with `ssr: false` 包裝，避免 SSR 階段載入 mermaid.js
3. 閱讀模式：透過 MDXRemote 的 `components` prop，將 `pre > code.language-mermaid` 替換為 MermaidBlock
4. 編輯預覽：透過 ReactMarkdown 的 `components` prop，同樣替換 mermaid code block
5. 深色模式：監聽 `data-theme` attribute 變化，切換 mermaid theme（`default` / `dark`）
6. 動態載入 mermaid.js（`import('mermaid')`），避免影響首次載入 bundle size

### 錯誤處理

- `mermaid.render()` 失敗時 catch error，顯示紅色錯誤訊息框 + 原始程式碼
- 不影響頁面其他內容的渲染

### 深色模式切換

- 使用 `MutationObserver` 監聽 `document.documentElement` 的 `data-theme` attribute
- theme 變化時重新呼叫 `mermaid.initialize()` + 重新 render

## 影響範圍

| 類型 | 路徑 |
|------|------|
| 新增 | `components/MermaidBlock.tsx` — Mermaid 渲染 client component |
| 修改 | `app/[category]/[slug]/page.tsx` — MDXRemote 加入 custom components（透過 client wrapper） |
| 修改 | `components/MarkdownEditor.tsx` — ReactMarkdown 加入 custom components |
| 修改 | `styles/main.css` — mermaid 容器與錯誤提示樣式 |

## API / 資料格式變更

無。純前端渲染，不涉及 API 變更。

## 注意事項 / Edge Cases

- mermaid.js 體積約 ~800KB（gzip ~200KB），必須動態載入，不可包含在主 bundle
- MDXRemote 在 RSC 環境中無法直接使用 client component 作為 custom component，需透過一個 client wrapper 傳入 components
- 目前 `ArticleClient.tsx` 接收 SSR 渲染好的 `children`（MDX 結果），MDX components 需在 server page 層級注入
- mermaid `render()` 會產生唯一 ID 的 SVG，多個圖表需確保 ID 不衝突（mermaid 內建處理）
- 編輯預覽中頻繁打字時，應避免每次 content 變化都觸發 mermaid re-render，可用 debounce 或 memo
