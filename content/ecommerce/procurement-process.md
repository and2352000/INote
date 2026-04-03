---
title: "Procurement Process"
date: 2026-04-03
tags: ["補貨", "採購", "ERP", "spreadsheet"]
draft: false
---

## REPLENISHMENT 系統架構

### 資料來源工作表

| 工作表 | 說明 | 更新頻率 |
|--------|------|----------|
| SKU_MASTER（商品建檔） | 手動維護或 ERP 匯出貼上 | 視情況更新 |
| PO_PIPELINE（在途採購） | 手動維護或 ERP 匯出貼上 | 視情況更新 |
| STOCK_ONHAND（在手庫存） | 手動貼上每日/每週盤點或 ERP 匯出 | 每日/每週 |
| ORDERS_RAW（近 30 天銷售） | Apps Script 自動匯入 CSV | 每月更新 |
| SKU_MAP（各平台 SKU 對應表） | 手動維護或 ERP 匯出貼上 | 視情況更新 |
| SUPPLIER_LT（供應商交期） | 手動維護或 ERP 匯出貼上 | 視情況更新 |
| CONFIG（觀察天數） | 集中管理系統全域設定 | 視情況更新 |

---

## REPLENISHMENT 工作表

### 各欄位說明

| 欄位 | 英文全名 | 說明 |
|------|---------|------|
| TQ | Total Sales Quantity | 總銷量（天數以 CONFIG 表統計天數為主） |
| ADS | Average Daily Sales | 平均日銷（天數以 CONFIG 表統計天數為主） |
| LT | Lead Time | 交期天數（下單到到貨所需天數） |
| SS_days | Safety Stock Days | 安全天數 |
| SOH | Stock on Hand | 在手庫存 |
| OO | On-Order Quantity | 在途庫存（已下單未到貨） |
| SS | Safety Stock | 安全庫存量 = ADS × LT |
| OUT | Order-Up-To Level | 目標庫存數量 = (LT + SS_days) × ADS |
| ROQ | Recommended Order Quantity | 建議採購量（未考慮 MOQ）= OUT − (SOH + OO) |
| POH@LT | Projected On-Hand at Lead Time | 到貨當天預估庫存：SOH + OO − ADS × LT（意義：若今天下單，等貨到了那一天，預估還剩多少庫存） |

### 叫貨狀態判定（Q 欄）

| 狀態 | 條件 | 說明 |
|------|------|------|
| 無需下單 | ROQ ≤ 0，或 ADS = 0 | 系統評估目前庫存＋在途已足夠，無需補貨；或沒有有效銷售基準 |
| ⚠️ 立即下單 | ROQ > 0 且 POH@LT ≤ SS | 即使現在就下單，到貨當天庫存仍會在安全線以下，風險高 → 立刻下單 |
| ⏳ 觀察中 | ROQ > 0 且 POH@LT > SS | 需要補貨以回到目標水位，但到貨前/到貨時不會跌破安全線 → 可排進近期補貨 |

---

## 各工作表說明

### CONFIG 工作表

集中管理系統全域設定，例如「銷售觀察天數（如 30 / 60 天）」、未來可擴充 MOQ 或安全係數。

- 預設推算「今天起往前 30 天」的訂單明細
- 若要分析 60 天，請將 B1 改為 60，以此類推

### ORDERS_RAW 工作表

收集並統一所有平台（Shopee、Shopline、門市、官網等）的訂單資料，主要提供「近 N 天銷量」的依據（由 CONFIG 控制天數）。

### SUPPLIER_LT 工作表

紀錄各供應商的平均交期，供 REPLENISHMENT 判斷「可售天數」與「目標覆蓋天數」。


QA:
- 為什麼平均銷量是除以30 (google sheet)
