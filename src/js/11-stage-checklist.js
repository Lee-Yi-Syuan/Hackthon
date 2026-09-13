/* ═══════════════════════════════════════════════════════════
   ④ 檢核清單
   ═══════════════════════════════════════════════════════════ */
var TOOLS = {
  chatgpt:{ n:"ChatGPT（OpenAI）",
    train:"<code>設定 → 資料控管 → 改善所有人的模型</code>，切換為關閉。關閉後新對話不再用於訓練，但<b>先前已被納入訓練的內容無法追回</b>。",
    keep:"關閉訓練後，對話仍會保留於帳號中直到您刪除；刪除的對話官方說明為 30 日內自系統移除。另有「臨時交談」模式不留存歷史。",
    share:"<code>設定 → 資料控管 → 共用連結 → 管理</code>，可看到所有已建立的連結並逐一刪除。" },
  gemini:{ n:"Gemini（Google）",
    train:"<code>設定 → Gemini 應用程式活動記錄</code> 關閉（或至 myactivity.google.com 管理）。注意：即使關閉，Google 說明仍會將對話保留一段期間以供安全檢視。",
    keep:"活動記錄開啟時預設保留 18 個月，可改為 3 或 36 個月；關閉活動記錄後，對話仍會短期保留（官方說明為最長 72 小時）。",
    share:"分享的 Gemini 對話會產生公開連結，於 <code>Gemini 應用程式活動記錄 → 你的公開連結</code> 撤銷。" },
  claude:{ n:"Claude（Anthropic）",
    train:"Anthropic 的消費者服務預設<b>不以您的對話訓練模型</b>，但此為可變更設定，請於 <code>設定 → 隱私</code> 確認目前狀態，並保留截圖作為佐證。",
    keep:"一般對話於您刪除後自系統移除；因信任與安全政策標記的內容可能留存較久。企業方案的保留期依合約約定。",
    share:"以「共用」產生的對話連結為公開連結，於對話的共用設定中撤銷。" },
  copilot:{ n:"Microsoft Copilot",
    train:"須先分清版本：<b>Microsoft 365 Copilot（公司帳號）</b>的資料受租用戶合約保護、不用於訓練基礎模型；<b>消費版 Copilot（個人 Microsoft 帳號）</b>則於 <code>隱私權設定 → 模型訓練</code> 中控制。用錯版本處理公司資料，是最常見的錯誤。",
    keep:"企業版依租用戶保留原則與合約；個人版可於 Microsoft 帳號隱私權儀表板刪除活動記錄。",
    share:"檢查是否曾將 Copilot 產出貼入公開的 Word／Teams 共用連結，並確認該檔案的共用對象不是「任何擁有連結的人」。" },
  midjourney:{ n:"Midjourney",
    train:"影像生成工具的風險點不同：您輸入的<b>提示詞與上傳的參考圖</b>會被保留。上傳真人照片前，須取得該人同意。",
    keep:"生成紀錄保留於帳號中，可於網頁版個人頁面刪除。",
    share:"<b>這一項最容易出事</b>：基本方案的作品<b>預設公開</b>於社群頁面，任何人都能瀏覽您的提示詞與成品。需要非公開必須使用含 Stealth Mode 的方案。拿補助做客戶案件前，請先確認這一點。" },
  other:{ n:"其他 AI 工具",
    train:"請至該服務的「隱私權設定」或「資料控管」頁面，尋找「使用我的資料改善模型／improve the model／training」之類的選項並關閉，截圖存證。若遍尋不著該選項，視同「預設會訓練」，請勿用於處理他人資料。",
    keep:"請查閱該服務的隱私權政策，找出「資料保留期（data retention）」的實際天數並填入。",
    share:"請至該服務的分享／公開連結管理頁面，確認目前有效的連結數量並撤銷不需要的。" }
};

