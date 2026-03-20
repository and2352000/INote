---
description: Feature doc 開發流程規範，管理 user-story 與 tech-spec 的建立時機
paths:
  - "doc/**"
---

# Feature Doc 規範

## 資料夾命名

每個功能在 `doc/` 下建立獨立資料夾：

```
doc/{yyyy-mm-dd}-{count}-{feature-name}/
├── user-story.md
└── tech-spec.md
```

範例：`doc/2026-03-14-1-sidebar-search/`

## 開發流程

1. **需求階段**：建立 `user-story.md`，與使用者討論直到確認
2. **定版**：使用者確認後將 `status` 改為 `approved`
3. **實作階段**：`user-story.md` 定版後才建立 `tech-spec.md`

## Claude 行為規範

- 開始新功能前，主動提示使用者建立 user-story
- `user-story.md` 的 `status: draft` 期間，只討論需求，不進行技術設計
- `status: approved` 後才建立並撰寫 `tech-spec.md`
- 未經使用者確認，不得擅自將 status 改為 approved
