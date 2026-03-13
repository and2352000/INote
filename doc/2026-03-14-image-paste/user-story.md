---
status: approved
feature: "image-paste"
date: "2026-03-14"
---

## 背景

> 在編輯筆記時，常需要貼上截圖或圖片，目前只能手動上傳檔案再插入 markdown 連結，流程繁瑣。

## 使用者故事

As a 筆記使用者，
I want to 直接 Ctrl+V / 貼上圖片到編輯器，
So that 圖片能自動儲存並插入 markdown，不需要手動處理檔案。

## 驗收條件

- [ ] 在編輯模式下，貼上圖片（clipboard image）可觸發上傳
- [ ] 圖片儲存至 `public/images/`
- [ ] 檔名格式：`{Date.now()}-{4位隨機碼}.{ext}`（例：`1710234522000-a3f2.png`）
- [ ] 上傳後自動在游標位置插入 `![](/images/檔名)` markdown
- [ ] 支援截圖（PNG）與常見格式（JPEG、WebP、GIF）
- [ ] 上傳期間有 loading 提示
- [ ] 上傳失敗時顯示錯誤訊息

## 備註

> - 拖曳上傳列為 v2
