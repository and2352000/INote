---
status: approved
feature: "mermaid-render"
date: "2026-03-25"
---

## 背景

> 筆記中經常使用 Mermaid 語法撰寫流程圖、架構圖等，但目前文章頁面只會將 mermaid code block 顯示為純文字程式碼，無法渲染為圖表，降低了筆記的可讀性。

## 使用者故事

As a 筆記使用者
I want to 在文章頁面中自動將 mermaid code block 渲染為視覺化圖表
So that 我可以直接在筆記中閱讀流程圖、架構圖等，而不需要另外開工具轉換

## 驗收條件

- [ ] 閱讀模式下，markdown 中的 ` ```mermaid ` code block 渲染為 SVG 圖表
- [ ] 編輯模式的即時預覽（react-markdown）同樣支援 mermaid 渲染
- [ ] 渲染失敗時（語法錯誤等）顯示錯誤提示，不影響頁面其餘內容
- [ ] 支援深色模式（圖表配色隨主題切換）
- [ ] 不影響非 mermaid code block 的正常顯示

## 備註（選填）

> - Mermaid 官方提供 client-side rendering library（mermaid.js），需評估 SSR vs CSR 策略
> - 常見圖表類型：flowchart、sequence diagram、class diagram、gantt 等皆應支援
> - 需注意 bundle size 影響，mermaid.js 體積較大，可考慮動態載入

