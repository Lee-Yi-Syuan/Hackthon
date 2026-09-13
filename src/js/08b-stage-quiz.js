
/* ═══════════════════════════════════════════════════════════
   石鍋小測驗

   測驗本身是獨立的 quiz.html，用 iframe 載入：
   它有自己的配色與全域 reset（--ink 與主程式撞名、
   *{margin:0;padding:0} 會清掉主程式間距），直接併進來會壞掉。
   隔離的附帶好處是那 1.5MB 的圖只在走到這一關才載入。

   結果由 quiz.html 以 postMessage 回傳：
     {type:"hotpot-done", inPot, misses, total}   完成一輪
     {type:"hotpot-exit", ...}                    使用者按「回到申請流程」
   ═══════════════════════════════════════════════════════════ */

var QUIZ_SRC = "quiz.html";
var quizInit = false;

function renderQuiz(){
  paintCase();
  S.set("quizSeen", true);

  var frame = $("quizFrame");

  /* 第一次進來才載入，之後保留玩到一半的狀態 */
  if (!frame.getAttribute("src")) frame.setAttribute("src", QUIZ_SRC);

  if (quizInit) { paintQuizResult(); return; }
  quizInit = true;

  frame.addEventListener("load", function(){ $("quizLoad").classList.add("gone"); });

  $("quizReload").addEventListener("click", function(){
    $("quizLoad").classList.remove("gone");
    frame.setAttribute("src", QUIZ_SRC + "?r=" + Date.now());
  });

  $("quizFull").addEventListener("click", function(){
    var el = $("quizWrap");
    var req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!req) { toast("這個瀏覽器不支援全螢幕，直接在下方畫面玩也可以"); return; }
    var p = req.call(el);
    if (p && p["catch"]) p["catch"](function(){
      toast("全螢幕被瀏覽器擋下，直接在下方畫面玩也可以");
    });
  });

  $("quizNext").addEventListener("click", function(){ location.hash = "#/bind"; });

  paintQuizResult();
}

/* ── 接收測驗回傳 ── */
window.addEventListener("message", function(e){
  var frame = $("quizFrame");
  if (!frame || e.source !== frame.contentWindow) return;   /* 只收自家 iframe */
  var d = e.data;
  if (!d || typeof d !== "object") return;

  if (d.type === "hotpot-done") {
    S.merge({
      quizDone: true,
      quizMisses: d.misses,
      quizInPot: d.inPot,
      quizTotal: d.total,
      quizAt: fmt(new Date())
    });
    paintQuizResult();
    drawRail("quiz");
    toast(d.misses === 0 ? "一次都沒失手，這鍋很乾淨" : "完成了，途中失手 " + d.misses + " 次");
  }

  if (d.type === "hotpot-exit") location.hash = "#/bind";
});

function paintQuizResult(){
  var box = $("quizResult");
  if (!box) return;
  if (!S.get("quizDone", false)) { box.style.display = "none"; return; }

  var m = S.get("quizMisses", 0);
  box.style.display = "flex";
  $("quizResultT").textContent = m === 0
    ? "一次都沒失手，這鍋很乾淨"
    : "完成，途中失手 " + m + " 次";
  $("quizResultP").innerHTML = m === 0
    ? "兩樣該下鍋的都下了，四樣不該下的一個都沒碰。這個判斷力請帶去您等一下要用的那個對話框。"
    : "失手的那幾樣，正是最常被順手貼進 AI 對話框的東西——" +
      "<b>而它們的共通點是：一旦送出去，就再也撤不回來了。</b>" +
      "階段③的微課程會把這幾類再講一次。";
}
