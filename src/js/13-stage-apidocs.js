/* ═══ API 介接說明頁 ═══ */
var APIDOCS = [
  {n:"即時市場匯率", tag:"可直連", need:"已接上",
   e:["GET https://open.er-api.com/v6/latest/TWD", "免金鑰，回應 CORS 標頭，取倒數得每單位外幣臺幣價"],
   d:"<b>這一組現在就能真的連。</b>外幣購買金額自動換算即用此來源。注意：這是市場參考匯率，<b>核銷正式認定仍以購買日臺灣銀行牌告匯率為準</b>（臺銀 CSV 無 CORS 標頭，需後端代理 /api/bot-rates）。"},
  {n:"全國行政區清單", tag:"免介接", need:"已內建",
   e:["原可用 GET https://api.nlsc.gov.tw/other/ListTown1/{縣市代碼}", "→ 已改為本機內建，不發出請求"],
   d:"<b>這一組已經不需要 API。</b>22 縣市共 368 個鄉鎮市區直接寫進程式：資料多年不變、零延遲、離線可用，比呼叫外部服務可靠，也省掉一層後端代理。"},
  {n:"財政部電子發票整合服務平台", tag:"需金鑰", need:"務必後端",
   e:["POST https://api.einvoice.nat.gov.tw/PB2CAPIVAN/invapp/InvApp",
      "version / type=Barcode / invNum / invDate / randomNumber / appID"],
   d:"查驗購買憑證真偽。appID 須向財政部申請且屬機密，<b>絕不可寫進前端</b>。承辦端後台標紅的退件案例就是這條回傳不符。"},
  {n:"內政部戶政資料介接", tag:"限機關", need:"務必後端",
   e:["經 T-Road／政府資料介接平台申請，不對外開放", "→ 代理路徑 /api/household/verify"],
   d:"這是唯一能權威認定<b>現在是否設籍新竹市</b>的來源。身分證字號首碼只代表初次設籍地，遷籍後永不變更，不可用於資格判定；未介接前暫以申請人填寫的戶籍地址替代，由承辦人員核對戶籍謄本。"},
  {n:"衛福部社會救助資料", tag:"限機關", need:"務必後端",
   e:["由新竹市社會處內部介接", "→ 代理路徑 /api/social/low-income"],
   d:"查驗低收入戶／中低收入戶資格，決定補助比率是 50% 還是 90%。未介接前以檢附證明文件為準。"},
  {n:"LINE Login v2.1", tag:"需金鑰", need:"務必後端",
   e:["GET https://access.line.me/oauth2/v2.1/authorize",
      "?response_type=code&client_id={channel_id}&redirect_uri=...&scope=profile%20openid"],
   d:"階段②的官方帳號綁定。取得 code 後由後端以 channel_secret 換 access_token，secret 不可落在前端。"}
];

var apiDocsInit = false;
function renderApiDocs(){
  if (apiDocsInit) return;
  apiDocsInit = true;

  $("apiList").innerHTML = APIDOCS.map(function(a){
    var tagCls = a.tag === "公開" ? "g" : (a.tag === "需金鑰" ? "r" : "w");
    return '<div class="apirow"><div class="an">' + a.n
      + ' <span class="chip '+tagCls+'">'+a.tag+'</span>'
      + ' <span class="chip">'+a.need+'</span></div>'
      + '<div class="ae">' + a.e.map(esc).join("<br>") + '</div>'
      + '<div class="ad">' + a.d + '</div></div>';
  }).join("");

  $("probeBtn").addEventListener("click", probeAPIs);

  $("ruleTotal").textContent = RULES.length;
  var how = {local:["本機即時","g"], api:["API 介接","a"], manual:["人工審查","w"]};
  var basis = {
    name:"字數檢查", phone:"格式正規表示式", pid:"內政部身分證字號檢查碼演算法",
    reside:"戶籍地址縣市是否為新竹市", crosscheck:"初次設籍地 vs 現戶籍（參考，不影響資格）",
    age:"出生日期與今日差值", mail:"格式正規表示式", dist:"縣市／行政區對照表",
    pdate:"補助期間區間比對", fx:"臺銀牌告匯率，容許 ±5% 誤差",
    voucher:"五項全勾方為通過", attach:"副檔名與 10MB 大小限制，依身分類別決定必附項目",
    einvoice:"財政部電子發票平台回傳", household:"戶政資料介接回傳",
    dup:"補助案件資料庫跨年度比對", lowinc:"社會救助資料回傳",
    content:"工具用途與計畫相稱性，無法規則化"
  };
  $("ruleRows").innerHTML = RULES.map(function(r,i){
    var h = how[r.scope];
    return "<tr><td class='mono'>"+("0"+(i+1)).slice(-2)+"</td><td>"+r.label+"</td>"
      + '<td><span class="chip '+h[1]+'">'+h[0]+"</span></td>"
      + "<td>"+(basis[r.id]||"—")+"</td></tr>";
  }).join("");
}

function probeAPIs(){
  var box = $("probeOut"), btn = $("probeBtn");
  btn.disabled = true; btn.textContent = "連線中…";
  box.innerHTML = '<div class="auditrow"><span class="chip w">◷</span>'
    + '<span class="ar-x"><span class="ar-l">正在對 open.er-api.com 發出實際請求</span></span></div>';

  var t0 = Date.now();
  API.rates().then(function(r){
    var ms = Date.now() - t0;
    FX = r.rates;
    var rows = [
      ["即時市場匯率 open.er-api.com", r.src === "live",
       r.src === "live"
         ? "連線成功，取得 " + (Object.keys(r.rates).length - 1) + " 種幣別，耗時 " + ms + " ms"
           + (r.at ? "，資料更新於 " + r.at : "")
         : (API.log.fx ? API.log.fx.note : "連線失敗，已退回內建示意值")],
      ["全國行政區清單（本機內建）", true,
       countDistricts() + " 筆 ／ 22 縣市，不發出請求，離線可用"],
      ["財政部電子發票查驗", false, "appID 屬機密，前端無法呼叫，須由後端代理 /api/einvoice/verify"],
      ["內政部戶政資料介接", false, "限機關以 T-Road 申請，不對外開放；原型改以檢查碼本機推算替代"],
      ["衛福部社會救助資料", false, "限機關介接；未介接前以檢附證明文件為準"],
      ["LINE Login v2.1", false, "channel_secret 屬機密，token 交換必須在後端"]
    ];
    box.innerHTML = rows.map(function(x){
      return '<div class="auditrow"><span class="chip ' + (x[1] ? "g" : "w") + '">'
        + (x[1] ? "✓ 可用" : "✕ 需後端") + '</span>'
        + '<span class="ar-x"><span class="ar-l">' + esc(x[0]) + '</span>'
        + '<span class="ar-m">' + esc(x[2]) + '</span></span></div>';
    }).join("");
    btn.disabled = false; btn.textContent = "再試一次";
    toast(r.src === "live" ? "匯率已連上，換算改用即時匯率" : "匯率連線被擋，維持內建示意值");
  });
}

