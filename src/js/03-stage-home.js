/* ═══════════════════════════════════════════════════════════
   總覽
   ═══════════════════════════════════════════════════════════ */
var STAGE_CARDS = [
  {h:"#/apply", n:"1", flag:"applied", t:"申請 — 讓 AI 小幫手當場示範一次外洩",
   d:'一個很親切的 AI 小幫手陪您填完整份表單，連身分證正反面和存摺封面都收下了。然後畫面轉黑。<b>您會先嚇一跳，再發現這張表單其實是安全的——不安全的是您等一下要去用的那個對話框。</b>',
   g:["解題方向 一"]},
  {h:"#/bind", n:"2", flag:"bound", t:"綁定 — 從三個相似帳號中選出真的官方帳號",
   d:'搜尋「新竹青年」，跳出三個幾乎一樣的帳號，兩個是假的。選完再看它要什麼權限。<b>認假帳號跟認可疑外掛，用的是同一雙眼睛。</b>',
   g:["解題方向 三"]},
  {h:"#/review", n:"3", flag:"reviewed", t:"審核 — 把等待期變成教室",
   d:'等審核的那五到七天，本來是一段空白。現在那裡有五則各三十秒的提醒，每一則後面貼著一件<b>真的發生過、而且沒有人負責</b>的事。',
   g:["解題方向 二","解題方向 四"]},
  {h:"#/checklist", n:"4", flag:"checklistPassed", t:"核銷 — 12 項檢核清單，要佐證不要打勾",
   d:'十二項檢核，但不給您打勾。要答出設定在哪一頁、填入您查到的數字、附上那張截圖。<b>答錯不退件，答錯就教您</b>——可以一直重來，直到十二項都對。',
   g:["解題方向 六"]},
  {h:"#/payout", n:"5", flag:"paid", t:"撥款 — 進度追蹤，加上一個值得拿的東西",
   d:'錢什麼時候到，一步一步看得到。順便發一枚徽章——不是榮譽，是<b>次年免重填、優先審查、當講師領鐘點費</b>。學會的人回頭教下一批。',
   g:["解題方向 二","解題方向 五"]}
];

function renderHome(){
  paintCase();
  $("stageCards").innerHTML = STAGE_CARDS.map(function(c){
    return '<button class="stagecard '+(S.get(c.flag,false)?"done":"")+'" type="button" data-go="'+c.h+'">'
      + '<span class="n">'+(S.get(c.flag,false)?"✓":c.n)+'</span><span class="x">'
      + '<span class="t">'+c.t+'</span><span class="d">'+c.d+'</span>'
      + '<span>'+c.g.map(function(g){return '<span class="chip a">'+g+'</span>';}).join(" ")+'</span>'
      + '</span></button>';
  }).join("");

  var nm = S.get("name",""), applied = S.get("applied",false);
  if (applied) {
    var nxt = !S.get("bound",false) ? ["#/bind","② 綁定進度通知"]
            : !S.get("checklistPassed",false) ? ["#/checklist","④ 核銷資安檢核"]
            : ["#/payout","⑤ 撥款進度"];
    $("resumeBox").style.display = "flex";
    $("resumeTx").innerHTML = (nm ? esc(nm)+"，您的" : "您的") + "案件 <b>"
      + esc(S.get("caseNo","")) + "</b> 已於 " + esc(S.get("appliedAt","")) + " 收件。下一步是 " + nxt[1] + "。";
    $("resumeBtn").onclick = function(){ location.hash = nxt[0]; };
  } else {
    $("resumeBox").style.display = "none";
  }
}

/* ── 重置 ──
   沙箱化的 iframe 常擋掉 confirm() 與 location.reload()，所以確認改成
   頁內兩段式，重置也不靠重新載入，直接把記憶體狀態與畫面一起清乾淨。 */
function hardReset(){
  S.reset();

  /* 階段① 的暫存與畫面 */
  done = {}; done.files = {}; fired = false; ASYNC = {};
  ["name","phone","pid","bday","mail","hrCity","hrDist","hrAddr","mlCity","mlDist","mlAddr",
   "idType","scheme","func","sw","vendor","pdate","pmethod","cur","amt","twd"].forEach(function(k){
    var inp = $("f-"+k);
    if (inp) {
      if (inp.tagName === "SELECT") inp.selectedIndex = 0; else inp.value = "";
      inp.removeAttribute("aria-invalid");
      if (inp.dataset) delete inp.dataset.touched;
    }
    var er = $("e-"+k+"-err"); if (er) { er.textContent = ""; er.classList.remove("on"); }
    var ec = $("e-"+k); if (ec) { ec.className = "echo"; ec.innerHTML = ""; }
  });
  $("f-hrCity").value = "新竹市";
  $("f-same").checked = true;
  $("mailAddrBox").style.display = "none";
  VOUCHER.forEach(function(_,i){ var c = $("v"+i); if (c) c.checked = false; });
  ATTACH.forEach(function(a){
    var inp = $(a.id); if (inp) inp.value = "";
    var n = $("n-"+a.id); if (n) n.innerHTML = "";
  });
  showErrors = false;
  if (typeof runAudit === "function") runAudit();
  $("banner").style.display = "none";
  $("submitBtn").textContent = "送出申請";
  $("assistTx").innerHTML = "<b>申辦小幫手</b>　這次的表單由我陪您填寫。每填完一欄我會即時確認，有問題我會馬上告訴您。";

  /* 覆蓋層若還開著 */
  $("modal").classList.remove("on");
  $("modalSheet").classList.remove("on");
  $("veil").classList.remove("on");
  $("term").className = ""; $("term").innerHTML = "";

  /* 其他階段由狀態重畫 */
  $("toolPick").value = "";
  $("decl").classList.remove("on");
  $("chkSubmit").textContent = "送出核銷申請";
  $("printDecl").style.display = "none";
  buildMcList();
  showBind(1);
  $("b-fb").className = "fb";
  $("adminBox").style.display = "none";
  $("adminBtn").textContent = "展開承辦端後台（示意）";

  location.hash = "#/";
  route();
  toast("展示進度已清除");
}

/* 兩段式確認：第一次按進入確認狀態，第二次才真的執行 */
function wireReset(btnId){
  var btn = $(btnId), label = btn.textContent, armed = false, t;
  btn.addEventListener("click", function(){
    if (!armed) {
      armed = true;
      btn.textContent = "確定清除？再按一次";
      btn.classList.add("pri"); btn.classList.remove("sec");
      t = setTimeout(function(){
        armed = false; btn.textContent = label;
        btn.classList.remove("pri"); btn.classList.add("sec");
      }, 4000);
      return;
    }
    clearTimeout(t); armed = false;
    btn.textContent = label;
    btn.classList.remove("pri"); btn.classList.add("sec");
    hardReset();
  });
}
wireReset("resetHome");

