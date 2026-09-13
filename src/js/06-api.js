/* ═══════════════════════════════════════════════════════════
   API 介接層

   mode = "auto"：能直連的就真的連，連不上自動退回內建資料。
   目前實際狀況（詳見 ⚙ API 頁的「實際試連」）：

     ● 匯率        → 可直連 open.er-api.com（免金鑰、有 CORS）
     ● 行政區      → 已改為本機內建 368 筆，不需要 API
     ✕ 發票查驗    → appID 屬機密，必須後端
     ✕ 戶政        → 限機關申請，不對外開放
     ✕ 社會救助    → 限機關申請
     ✕ LINE Login  → channel_secret 屬機密，必須後端

   本原型發佈於沙箱化的網頁環境時，內容安全政策會封鎖所有對外
   請求，連匯率也會被擋下並自動退回內建值——這是預期行為。
   自行架站後匯率即可實際連通。
   ═══════════════════════════════════════════════════════════ */
/* 連線失敗時的備援值，取自 2026-09-13 實際匯率；正式核銷以臺銀牌告匯率為準 */
var FX_MOCK = { TWD:1, USD:31.57, EUR:36.67, JPY:0.2058, CNY:4.71, GBP:42.72, HKD:4.03 };
var FX_SRC = "內建示意值";

var API = {
  mode: "auto",
  log: {},

  /* 即時市場匯率
     直連端點：GET https://open.er-api.com/v6/latest/TWD   （免金鑰、回應 CORS 標頭）
     回傳 rates 為「1 TWD 可換多少外幣」，取倒數即為每單位外幣的臺幣價。
     ※ 這是市場參考匯率，核銷正式認定仍以購買日臺灣銀行牌告匯率為準
       （臺銀 CSV 無 CORS 標頭，需後端代理 /api/bot-rates）。 */
  rates: function(){
    var self = this;
    if (this.mode === "mock") {
      this.log.fx = { live:false, note:"模擬模式，未嘗試連線" };
      return Promise.resolve({ ok:true, src:"mock", rates:FX_MOCK });
    }
    return fetch("https://open.er-api.com/v6/latest/TWD", { cache:"no-store" })
      .then(function(r){ if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function(j){
        if (!j || j.result !== "success" || !j.rates) throw new Error("回應格式不符");
        var out = { TWD:1 }, n = 0;
        ["USD","EUR","JPY","CNY","GBP","HKD"].forEach(function(c){
          if (j.rates[c]) { out[c] = Math.round((1 / j.rates[c]) * 10000) / 10000; n++; }
        });
        if (!n) throw new Error("無可用幣別");
        FX_SRC = "即時市場匯率";
        self.log.fx = { live:true, note:"open.er-api.com · 更新於 " + (j.time_last_update_utc || "—") };
        return { ok:true, src:"live", rates:out, at:j.time_last_update_utc || "" };
      })
      .catch(function(e){
        FX_SRC = "內建示意值";
        self.log.fx = { live:false, note:"連線失敗（" + (e && e.message ? e.message : "已被封鎖") + "），改用內建示意值" };
        return { ok:false, src:"mock", rates:FX_MOCK };
      });
  },

  /* 行政區清單 — 已本機內建，不發出任何請求 */
  districts: function(county){
    var list = DISTRICTS[county] || [];
    this.log.dist = { live:true, note:"本機內建 " + countDistricts() + " 筆，免介接" };
    return Promise.resolve({ ok:true, src:"builtin", list:list });
  },

  /* 財政部電子發票整合服務平台 — 發票查驗
     真實端點：POST https://api.einvoice.nat.gov.tw/PB2CAPIVAN/invapp/InvApp
     參數：version / type=Barcode / invNum / invDate / randomNumber / appID
     appID 須向財政部申請且屬機密，必須放後端，前端只呼叫 /api/einvoice/verify */
  verifyInvoice: function(d){
    this.log.einvoice = { live:false, note:"需 appID，僅後端可呼叫" };
    var sane = !!(d.sw && d.amt > 0 && d.pdate);
    var inPeriod = d.pdate >= PERIOD.from && d.pdate <= PERIOD.to;
    return delay(620).then(function(){
      return { ok:true, src:"mock", valid: sane && inPeriod,
               reason: !sane ? "憑證欄位不完整" : (!inPeriod ? "購買日期不在補助期間內" : "") };
    });
  },

  /* 戶政資料介接 — 內政部戶政司，限機關以 T-Road 申請，不對外開放。
     原型改以身分證字號首碼與檢查碼本機推算替代。 */
  verifyHousehold: function(pid){
    this.log.household = { live:false, note:"限機關介接，改以檢查碼本機推算" };
    var r = checkPid(pid);
    return delay(480).then(function(){
      return { ok:true, src:"mock", valid: !!(r && r.hsinchu), city: r ? r.city : "",
               reason: !r ? "身分證字號無效" : (r.hsinchu ? "" : "戶籍地非新竹市") };
    });
  },

  /* 重複申請比對 — 需查詢市府補助案件資料庫，後端實作 */
  checkDuplicate: function(pid){
    this.log.dup = { live:false, note:"需查詢市府案件資料庫，後端實作" };
    return delay(400).then(function(){ return { ok:true, src:"mock", duplicated:false }; });
  },

  /* 特定對象資格 — 衛福部社會救助資料／新竹市社會處，限機關介接 */
  verifyLowIncome: function(pid, type){
    this.log.lowinc = { live:false, note:"限機關介接，以檢附證明文件為準" };
    return delay(520).then(function(){
      return { ok:true, src:"mock", valid:true, note:"以檢附之證明文件為準" };
    });
  },

  /* LINE Login v2.1 — channel_secret 屬機密，token 交換必須在後端 */
  lineAuthUrl: function(){
    this.log.line = { live:false, note:"需 channel_id 與後端 callback" };
    return null;
  }
};

function countDistricts(){
  var n = 0;
  for (var k in DISTRICTS) if (DISTRICTS.hasOwnProperty(k)) n += DISTRICTS[k].length;
  return n;
}

function delay(ms){ return new Promise(function(res){ setTimeout(res, ms); }); }

