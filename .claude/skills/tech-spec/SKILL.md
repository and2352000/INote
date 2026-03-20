---
name: tech-spec
description: 為已核准的 user-story 建立 tech-spec 技術規格文件
---

# 建立 Tech Spec

前置條件：對應的 `user-story.md` 必須已經 `status: approved`，否則拒絕建立並提醒使用者先完成 user-story 審核。

1. 詢問使用者要為哪個功能建立 tech-spec（或從上下文推斷）
2. 確認文件存放目錄：檢查專案 rules 中是否有定義 `doc_dir`，若無則詢問使用者文件放在哪個目錄
3. 找到對應的 `{doc_dir}/{date}-{count}-{feature-name}/` 資料夾
3. 確認該資料夾的 `user-story.md` 的 `status` 為 `approved`
4. 在同一資料夾內建立 `tech-spec.md`，使用以下範本：

```markdown
---
status: draft
user-story: ./user-story.md
---

## 技術方案

> 選擇的實作方向與理由

## 影響範圍

| 類型 | 路徑 |
|------|------|
| 新增 | |
| 修改 | |

## API / 資料格式變更

## 注意事項 / Edge Cases
```

5. 根據 user-story 的需求，與使用者討論並填寫技術方案