var ITEMS = [
  {g:"A. 帳號與存取", must:true, type:"choice",
   q:"您用來登入這項 AI 工具的帳號，目前是哪一種狀態？",
   why:"補助款買的工具帳號一旦被盜，裡面的歷史對話會一次全部曝光。",
   o:[["個人常用信箱，密碼和其他網站共用",false,"密碼共用是外洩的頭號原因。其他網站被脫庫，您的 AI 帳號就一起破了——而 AI 帳號裡存著您所有歷史對話。"],
      ["個人或公司信箱，專用密碼，並已啟用雙因素驗證",true,"正確。專用密碼 ＋ 雙因素驗證是最低標準。"],
      ["與同事／合作夥伴共用同一組帳號",false,"共用帳號的每個人都看得到彼此的全部對話，且事後無法追查是誰外洩。若以補助款購買，也不符「補助個人」的核銷要件。"],
      ["公司信箱，但密碼存在瀏覽器、沒設雙因素驗證",false,"瀏覽器存密碼本身可接受，但少了雙因素驗證，電腦被他人使用或遭側錄時就直接進去了。請補開 2FA。"]]},
  {g:"A. 帳號與存取", must:true, type:"evidence",
   q:"請上傳「已啟用雙因素驗證（2FA）」的設定畫面截圖。",
   why:"這是本清單唯一要求畫面佐證的帳號安全項目，承辦人員以此核對。",
   tip:"截圖前請先遮蔽畫面上的電子郵件與電話號碼——<b>連截圖給市府也要遮</b>，這正是第 4 則微課程講的習慣。"},
  {g:"A. 帳號與存取", must:false, type:"choice",
   q:"除了您本人，還有誰能存取這個帳號？",
   why:"存取範圍決定外洩時的責任歸屬。",
   o:[["只有我本人",true,"正確。個人補助的工具帳號應僅限本人使用。"],
      ["我和一到兩位同事",false,"請改為各自申請帳號。共用帳號無法區分責任，且多數服務的使用條款禁止帳號共用。"],
      ["家人也會用同一台電腦登入",false,"請至少設定裝置鎖定與獨立的作業系統使用者；家人誤用您的 AI 帳號處理其個資，責任仍在您。"],
      ["不確定",false,"請至該服務的「已登入裝置／工作階段」頁面檢查，並登出所有不認得的裝置。"]]},

  {g:"B. 資料訓練與保留", must:true, type:"choice", path:"train",
   q:"「使用我的內容改善模型」這項設定，目前是什麼狀態？",
   why:"本計畫的核心風險。被納入模型權重的資料無法收回。",
   o:[["已確認並關閉（或該服務預設不訓練，已截圖確認）",true,"正確。這是整份清單最重要的一項。"],
      ["開著，因為關掉功能會變差",false,"關閉此設定<b>不會</b>降低模型能力——它影響的是您的資料會不會被用於未來的訓練，不是您這次得到的回答品質。請關閉。"],
      ["找不到這個設定",false,"請依上方路徑再找一次。若該服務確實沒有提供這個選項，請視同「會訓練」，不得用它處理客戶、雇主或任何他人的個資。"],
      ["沒注意過",false,"多數服務的預設值是「開啟」。請現在就去關掉——這件事花不到 30 秒，但決定了您過去與未來輸入的內容會不會永久留在模型裡。"]]},
  {g:"B. 資料訓練與保留", must:false, type:"num", unit:"天", path:"keep",
   q:"該服務刪除對話後，多久內自系統移除？請填入天數。",
   why:"要求填入具體數字，是為了確認申請人真的翻過隱私權政策。",
   lo:1, hi:400,
   ok:"已記錄。重點不在數字大小，而在您<b>查得到</b>這個數字——查不到保留期的服務，不要拿來處理他人資料。",
   no:"請填入 1 至 400 之間的天數。若隱私權政策中查不到明確保留期，這件事本身就是風險，請改用其他工具處理敏感資料。"},
  {g:"B. 資料訓練與保留", must:false, type:"choice",
   q:"這項服務的資料存放在哪裡、出事時適用哪一國法律？",
   why:"跨境傳輸是個資法的告知事項，也決定您能否主張刪除權。",
   o:[["已查閱隱私權政策，知道存放地與適用法律",true,"正確。多數國際 AI 服務的資料存於境外、適用他國法律，這不必然有問題，但您必須知道。"],
      ["應該是在台灣吧",false,"幾乎所有國際 AI 服務的資料都不在台灣。請實際查閱隱私權政策的「資料傳輸」或「國際傳輸」段落。"],
      ["沒查過，反正我只拿來寫文案",false,"只寫文案也會把客戶名稱、產品規格、報價打進去。請查一次，五分鐘的事。"],
      ["查不到",false,"查不到即視為高風險。請勿以該工具處理他人個資，並於備註欄說明。"]]},

  {g:"C. 分享與外流", must:true, type:"num", unit:"個", path:"share",
   q:"您目前仍有效的「分享連結／公開連結」共有幾個？請實際去看並填入。",
   why:"分享連結沒有密碼、沒有到期日，是最被低估的外洩管道。",
   lo:0, hi:999,
   ok:"已記錄。請把不再需要的連結全部撤銷——連結一旦流出去就收不回，唯一能做的是讓它失效。",
   no:"請填入 0 至 999 之間的整數。若您從未建立過分享連結，填 0。"},
  {g:"C. 分享與外流", must:true, type:"choice",
   q:"您曾上傳到這項工具的檔案或截圖，是否包含他人的個人資料？",
   why:"外洩他人個資，責任在上傳的人身上，不在 AI 服務商。",
   o:[["沒有；上傳前都會先刪除姓名、電話、地址等欄位",true,"正確。這是處理他人資料時唯一安全的做法。"],
      ["有，但只有姓名而已",false,"姓名就是個人資料。請刪除該對話與檔案，並改以 A001、A002 之類的代碼取代後重做。"],
      ["有上傳過客戶名單／學生名冊／員工資料",false,"<b>請立即處理</b>：刪除該對話與已上傳檔案、撤銷相關分享連結。若該服務的訓練設定當時是開啟的，請依個資法評估是否需通知當事人。日後一律先去識別化再上傳。"],
      ["有截圖過含其他人資料的畫面",false,"截圖等同上傳。請刪除，並養成截圖前先檢查畫面的習慣——包括分頁標題與側邊欄的客戶名稱。"]]},
  {g:"C. 分享與外流", must:false, type:"choice",
   q:"您安裝的 AI 外掛、瀏覽器擴充功能或連接器，權限檢查過了嗎？",
   why:"與階段②的 LINE 授權是同一個概念：最小權限原則。",
   o:[["已逐一檢查，移除了不必要的權限與沒在用的外掛",true,"正確。沒在用的外掛權限仍然有效，這是最容易被忘記的破口。"],
      ["都是從官方商店裝的，應該沒問題",false,"官方商店只審核惡意程式，不審核「權限是否過度」。一個摘要網頁的外掛要求讀取您所有分頁，就是過度。"],
      ["裝了很多，沒特別看過權限",false,"請現在打開擴充功能管理頁，逐一檢查。判斷標準：它要這項權限，是為了做它答應您的事，還是為了別的？"],
      ["沒有安裝任何外掛",true,"沒有安裝即無此風險。日後安裝時請套用同一套判斷標準。"]]},

  {g:"D. 輸出與責任", must:false, type:"choice",
   q:"AI 產出的內容，您對外使用前會做什麼？",
   why:"AI 會生成看似正確但錯誤的內容，也可能重現訓練資料中的他人作品。",
   o:[["查證事實、確認無他人個資，必要時標示為 AI 協助產出",true,"正確。產出的責任在使用者，不在工具。"],
      ["直接用，AI 寫的通常都對",false,"AI 會以流暢的語氣寫出錯誤的法規、金額與人名。對外文件請務必查證，錯了是您的名字在上面。"],
      ["會改寫過，但不會特別查證",false,"改寫不會讓錯誤的事實變正確。請至少查證數字、法規名稱與引用來源。"],
      ["不確定需不需要標示",false,"目前無一體適用的法規要求，但涉及投稿、標案、學術或客戶交付時，多有各自的揭露規定，請先確認對方要求。"]]},
  {g:"D. 輸出與責任", must:false, type:"evidence",
   q:"請上傳本次核銷的發票或收據（品項需可辨識為 AI 工具）。",
   why:"核銷必要文件，並由系統串接財政部電子發票平台查驗真偽。",
   tip:"訂閱制工具請確認發票所載期間落在<b>核定日之後</b>；跨期的續訂預繳無法核銷。"},
  {g:"D. 輸出與責任", must:true, type:"choice",
   q:"最後一題。如果明天有人問您「我可以把身分證字號貼進 ChatGPT 嗎」，您會怎麼回答？",
   why:"這份清單真正的目標，是讓受補助青年變成身邊那個會提醒別人的人。",
   o:[["不行；而且重點是先看清楚在給誰——有法律依據的系統該給就給，對話框裡的 AI 能不給就不給",true,"完全正確。這正是整個流程從第一關就想告訴您的一句話。您已經可以去提醒別人了。"],
      ["不行，個資通通不能給任何人",false,"太嚴格了，反而沒人做得到。市府申請系統、銀行、醫院依法該收的就該給——差別在於它們有法律依據、有蒐集告知、您可以要求查詢與刪除。對話框裡的 AI 三樣都沒有。"],
      ["可以，反正大家都在用",false,"使用人數多不等於安全。身分證字號的前兩碼就洩漏了戶籍地與性別，配上您在同一個對話裡提過的其他資訊，足以拼出一個完整的人。"],
      ["看情況，如果是付費版應該還好",false,"付費不等於不訓練，也不等於不外洩。判斷依據是<b>合約怎麼寫、設定怎麼開</b>，不是有沒有付錢。"]]}
];

