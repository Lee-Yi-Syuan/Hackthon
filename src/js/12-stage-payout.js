/* ═══════════════════════════════════════════════════════════
   ⑤ 撥款
   ═══════════════════════════════════════════════════════════ */
var WS = [
  {nm:"① 線上微課程", meta:"15 分鐘 ｜ 隨到隨看 ｜ 已內建於流程",
   p:"不是額外的課，就是階段③ 等待期推播的那 5 則。申請人在等審核的空檔讀完，取得銅牌。",
   exT:"案例：為什麼放在「等待期」",
   exB:"青年補助案從送件到核定約 5 至 7 個工作天。過去這段時間是純粹的空白，申請人唯一的行為是回來刷進度。把微課程放在這個窗口，<b>觸及率遠高於事前宣導</b>——事前他還沒送件，沒有動機；事後錢已入帳，更沒有動機。等待期是他一天會想起這個案子三次的時候。",
   btn:null, id:"ws1"},
  {nm:"② 實體工作坊：「把你的 AI 工具設定一次做對」", meta:"2 小時 ｜ 每月 2 場 ｜ 每場 25 人",
   p:"不講投影片。參加者<b>帶自己的筆電、用自己的帳號</b>，兩小時內當場把 12 項檢核清單全部做完，離場時銀牌到手、核銷文件也齊了。",
   exT:"案例：新竹市某文創工作室，3 人",
   exB:"三位夥伴都申請了補助購買影像生成與影音剪輯工具。工作坊當場才發現：他們用的方案<b>作品預設公開</b>於社群頁面，過去半年替客戶做的 40 多張提案圖、連同寫著客戶品牌名稱的提示詞，全部可被任何人瀏覽。<br>現場處理：升級至含非公開模式的方案、逐一刪除已公開作品、撤銷 3 個仍有效的分享連結、補簽客戶告知書。<br><b>這件事不可能靠一份文宣解決</b>——必須有人在旁邊陪他打開那個設定頁面。",
   btn:"報名下一場", id:"ws2"},
  {nm:"③ 種子講師培訓", meta:"6 小時 ｜ 每季 1 期 ｜ 限銀牌以上",
   p:"把受過訓的受補助青年，變成下一批的講師。結訓後列入市府名冊，受邀至社區、學校、微型企業授課並支領鐘點費。",
   exT:"案例：擴散路徑怎麼算",
   exB:"每期培訓 20 位種子講師，每人一年授課 4 場、每場 30 人 → <b>年觸及 2,400 人次</b>，成本僅為培訓費與鐘點費。<br>相較之下，由市府自行委外辦理同等場次的講座，成本約為三倍，且講師不具備「我也拿過這筆補助、我也踩過這個坑」的說服力。<br>種子講師本身是青年就業與斜槓收入的一環，同時回應了青年發展中心的另一項政策目標。",
   btn:"報名種子講師培訓", id:"ws3"}
];

var payInit = false;

