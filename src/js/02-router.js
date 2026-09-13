/* ═══════════════════════════════════════════════════════════
   路由
   ═══════════════════════════════════════════════════════════ */
var STAGES = [
  {id:"home",     hash:"#/",          n:"·", t:"總覽", flag:null},
  {id:"apply",    hash:"#/apply",     n:"1", t:"申請", flag:"applied"},
  {id:"quiz",     hash:"#/quiz",      n:"◎", t:"石鍋", flag:"quizDone"},
  {id:"bind",     hash:"#/bind",      n:"2", t:"綁定", flag:"bound"},
  {id:"review",   hash:"#/review",    n:"3", t:"審核", flag:"reviewed"},
  {id:"checklist",hash:"#/checklist", n:"4", t:"核銷", flag:"checklistPassed"},
  {id:"payout",   hash:"#/payout",    n:"5", t:"撥款", flag:"paid"},
  {id:"guide",    hash:"#/guide",     n:"＊", t:"懶人包", flag:null},
  {id:"apidocs",  hash:"#/apidocs",   n:"⚙", t:"API", flag:null}
];

function drawRail(cur){
  $("railIn").innerHTML = STAGES.map(function(s){
    var done = s.flag && S.get(s.flag,false);
    return '<button type="button" data-go="'+s.hash+'" class="'+(done?"done":"")+'"'
      + (s.id===cur?' aria-current="step"':"") + '>'
      + '<span class="pip">'+(done && s.id!==cur ? "✓" : s.n)+'</span>'+s.t+'</button>';
  }).join("");
}

var ENTER = {
  home: renderHome, apply: renderApply, bind: renderBind, review: renderReview,
  quiz: renderQuiz,
  checklist: renderChecklist, payout: renderPayout, guide: function(){},
  apidocs: renderApiDocs
};

function route(){
  var h = location.hash || "#/";
  var st = STAGES.filter(function(s){ return s.hash === h; })[0] || STAGES[0];
  STAGES.forEach(function(s){
    var el = $("v-"+s.id); if (el) el.classList.toggle("on", s.id === st.id);
  });
  drawRail(st.id);
  ENTER[st.id]();
  var v = $("v-"+st.id);
  if (v) v.focus({preventScroll:true});
  window.scrollTo(0,0);
}
window.addEventListener("hashchange", route);

document.addEventListener("click", function(e){
  var b = e.target.closest("[data-go]");
  if (!b) return;
  e.preventDefault();
  location.hash = b.getAttribute("data-go");
});

/* 案號顯示 */
function paintCase(){
  var c = S.get("caseNo","");
  $("caseno").textContent = c ? "案件編號 " + c : "";
}

