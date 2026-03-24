---
name: commit
description: 建立 git commit，自動整理變更並產生符合規範的 commit message
---

# Git Commit

1. 執行 `git status` 與 `git diff`，了解所有變更內容
2. 分析變更，依類型選擇 prefix：
   - `feat:` 新功能
   - `fix:` 修復 bug
   - `chore:` 設定、工具、流程調整
   - `docs:` 文件變更
   - `refactor:` 重構（無功能變更）
   - `test:` 測試相關
3. 擬定 commit message（中文或英文跟隨專案風格），格式：
   ```
   {prefix}: {簡短描述}

   1. 功能改變...
      a. 細節...
   2. 功能改變...
   ```
   ps. 太複雜的話的話功能可以多一層敘述
4. 列出將納入的檔案，請使用者確認後才執行 commit
5. Stage 相關檔案並建立 commit，結尾附上：
   ```
   Co-Authored-By: {model_name} <noreply@anthropic.com>
   ```