var chkInit = false;

function renderChecklist(){
  paintCase();
  if (!chkInit) {
    chkInit = true;
    $("toolPick").value = S.get("tool","");
    if (!$("toolPick").value) {
      var g = guessTool(S.get("sw",""));
      if (g) { $("toolPick").value = g; S.merge({tool:g, toolName:TOOLS[g].n}); }
    }
    $("toolPick").addEventListener("change", function(e){
      S.merge({tool:e.target.value, toolName: e.target.value ? TOOLS[e.target.value].n : ""});
      drawChk();
    });
    $("chkSubmit").addEventListener("click", submitChk);
    $("printDecl").addEventListener("click", doPrint);
  }
  drawChk();
  if (S.get("checklistPassed",false)) buildDecl();
}

function drawChk(){
  var tool = S.get("tool","");
  if (!tool) {
    $("chkList").innerHTML = ""; $("chkMeter").style.display = "none";
    $("chkGate").style.display = "none"; return;
  }
  $("chkMeter").style.display = "flex";
  $("chkGate").style.display = "flex";

  var ans = S.get("chkAns", {}), html = "", lastG = "";
  ITEMS.forEach(function(it,i){
    if (it.g !== lastG) { html += '<div class="eyebrow" style="margin-top:8px">'+it.g+"</div>"; lastG = it.g; }
    var st = ans[i];
    html += '<div class="item'+(st===true?" pass":(st===false?" fail":""))+'" data-i="'+i+'">'
      + '<button class="hd" type="button"><span class="ix">'+(st===true?"✓":("0"+(i+1)).slice(-2))+'</span>'
      + '<span class="qz"><span class="q">'+it.q
      + (it.must?' <span class="chip r">必要項</span>':"")+'</span>'
      + '<span class="why">'+it.why+'</span></span>'
      + '<span class="stt"><span class="chip '+(st===true?"g":(st===false?"r":""))+'">'
      + (st===true?"已達標":(st===false?"未達標":"未作答"))+'</span></span></button>'
      + '<div class="bd">';

    if (it.path) {
      var lbl = {train:"關閉訓練授權", keep:"查詢資料保留期", share:"管理分享連結"}[it.path];
      html += '<div class="path"><div class="t">'+TOOLS[tool].n+" ｜ "+lbl+"</div>"+TOOLS[tool][it.path]+"</div>";
    }
    if (it.type === "choice") {
      html += '<div class="stack s">' + it.o.map(function(o,j){
        return '<label class="opt"><input type="radio" name="q'+i+'" value="'+j+'">'
          + '<span>'+o[0]+'</span></label>'; }).join("") + "</div>";
    } else if (it.type === "num") {
      html += '<div class="inline-in"><input type="number" id="n'+i+'" min="'+it.lo+'" max="'+it.hi
        + '" step="1" placeholder="填入數字" inputmode="numeric">'
        + '<span class="u">'+it.unit+'</span>'
        + '<button class="btn pri sm" type="button" data-num="'+i+'">送出</button></div>';
    } else {
      html += '<div class="path">'+it.tip+'</div>'
        + '<div class="filepick"><input type="file" id="f'+i+'" accept="image/*,.pdf">'
        + '<span class="nm" id="fn'+i+'"></span></div>';
    }
    html += '<div class="fb" id="fb'+i+'"></div></div></div>';
  });
  $("chkList").innerHTML = html;
  paintChk();
}

