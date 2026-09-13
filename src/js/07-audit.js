/* ═══════════════════════════════════════════════════════════
   自動審核引擎
   scope：local = 本機即時判定｜api = 需外部介接｜manual = 必須人工
   ═══════════════════════════════════════════════════════════ */
var RULES = [
  { id:"name", scope:"local", label:"申請人姓名格式",
    run:function(d){ if(!d.name) return W("尚未填寫");
      return d.name.length >= 2 ? OK("已填寫") : NO("姓名至少 2 個字"); } },

  { id:"phone", scope:"local", label:"聯絡電話格式",
    run:function(d){ if(!d.phone) return W("尚未填寫");
      return /^09\d{8}$/.test(d.phone) ? OK("手機號碼格式正確")
           : /^0\d{1,2}\d{6,8}$/.test(d.phone) ? OK("市話格式正確")
           : NO("請填 09 開頭 10 碼手機，或含區碼的市話"); } },

  { id:"pid", scope:"local", label:"身分證字號檢查碼",
    run:function(d){ if(!d.pid) return W("尚未填寫");
      var r = checkPid(d.pid);
      return r === null ? NO("格式不符：1 個英文字母 + 1 或 2 + 8 位數字")
           : r === false ? NO("檢查碼不符，號碼可能打錯")
           : OK("檢查碼正確"); } },

  { id:"reside", scope:"local", label:"設籍新竹市（以戶籍地址認定）",
    run:function(d){ if(!d.hrCity) return W("待填戶籍地址");
      return d.hrCity === "新竹市"
        ? OK("戶籍地址為新竹市，符合。實際設籍狀態以戶政介接為準")
        : NO("戶籍地址為「"+d.hrCity+"」，本計畫限設籍新竹市"); } },

  /* 參考項，永不擋件。
     身分證首碼是「初次設籍地」，遷籍後不會變更，與現戶籍不同屬正常情形。
     若把不一致視為不符，會誤殺所有遷入新竹市的合格申請人。 */
  { id:"crosscheck", scope:"local", label:"初次設籍地比對（參考，不影響資格）",
    run:function(d){ if(!d.pid || !d.hrCity) return W("待兩項皆填寫");
      var r = checkPid(d.pid);
      if(!r) return W("待身分證字號有效");
      return r.firstCity === d.hrCity
        ? OK("初次設籍地與現戶籍同為「"+d.hrCity+"」")
        : W("初次設籍於「"+r.firstCity+"」，現戶籍為「"+d.hrCity
            +"」。遷籍者屬正常情形，資格以戶政核驗為準"); } },

  { id:"age", scope:"local", label:"年齡 18 至 40 歲",
    run:function(d){ if(!d.bdayRaw) return W("尚未填寫");
      var a = ageOf(d.bdayRaw);
      if(a < 0 || a > 120) return NO("出生日期不合理");
      return (a >= 18 && a <= 40) ? OK("目前 "+a+" 歲，符合") : NO("目前 "+a+" 歲，不在 18 至 40 歲範圍"); } },

  { id:"mail", scope:"local", label:"電子郵件格式",
    run:function(d){ if(!d.mail) return W("尚未填寫");
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.mail) ? OK("格式正確") : NO("請填完整信箱，例如 you@example.com"); } },

  { id:"dist", scope:"local", label:"行政區屬於所選縣市",
    run:function(d){ if(!d.hrCity || !d.hrDist) return W("待地址填寫完成");
      var list = DISTRICTS[d.hrCity];
      if(!list) return W("查無該縣市");
      return list.indexOf(d.hrDist) >= 0 ? OK(d.hrCity+d.hrDist+" 存在")
        : NO("「"+d.hrDist+"」不屬於"+d.hrCity+"，可選："+list.join("、")); } },

  { id:"pdate", scope:"local", label:"購買日期在補助期間內",
    run:function(d){ if(!d.pdate) return W("尚未填寫");
      return (d.pdate >= PERIOD.from && d.pdate <= PERIOD.to)
        ? OK("落在 "+PERIOD.from+" 至 "+PERIOD.to+" 之間")
        : NO("購買日期須介於 "+PERIOD.from+" 至 "+PERIOD.to); } },

  { id:"fx", scope:"api", label:"外幣換算金額合理性",
    run:function(d){ if(!d.amt) return W("尚未填寫費用");
      if(d.cur === "TWD") return OK("原始幣別為新臺幣，無須換算");
      if(!d.twd) return W("待換算金額填入");
      if(!d.rate) return W("待匯率載入");
      var expect = d.amt * d.rate, diff = Math.abs(d.twd - expect) / expect;
      return diff <= 0.05 ? OK("與牌告匯率相符（誤差 "+(diff*100).toFixed(1)+"%）")
        : NO("換算金額與牌告匯率差 "+(diff*100).toFixed(1)+"%，建議填 "+Math.round(expect)+" 元"); } },

  { id:"voucher", scope:"local", label:"憑證檢核五項確認",
    run:function(d){ var n = d.voucher.filter(Boolean).length;
      return n === VOUCHER.length ? OK("五項皆已確認") : W("已確認 "+n+" / "+VOUCHER.length+" 項"); } },

  { id:"attach", scope:"local", label:"附件齊備與格式",
    run:function(d){
      var need = ATTACH.filter(function(a){ return a.req || (a.cond && d.idType !== "general"); });
      var miss = need.filter(function(a){ return !d.files[a.id]; });
      if (miss.length) return W("尚缺 "+miss.length+" 項："+miss.map(function(a){return a.n;}).join("、"));
      var bad = need.filter(function(a){ return d.files[a.id].bad; });
      return bad.length ? NO("格式或大小不符："+bad.map(function(a){return a.n;}).join("、"))
                        : OK("必要附件齊備，格式正確"); } },

  { id:"einvoice", scope:"api", label:"發票真偽查驗（財政部電子發票平台）", async:true },
  { id:"household", scope:"api", label:"戶籍核驗（內政部戶政資料介接）", async:true },
  { id:"dup", scope:"api", label:"重複申請比對（跨年度）", async:true },
  { id:"lowinc", scope:"api", label:"特定對象資格查驗（衛福部／社會處）", async:true },

  { id:"content", scope:"manual", label:"工具用途合理性",
    run:function(){ return W("由承辦人員審查，系統不自動判定"); } }
];

function OK(m){ return {s:"ok", m:m}; }
function NO(m){ return {s:"no", m:m}; }
function W(m){ return {s:"wait", m:m}; }

var VOUCHER = [
  "憑證抬頭為申請人本人姓名（或本人統一編號）",
  "載明品名，且可辨識為 AI 數位工具",
  "載明購買日期，且落在補助期間內",
  "載明金額與幣別",
  "為原始憑證，非影本重製、非估價單或訂購單"
];

var ATTACH = [
  {id:"a-id",        n:"身分證正反面",     req:true,  hint:"正反面各一張，四角完整可辨識"},
  {id:"a-invoice",   n:"購買憑證與發票",   req:true,  hint:"電子發票證明聯或信用卡帳單明細"},
  {id:"a-special",   n:"特定對象證明",     req:false, cond:true,
   hint:"低收入戶／中低收入戶證明，選擇一般青年者免附"},
  {id:"a-bank",      n:"存摺封面影本",     req:true,  hint:"須可見戶名與帳號，供撥款使用"},
  {id:"a-affidavit", n:"切結書",           req:true,  hint:"請下載範本簽名後掃描或拍照上傳"}
];

var FX = { TWD:1 };     /* 由 API.rates() 填入 */
var ASYNC = {};         /* API 規則的非同步結果 */

