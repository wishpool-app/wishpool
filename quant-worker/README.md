# quant-worker — 币安量化手机版

不用电脑、不用服务器。把 `worker.js` 部署到 Cloudflare Worker（免费），
每 15 分钟算一次信号，有信号推微信。

## 一步部署
1. Cloudflare Dashboard → Workers & Pages → Create → Workers → Connect to Git
2. 选本仓库，Root directory 填 `quant-worker`
3. Deploy 后到 Settings → Variables 加：
   - `PUSHPLUS_TOKEN`（必填，微信推送）
   - `BINANCE_KEY` / `BINANCE_SECRET`（选填，要自动下单才填）
   - `LIVE=1`（选填，填了才真下单）
   - `EQUITY=300`（选填，本金）
4. 浏览器访问 `<你的域名>/test` → 微信应收到测试消息

## 策略
双 Supertrend(10,3) + ADX≥20 + 日线 EMA50 同向 + 回踩 EMA20 收复 + 放量(>0.9)
15m 周期，止损 1.5×ATR，TP1 1.5R 平一半后推保本，5x 杠杆，单笔风险 2%。

参数与电脑版 `quant/config.py` 完全一致，指标已用 271 天历史逐项对齐验证。
