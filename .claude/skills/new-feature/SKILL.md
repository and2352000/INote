---
name: new-feature
description: 建立新功能的 user-story 文件與資料夾
---

# 建立新功能 User Story

1. 詢問使用者功能名稱（英文 kebab-case，例如 `sidebar-search`）
2. 確認文件存放目錄：檢查專案 rules 中是否有定義 `doc_dir`，若無則詢問使用者要將文件放在哪個目錄
3. 在 `{doc_dir}` 下建立資料夾，命名格式：`{today}-{count}-{feature-name}/`
   - `{today}` 為當天日期 yyyy-mm-dd
   - `{count}` 為當天第幾個功能（從 1 開始，檢查 `{doc_dir}` 下同日期的資料夾數量）
3. 在資料夾內建立 `user-story.md`，使用以下範本：

```markdown
---
status: draft
feature: "{feature-name}"
date: "{today}"
---

## 背景

> 說明這個功能的動機或痛點

## 使用者故事

As a ...
I want to ...
So that ...

## 驗收條件

- [ ]
- [ ]

## 備註（選填）

> Edge cases、已知限制、不在範圍內的項目
```

4. 與使用者討論需求，逐步完善 user-story 內容
5. 使用者確認後才將 `status` 改為 `approved`，未經確認不得擅自更改