function setAns(i, ok, msg){
  var ans = S.get("chkAns", {});
  ans[i] = ok; S.set("chkAns", ans);
  var card = $("chkList").querySelector('.item[data-i="'+i+'"]');
  card.classList.toggle("pass", ok); card.classList.toggle("fail", !ok);
  card.querySelector(".ix").textContent = ok ? "✓" : ("0"+(i+1)).slice(-2);
  card.querySelector(".stt").innerHTML = '<span class="chip '+(ok?"g":"r")+'">'+(ok?"已達標":"未達標")+"</span>";
  var fb = $("fb"+i);
  fb.className = "fb on " + (ok ? "ok" : "no");
  fb.innerHTML = msg;
  paintChk();
}

$("chkList").addEventListener("click", function(e){
  var hd = e.target.closest(".item > .hd");
  if (hd) { hd.parentElement.classList.toggle("open"); return; }
  var nb = e.target.closest("[data-num]");
  if (nb) {
    var i = +nb.getAttribute("data-num"), it = ITEMS[i], v = parseInt($("n"+i).value, 10);
    if (isNaN(v) || v < it.lo || v > it.hi) { setAns(i, false, it.no); return; }
    S.set("chkNum"+i, v);
    setAns(i, true, it.ok);
  }
});

$("chkList").addEventListener("change", function(e){
  var t = e.target;
  if (t.type === "radio") {
    var i = +t.name.slice(1), it = ITEMS[i];
    Array.prototype.forEach.call($("chkList").querySelectorAll('input[name="'+t.name+'"]'), function(x){
      x.parentElement.classList.toggle("picked", x.checked); });
    var o = it.o[+t.value];
    setAns(i, o[1], o[2]);
  } else if (t.type === "file" && t.files && t.files.length) {
    var idx = +t.id.slice(1);
    $("fn"+idx).textContent = "已選擇：" + t.files[0].name;
    setAns(idx, true, "佐證已附上（本原型僅於本機顯示檔名，<b>檔案不會離開您的裝置</b>）。正式系統中，此檔將隨核銷申請送交承辦人員存查。");
  }
});

