---
status: draft
user-story: ./user-story.md
---

## 技術方案

在 `MarkdownEditor.tsx` 的 `<textarea>` 上監聽 `paste` 事件，攔截 `clipboardData` 中的圖片檔案，透過新增的 `POST /api/upload-image` 上傳至伺服器，完成後在游標位置插入 markdown 圖片語法。

## 影響範圍

| 類型 | 路徑 |
|------|------|
| 修改 | `components/MarkdownEditor.tsx` |
| 新增 | `app/api/upload-image/route.ts` |

## API：`POST /api/upload-image`

**Request:** `multipart/form-data`
- `file`: 圖片檔案

**Response:**
```json
{ "url": "/images/1710234522000-a3f2.png" }
```

**安全限制：**
- 僅允許 `image/png`, `image/jpeg`, `image/webp`, `image/gif`
- 檔案大小上限：10MB
- 存放至 `public/images/`，不允許路徑穿越

**檔名生成：**
```ts
const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
// 存放路徑：public/images/${filename}
// 回傳 URL：/images/${filename}
```

## MarkdownEditor 修改

1. 在 `<textarea>` 加上 `onPaste` handler
2. 攔截 `e.clipboardData.files` 中的第一個 image 檔案
3. 上傳期間：在游標位置插入 `![uploading...]()` 佔位，`saveStatus` 顯示上傳中
4. 上傳成功：將佔位替換為 `![](圖片 URL)`，觸發 debounce save
5. 上傳失敗：移除佔位，顯示錯誤訊息

## 游標位置插入邏輯

```ts
const pos = textarea.selectionStart
const before = content.slice(0, pos)
const after = content.slice(pos)
setContent(`${before}![](${url})${after}`)
// 移動游標到插入點之後
textarea.selectionStart = textarea.selectionEnd = pos + `![](${url})`.length
```

## 注意事項 / Edge Cases

- 非圖片檔案貼上（文字、HTML）不攔截，走原本 paste 行為
- 同時貼上多個檔案：只處理第一個 image，其餘忽略
- 上傳中再次貼上：允許，各自獨立處理
- `public/images/` 目錄不存在時，API 自動建立
