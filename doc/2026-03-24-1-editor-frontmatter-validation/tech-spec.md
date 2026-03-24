---
status: approved
user-story: ./user-story.md
---

## 技術方案

在 `MarkdownEditor.tsx` 的 debounce save 觸發前，用 `js-yaml` 解析 front matter 區塊。
格式有誤則設定 `saveStatus = 'yaml-error'` 並顯示警告，跳過 `/api/save` 呼叫。

選用 `gray-matter`（專案已有，直接 import），解析失敗即代表 front matter 有誤。

## 影響範圍

| 類型 | 路徑 |
|------|------|
| 修改 | `components/MarkdownEditor.tsx` |
| 新增依賴 | 無（使用現有 `gray-matter`）|

## API / 資料格式變更

無。驗證邏輯純前端，不影響 `/api/save` 介面。

## 實作細節

1. 新增 `validateFrontmatter(text: string): boolean`
   - 呼叫 `matter(text)`，throw 則回傳 `false`，成功回傳 `true`

2. 擴充 `SaveStatus` 加入 `'yaml-error'`

3. `handleChange` debounce 觸發時先呼叫 `validateFrontmatter`：
   - `false` → `setSaveStatus('yaml-error')`，return
   - `true` → 照常呼叫 `save(text)`

4. status bar 加入 `yaml-error` 顯示：`⚠ YAML 格式錯誤，未儲存`

## 注意事項 / Edge Cases

- 沒有 front matter 的檔案不受影響（直接存）
- YAML 錯誤狀態下 textarea 內容不清空，使用者修正後下次 debounce 自動重試
- image paste 路徑（`handlePaste`）繞過 debounce 直接呼叫 `save()`，不需加驗證（paste 不會改動 front matter）
