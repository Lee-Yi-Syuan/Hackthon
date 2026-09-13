/* ═══════════════════════════════════════════════════════════
   ② 綁定
   ═══════════════════════════════════════════════════════════ */
var ACCTS = [
  {k:"fake1", grey:true, av:"新青", nm:"新竹青年補助小幫手 AI", shield:["灰盾 一般帳號",""],
   id:"@hsinchu-youth-ai", fr:"好友 1,132 ｜ 簡介：AI 補助申請免費代辦，快速核撥"},
  {k:"real", grey:false, av:"青年", nm:"新竹市青年發展中心", shield:["綠盾 認證帳號","g"],
   id:"@youthhsinchu", fr:"好友 12,847 ｜ 簡介：新竹市政府青年發展中心官方帳號"},
  {k:"fake2", grey:true, av:"新竹", nm:"新竹市青年發展中心【補助專線】", shield:["灰盾 一般帳號",""],
   id:"@youthhsinchu-tw", fr:"好友 486 ｜ 簡介：補助進度查詢、撥款帳戶確認"}
];
var WRONG = {
  fake1: "<b>這是冒用帳號。</b><br>它掛著<b>灰盾（一般帳號）</b>——任何人都能申請，不需要證明自己是政府機關。簡介寫「免費代辦、快速核撥」，真正的市府不會用這種話術，而「代辦」意味著它要跟您收身分證、存摺封面和申請帳密。好友數 1,132 也遠低於官方帳號的量級。",
  fake2: "<b>這也是冒用帳號，而且更難看出來。</b><br>名稱和官方一模一樣，ID 只多了 <code>-tw</code> 兩個字，但它一樣是<b>灰盾（一般帳號）</b>。簡介主打「撥款帳戶確認」——這正是詐騙的目的：等您綁定後，傳一則「帳戶有誤請重新提供存摺」的訊息給您。"
};
var TIPS = "<br><br><b>三個辨識動作：</b>① 看盾牌顏色，綠盾或藍盾才是經過審查的帳號。② 不要從 LINE 搜尋結果直接加，改從市府官網或紙本公文上的 QR code 進入。③ 官方帳號<b>永遠不會</b>在 LINE 上跟您要存摺、密碼或手機驗證碼。";

var bindInit = false;

function renderBind(){
  paintCase();
  var nm = S.get("name","");
  $("recvLine").innerHTML = (nm ? esc(nm)+"，您的" : "您的") + "申請已於 "
    + esc(S.get("appliedAt", fmt(new Date()))) + " 收件，進入資格核驗程序。";

  if (!bindInit) {
    bindInit = true;
    $("acctList").innerHTML = ACCTS.map(function(a){
      return '<button class="acct" type="button" data-k="'+a.k+'">'
        + '<span class="ph'+(a.grey?" grey":"")+'">'+a.av+'</span><span class="in">'
        + '<span class="nm">'+a.nm+' <span class="chip '+a.shield[1]+'">'+a.shield[0]+'</span></span>'
        + '<span class="id">'+a.id+'</span><span class="fr">'+a.fr+'</span></span></button>';
    }).join("");

    $("acctList").addEventListener("click", function(e){
      var b = e.target.closest(".acct"); if (!b) return;
      var k = b.getAttribute("data-k");
      if (k === "real") { showBind(2); return; }
      var fb = $("b-fb");
      fb.className = "fb no on";
      fb.innerHTML = WRONG[k] + TIPS;
      fb.scrollIntoView({behavior:"smooth", block:"center"});
    });

    $("backAcctBtn").addEventListener("click", function(){ showBind(1); });
    $("agreeBtn").addEventListener("click", function(){
      S.merge({bound:true, lineId:"@youthhsinchu", boundAt:fmt(new Date())});
      showBind(3); runPushes(); toast("已綁定 @youthhsinchu");
    });
  }

  showBind(S.get("bound",false) ? 3 : 1);
  if (S.get("bound",false)) runPushes();
}

function showBind(n){
  $("b-s1").style.display = n === 1 ? "flex" : "none";
  $("b-s2").style.display = n === 2 ? "flex" : "none";
  $("b-s3").style.display = n === 3 ? "flex" : "none";
  if (n !== 1) $("b-fb").className = "fb";
}

function runPushes(){
  var now = new Date();
  $("clk").textContent = ("0"+now.getHours()).slice(-2)+":"+("0"+now.getMinutes()).slice(-2);
  var who = S.get("name",""), caseNo = S.get("caseNo","YC-2026-0000");
  var msgs = [
    ["綁定成功", (who ? esc(who)+"您好，" : "") + "案件 " + esc(caseNo) + " 已完成通知綁定。後續進度將於此推播。"],
    ["資格核驗通過", "設籍與年齡條件符合，案件進入文件審查。預計 " + fmt(workday(5)) + " 前完成。"],
    ["【AI 安全提醒 1/5】您的資料會被拿去訓練嗎？", "多數 AI 服務預設「可使用您的對話改善模型」。花 30 秒關掉它 → 點我看懶人包"]
  ];
  var box = $("pushes"); box.innerHTML = "";
  msgs.forEach(function(m,i){
    var el = document.createElement("div");
    el.className = "push";
    el.innerHTML = '<div class="hd"><span class="dot"></span>新竹市青年發展中心</div><b>'
      + esc(m[0]) + "</b>" + m[1];
    box.appendChild(el);
    setTimeout(function(){ el.classList.add("on"); }, 340 + i*600);
  });
}