function paintChk(){
  var ans = S.get("chkAns", {});
  var okN = ITEMS.filter(function(_,i){ return ans[i] === true; }).length;
  var pct = Math.round(okN/ITEMS.length*100);
  $("chkN").textContent = okN + " / " + ITEMS.length;
  var bar = $("chkBar");
  bar.style.width = pct + "%";
  bar.className = "fill " + (pct >= 100 ? "hi" : (pct >= 60 ? "mid" : ""));

  var left = ITEMS.length - okN;
  var mustLeft = ITEMS.filter(function(it,i){ return it.must && ans[i] !== true; }).length;
  var pass = left === 0;

  $("chkHint").textContent = pass ? "全數達標，可以送出核銷。"
    : "尚有 " + left + " 項未達標" + (mustLeft ? "（其中 "+mustLeft+" 項為必要項）" : "") + "。";
  $("gateT").textContent = pass ? "檢核通過，可以送出核銷" : "尚未達標，無法送出核銷";
  $("gateP").innerHTML = pass
    ? "12 項全數達標。送出後將產生<b>檢核聲明書</b>，隨核銷文件送交承辦人員存查。"
    : "請完成上方所有項目。每一項都可以重答，答錯會附上正確做法。";
  $("chkSubmit").disabled = !pass || S.get("checklistPassed",false);
}

function submitChk(){
  S.merge({checklistPassed:true, silver:true, checkedAt:fmt(new Date())});
  buildDecl();
  $("gateT").textContent = "核銷已送出";
  $("gateP").innerHTML = "檢核聲明書已產生（如下）。您可以列印或另存為 PDF 併入核銷文件。";
  $("chkSubmit").disabled = true;
  $("chkSubmit").textContent = "已送出";
  $("printDecl").style.display = "inline-flex";
  toast("核銷已送出，銀牌徽章已入帳");
  drawRail("checklist");
  $("decl").scrollIntoView({behavior:"smooth"});
}

function buildDecl(){
  var tool = S.get("tool","other");
  $("dCase").textContent = S.get("caseNo","YC-2026-0000");
  $("dName").textContent = (S.get("name","—") || "—") + "（" + S.get("pidMask","—") + "）";
  $("dTool").textContent = TOOLS[tool] ? TOOLS[tool].n : "—";
  $("dScore").textContent = "12 / 12 項全數達標　｜　檢核日期 " + S.get("checkedAt", fmt(new Date()));
  var qz = S.get("quizDone", false)
    ? ("已完成，" + (S.get("quizMisses",0) === 0 ? "全程未失手" : "失手 " + S.get("quizMisses",0) + " 次"))
    : "未完成";
  $("dQuiz").textContent = qz;
  $("dBadge").textContent = S.get("bronze",false)
    ? "銀牌（已完成微課程 5 則 ＋ 檢核清單 12 項）"
    : "銅牌（檢核清單 12 項達標；微課程尚未完成）";
  $("dItems").innerHTML = "<dl>" + ITEMS.map(function(it,i){
    return "<dt>" + ("0"+(i+1)).slice(-2) + ". " + it.q.replace(/<[^>]+>/g,"")
      + (it.must ? "（必要項）" : "") + "</dt><dd>✓ 已達標</dd>"; }).join("") + "</dl>";
  $("dDate").textContent = S.get("checkedAt", fmt(new Date()));
  $("decl").classList.add("on");
  $("printDecl").style.display = "inline-flex";
  $("chkSubmit").disabled = true;
  $("chkSubmit").textContent = "已送出";
}

