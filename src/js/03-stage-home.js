/* ═══════════════════════════════════════════════════════════
   總覽
   ═══════════════════════════════════════════════════════════ */
var STAGE_CARDS = [
  {h:"#/apply", n:"1", flag:"applied", t:"申請 — 讓 AI 小幫手當場示範一次外洩",
   d:'表單上有個親切的「申辦小幫手」，每填一欄就熱心地覆誦一次，最後從身分證字號推出您的戶籍地與性別。送出的瞬間畫面轉黑，跑出資料被打包送往 <code>unknown-host</code> 的過程。<b>先讓人嚇一跳，再告訴他這張表單其實是安全的——不安全的是他等一下要去用的那個對話框。</b>',
   g:["解題方向 一"]},
  {h:"#/bind", n:"2", flag:"bound", t:"綁定 — 從三個相似帳號中選出真的官方帳號",
   d:'LINE 搜尋「新竹青年」跑出三個帳號，兩個是冒用的。選完再看授權範圍：官方帳號只要 2 項權限。<b>這套判斷標準，正是他之後安裝 AI 外掛時要用的同一套。</b>',
   g:["解題方向 三"]},
  {h:"#/review", n:"3", flag:"reviewed", t:"審核 — 把等待期變成教室",
   d:'送件到核定約 5 至 7 個工作天，過去這段時間是純粹的空白。放進 5 則各 30 秒的微課程，每則附一起真實事件。讀完得銅牌。另含<b>承辦端後台檢視</b>：四項自動勾稽、人工只看紅燈案件。',
   g:["解題方向 二","解題方向 四"]},
  {h:"#/checklist", n:"4", flag:"checklistPassed", t:"核銷 — 12 項檢核清單，要佐證不要打勾",
   d:'依核銷發票選出購買的工具，清單就長出<b>該工具的實際設定路徑</b>。每一項要求答出正確做法、填入查到的數值或附上設定截圖。全數達標才能送出請款，但可無限次重答——<b>答錯不退件，答錯就教</b>。',
   g:["解題方向 六"]},
  {h:"#/payout", n:"5", flag:"paid", t:"撥款 — 進度追蹤，加上一個值得拿的東西",
   d:'撥款時間軸與金額試算。銅／銀／金三級徽章給的不是榮譽是實質好處：次年免重填、優先審查、列入<b>種子講師名冊支領鐘點費</b>。受補助青年學會之後回頭教下一批。',
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

