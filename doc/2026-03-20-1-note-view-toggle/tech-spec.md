---
status: approved
user-story: ./user-story.md
---

## 技術方案

目前分類頁 `[category]/page.tsx` 是 Server Component，筆記以 `.notes-grid` 格狀卡片呈現。需要加入 client 端的 view mode 切換邏輯。

### 方案：CategoryPageClient wrapper + CSS class 切換

1. **新增 `components/ViewToggle.tsx`**（client component）
   - 提供 list / grid 兩個 icon 按鈕
   - 讀寫 `localStorage` key: `note-view-mode`（值為 `"list"` | `"grid"`，預設 `"list"`）
   - 透過 callback 通知父層目前的 view mode

2. **新增 `components/CategoryList.tsx`**（client component）
   - 接收 posts 資料（從 server component 傳入序列化後的 props）
   - 管理 `viewMode` state，初始值從 `localStorage` 讀取
   - 將 `ViewToggle` 透過 Topbar 的 `noteActions` slot 傳入
   - 根據 viewMode 在 `.notes-grid` 上加入 `.view-list` 或 `.view-grid` class

3. **修改 `app/[category]/page.tsx`**
   - 將文章列表渲染邏輯移至 `CategoryList`，傳入 posts、category、cat 資訊

4. **修改 `styles/main.css`**
   - `.notes-grid.view-list`：單欄、橫向排列（類似傳統列表）
   - `.notes-grid.view-grid`：維持現有卡片格狀排列（`repeat(auto-fill, minmax(240px, 1fr))`）
   - 列表模式下 `.note-card` 改為橫向 flex、全寬，tags 顯示在右側或標題下方
   - 響應式：小螢幕下兩種模式皆為單欄

### localStorage key

| Key | 值 | 預設 |
|-----|-----|------|
| `note-view-mode` | `"list"` \| `"grid"` | `"list"` |

### Tags 顯示

目前 `note-card` 未顯示 tags。兩種模式都需要新增 tags 渲染：
- Server component 已有 `post.tags` 資料（`PostMeta.tags?: string[]`）
- 在卡片內以小標籤（badge）樣式呈現

## 影響範圍

| 類型 | 路徑 |
|------|------|
| 新增 | `components/ViewToggle.tsx` — 切換按鈕 |
| 新增 | `components/CategoryList.tsx` — 分類文章列表 client wrapper |
| 修改 | `app/[category]/page.tsx` — 改用 CategoryList 渲染 |
| 修改 | `styles/main.css` — 新增 list/grid 模式樣式、tags badge 樣式 |

## API / 資料格式變更

無。純前端功能，不涉及 API 變更。

## 注意事項 / Edge Cases

- **SSR hydration mismatch**：`localStorage` 僅在 client 端可用。初始 render 使用預設值（list），`useEffect` 後才讀取 localStorage，需確保不產生 hydration 閃爍。可用 `mounted` flag 控制，或預設 class 與 localStorage 預設值一致（都是 list）即可避免。
- **首頁不受影響**：首頁 `app/page.tsx` 的分類卡片列表維持原樣，不套用 view toggle。
- **空 tags**：部分文章可能無 tags，需處理 `undefined` / 空陣列情況。