function renderPayout(){
  paintCase();
  var passed = S.get("checklistPassed", false);
  $("payBlocked").style.display = passed ? "none" : "flex";
  if (passed) S.set("paid", true);

  $("payLede").textContent = passed
    ? "檢核已通過，案件進入主計作業。預計 " + fmt(workday(10)) + " 前入帳。"
    : "核銷文件審核中。";

  var tl = [
    ["核銷收件", S.get("checkedAt", fmt(new Date())), passed?"done":"", "發票與資安檢核聲明書送達，系統自動查驗發票真偽。"],
    ["檢核清單覆核", fmt(workday(1)), passed?"done":"", "12 項全數達標，承辦人員免逐項審查，僅抽核佐證截圖。"],
    ["主計覆核", fmt(workday(3)), passed?"now":"", "排入主計作業批次，核對受款帳戶。"],
    ["撥款入帳", fmt(workday(10)), "", "入帳後以 LINE 推播通知，並附次年度申請提醒。"]
  ];
  $("payTl").innerHTML = tl.map(function(s){
    return '<li class="'+s[2]+'"><div class="k">'+s[0]
      + (s[2]==="now"?' <span class="chip a">進行中</span>':"")
      + '</div><div class="d">'+s[1]+'</div><div class="m">'+s[3]+'</div></li>';
  }).join("");

  /* 金額：依身分別套用 50%/3,000 或 90%/6,000 */
  var low = S.get("idType","general") !== "general";
  var spend = S.get("twd", 0) || 4200;
  var rate = low ? 0.9 : 0.5, cap = low ? 6000 : 3000;
  var calc = Math.round(spend*rate), grant = Math.min(calc, cap);
  var nt = function(n){ return "NT$ " + n.toLocaleString("en-US"); };
  $("moneyRows").innerHTML =
      "<tr><td>購買金額（發票金額）</td><td class='num'>"+nt(spend)+"</td></tr>"
    + "<tr><td>補助比率（"+({general:"一般青年",low:"低收入戶",midlow:"中低收入戶"}[S.get("idType","general")])+"）</td><td class='num'>"+(rate*100)+"%</td></tr>"
    + "<tr><td>計算補助額</td><td class='num'>"+nt(calc)+"</td></tr>"
    + "<tr><td>補助上限</td><td class='num'>"+nt(cap)+"</td></tr>"
    + "<tr class='tot'><td>核定撥款金額</td><td class='num'>"+nt(grant)+"</td></tr>";
  $("rateLine").innerHTML = low
    ? "具低收入戶／中低收入戶資格，補助比率 90%、上限 6,000 元。工具品項：" + esc(S.get("toolName","—")) + "。"
    : "一般青年補助比率 50%、上限 3,000 元；具低收／中低收入戶資格者為 90%、上限 6,000 元。工具品項：" + esc(S.get("toolName","—")) + "。";

  if (!payInit) {
    payInit = true;
    $("wsList").innerHTML = WS.map(function(w){
      return '<div class="card stack s">'
        + '<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline">'
        + '<span style="font-weight:700;font-size:16px;font-family:var(--serif)">'+w.nm+'</span>'
        + '<span class="mono" style="font-size:11px;color:var(--ink-3)">'+w.meta+'</span></div>'
        + '<p style="font-size:14px;color:var(--ink-2);line-height:1.8">'+w.p+'</p>'
        + '<div class="path"><div class="t">'+w.exT+'</div>'+w.exB+'</div>'
        + '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">'
        + (w.btn ? '<button class="btn pri sm" type="button" data-ws="'+w.id+'">'+w.btn+'</button>' : "")
        + '<span class="mono" style="font-size:12.5px;color:var(--ok)" id="'+w.id+'"></span></div></div>';
    }).join("");

    $("wsList").addEventListener("click", function(e){
      var b = e.target.closest("[data-ws]"); if (!b) return;
      var id = b.getAttribute("data-ws");
      if (id === "ws2") S.merge({wsBooked:true, wsDate:fmt(workday(12)), gold:true});
      else S.merge({seedBooked:true, gold:true});
      toast("報名完成，金牌徽章已入帳");
      paintWs(); paintBadges();
    });

    wireReset("resetPay");
  }

  paintWs();
  paintBadges();
}

function paintWs(){
  $("ws1").textContent = S.get("bronze",false)
    ? "✓ 已完成（銅牌已入帳）" : "尚未完成 — 請至階段③ 閱讀 5 則微課程";
  /* 報名狀態雙向還原，重置後按鈕要能再按 */
  var b2 = $("ws2"), btn2 = $("wsList").querySelector('[data-ws="ws2"]');
  if (S.get("wsBooked",false)) {
    b2.textContent = "✓ 已報名 " + S.get("wsDate", fmt(workday(12))) + " 場次（青年發展中心 3F）";
    if (btn2) { btn2.disabled = true; btn2.textContent = "已報名"; }
  } else {
    b2.textContent = "下一場 " + fmt(workday(12));
    if (btn2) { btn2.disabled = false; btn2.textContent = "報名下一場"; }
  }
  var b3 = $("ws3"), btn3 = $("wsList").querySelector('[data-ws="ws3"]');
  if (S.get("seedBooked",false)) {
    b3.textContent = "✓ 已報名（下一期開訓 " + fmt(workday(30)) + "）";
    if (btn3) { btn3.disabled = true; btn3.textContent = "已報名"; }
  } else {
    b3.textContent = "";
    if (btn3) { btn3.disabled = false; btn3.textContent = "報名種子講師培訓"; }
  }
}

function paintBadges(){
  var bronze = S.get("bronze",false);
  var silver = S.get("silver",false) && S.get("checklistPassed",false);
  var gold = S.get("gold",false);
  $("badge1").classList.toggle("earned", bronze);
  $("badge2").classList.toggle("earned", silver);
  $("badge3").classList.toggle("earned", gold);
  $("badgeT").textContent = "目前等級：" + (gold?"金牌":(silver?"銀牌":(bronze?"銅牌":"尚未取得")));
  $("badgeP").innerHTML =
      gold   ? "已取得金牌。您已列入「青年 AI 資安種子講師」候選名冊，青年發展中心將另行通知授課媒合。"
    : silver ? "已取得銀牌。再完成一場實體工作坊或種子講師培訓即可升級金牌，次年度補助享優先審查。"
    : bronze ? "已取得銅牌。完成核銷檢核清單 12 項即可升級銀牌。"
             : "請先完成階段③的微課程 5 則取得銅牌。";
}

/* ═══ 懶人包列印 ═══ */
$("printGuide").addEventListener("click", doPrint);

