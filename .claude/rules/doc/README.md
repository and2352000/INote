---
description: Feature doc 行為規範，約束 user-story 與 tech-spec 的流程紀律
---

# Feature Doc 行為規範

## doc_dir

功能文件存放在專案根目錄的 `doc/`。

## Claude 行為約束

- 開始新功能前，主動提示使用者執行 `/new-feature` 建立 user-story
- `user-story.md` 的 `status: draft` 期間，只討論需求，不進行技術設計
- `status: approved` 後才可建立 `tech-spec.md`（透過 `/tech-spec`）
- 都 approved 才可以開始開發
- 未經使用者確認，不得擅自將 status 改為 approved
- 一個新的 feature 開發完成之後，詢問使用者是否需要 /doc-summary