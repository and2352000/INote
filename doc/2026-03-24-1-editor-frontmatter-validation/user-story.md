---
status: approved
feature: "editor-frontmatter-validation"
date: "2026-03-24"
---

## 背景

> 編輯器有 1.5 秒 debounce auto-save，使用者在編輯 front matter（如 tags YAML）時，若停頓超過 1.5 秒，會將格式不完整的 YAML 儲存到磁碟，導致 MDX 編譯失敗（next-mdx-remote 拋出錯誤）。

## 使用者故事

As a 筆記作者，
I want to 在 Markdown 編輯器中，自動儲存前先驗證 front matter YAML 格式，
So that 不會因為打到一半的不完整 YAML 被存入磁碟而導致頁面崩潰。

## 驗收條件

- [ ] 編輯器 debounce 觸發時，先以 js-yaml 解析 front matter 區塊
- [ ] YAML 格式有誤時，顯示警告訊息（如「YAML 格式錯誤，未儲存」），不呼叫 /api/save
- [ ] YAML 格式正確時，照常自動儲存
- [ ] textarea 內容在驗證失敗時仍保留（不清空、不 rollback）
- [ ] 使用者修正後，下次 debounce 觸發可成功儲存

## 備註（選填）

> - 驗證邏輯放在前端（MarkdownEditor.tsx），不需要 API round-trip
> - /api/save 可選擇性加後端驗證作為第二層防線，但非必要
> - 不在範圍內：驗證 front matter 欄位的語義正確性（如 date 格式），只驗證 YAML 語法
