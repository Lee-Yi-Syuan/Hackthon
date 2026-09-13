/* ═══════════════════════════════════════════════════════════
   ③ 審核
   ═══════════════════════════════════════════════════════════ */
var MC = [
  { t:"您的對話，預設是會被拿去訓練的", sec:"30 秒",
    p:"多數消費級 AI 服務的<b>預設值</b>是「可使用您的內容改善模型」。一旦被吸收進模型權重，它就不再是一筆可以刪除的資料列——您刪掉對話、登出帳號都沒有用，它已經是模型的一部分。",
    hT:"先做這件事",
    hB:"ChatGPT：<code>設定 → 資料控管 → 改善所有人的模型</code> 關閉。<br>Gemini：<code>設定 → Gemini 應用程式活動記錄</code> 關閉。<br>Claude：預設不以對話訓練模型，仍建議確認 <code>設定 → 隱私</code>。<br>企業／教育版通常預設不訓練，但<b>要看合約寫什麼，不要看行銷頁寫什麼</b>。",
    c:"<b>2023 年 11 月</b>：Google DeepMind 等研究團隊發表攻擊手法，只要讓 ChatGPT 不斷重複某個單字，模型就會「發散」並吐出訓練資料原文——其中包含真實姓名、電子郵件與電話號碼。這證明了訓練資料是<b>可以被誘出的</b>，不是存進去就安全。" },
  { t:"有五類資料，永遠不要貼進對話框", sec:"30 秒",
    p:"不是「個資都不能給」，是<b>分清楚在給誰</b>。有法律依據、有蒐集告知的政府或企業系統，該給就給；對話框裡的 AI，能不給就不給。",
    hT:"紅線清單",
    hB:"① 身分證字號、護照號碼<br>② 金融資訊：帳號、信用卡、存摺影本<br>③ 醫療與健保紀錄<br>④ <b>他人</b>的個資：客戶名單、員工資料、學生名冊<br>⑤ 公司未公開資訊：原始碼、報價、合約、內部簡報<br><br>第 ④ 項最常被忽略——您把客戶名單貼進去，外洩的是<b>別人的</b>個資，責任在您身上。",
    c:"<b>2023 年 4 月</b>：三星半導體部門員工將內部原始碼與會議記錄貼入 ChatGPT 尋求協助，短期內發生三起，三星隨後全面限制員工在公司裝置上使用生成式 AI。員工並非惡意，只是想把工作做快一點。" },
  { t:"「分享連結」等於公開網頁", sec:"30 秒",
    p:"AI 工具的「建立分享連結」很好用，但那個連結<b>沒有密碼、沒有到期日</b>。任何拿到網址的人都能看，而網址會從您貼過它的任何地方流出去——群組、信件、文件、書籤同步。",
    hT:"定期做這件事",
    hB:"① 分享前先想：這段對話裡有沒有第 2 則說的五類資料？<br>② 用完就刪：<code>設定 → 分享連結 → 管理</code>，逐一撤銷。<br>③ 需要給別人看，優先<b>複製文字</b>而不是給連結。",
    c:"<b>2025 年 8 月</b>：OpenAI 緊急下架 ChatGPT 中一項「讓分享的對話可被搜尋引擎檢索」的選項——大量使用者的私人對話被 Google 索引後可公開搜尋到。官方稱該功能「造成使用者意外分享的機會過高」。使用者以為分享給一個人，實際上分享給了整個網際網路。" },
  { t:"上傳檔案前，先把個資欄位清掉", sec:"30 秒",
    p:"「幫我分析這份 Excel」「幫我摘要這份 PDF」——最方便，也最容易一次外洩一整份名冊。檔案裡的每一欄都會進去，包括您根本沒要它看的那幾欄。",
    hT:"上傳前三個動作",
    hB:"① 刪欄：姓名、電話、地址、身分證號、email 全部刪掉，只留要分析的數值。<br>② 代碼化：真的需要區分個體，用 A001、A002 取代姓名。<br>③ <b>截圖也算上傳</b>：截圖前先確認畫面上沒有其他人的資料、沒有瀏覽器分頁標題、沒有側邊欄的客戶名稱。",
    c:"<b>2023 年 3 月</b>：ChatGPT 因所使用的開源函式庫 redis-py 出現錯誤，部分使用者在自己的介面上看見<b>其他人的對話標題</b>；OpenAI 後續確認約 1.2% 的 ChatGPT Plus 使用者，其姓名、電子郵件與信用卡末四碼曾短暫可被他人看見。您做對了所有設定，服務商的一個 bug 仍然會讓資料曝光——所以最根本的防線是「一開始就不要放進去」。" },
  { t:"拿補助買工具時，順便看一下合約", sec:"30 秒",
    p:"這是這份補助案特有的一則。您用市府補助款購買的工具，如果要拿來處理<b>客戶或雇主</b>的資料，個人版方案通常不夠——您需要的是有資料處理條款的版本。",
    hT:"下單前確認三件事",
    hB:"① <b>是否以您的資料訓練模型</b>：企業版多數承諾不訓練，個人版多數預設訓練。<br>② <b>資料保留期</b>：查明留存多久、能否要求刪除、刪除多久生效。<br>③ <b>資料存放地與適用法律</b>：資料在哪個國家、出事時依哪一國法律處理。<br><br>這三項的答案，核銷時的檢核清單會問您。",
    c:"<b>為什麼市府要管到這裡</b>：補助款買的工具若造成青年自身、其雇主或客戶的資料外洩，就成了「補助卻造成傷害」的政策反效果。把這三個問題放在購買前，成本是三分鐘；放在外洩後，成本是一個人的信用與一間公司的商譽。" }
];

var reviewInit = false;

function renderReview(){
  paintCase();
  S.set("reviewed", true);

  var applied = S.get("appliedAt", fmt(new Date()));
  var steps = [
    ["收件", applied, "done", "線上申請送出，系統編號建立。"],
    ["資格核驗", fmt(workday(1)), "done", "設籍新竹市、年齡 18–40、無重複申請 — 自動勾稽通過。"],
    ["文件審查", fmt(workday(2)), "now", "承辦人員審查計畫內容與工具用途合理性。"],
    ["核定公告", fmt(workday(5)), "", "核定結果以 LINE 推播，同步公告於青年發展中心網站。"],
    ["可辦理核銷", fmt(workday(6)), "", "取得核定後購買工具，檢附發票與資安檢核清單辦理核銷。"],
    ["撥款", fmt(workday(16)), "", "核銷通過後排入主計批次，入帳後推播通知。"]
  ];
  $("reviewTl").innerHTML = steps.map(function(s){
    return '<li class="'+s[2]+'"><div class="k">'+s[0]
      + (s[2]==="now" ? ' <span class="chip a">進行中</span>' : "")
      + '</div><div class="d">'+s[1]+'</div><div class="m">'+s[3]+'</div></li>';
  }).join("");

  if (!reviewInit) {
    reviewInit = true;

    buildMcList();

    $("mcList").addEventListener("click", function(e){
      var h = e.target.closest(".mc > .hd"); if (!h) return;
      var card = h.parentElement, i = +card.getAttribute("data-i");
      card.classList.toggle("open");
      var r = S.get("mcRead", []);
      if (r.indexOf(i) < 0) {
        r.push(i); S.set("mcRead", r);
        card.classList.add("read");
        card.querySelector(".ix").textContent = "✓";
        paintMc();
      }
    });

    $("adminBtn").addEventListener("click", function(){
      var box = $("adminBox"), on = box.style.display === "none";
      box.style.display = on ? "flex" : "none";
      $("adminBtn").textContent = on ? "收合承辦端後台" : "展開承辦端後台（示意）";
    });
    $("adminJump").addEventListener("click", function(){
      $("adminBox").style.display = "flex";
      $("adminBtn").textContent = "收合承辦端後台";
      $("adminSec").scrollIntoView({behavior:"smooth"});
    });
  }

  paintMc();
  paintAdmin();
}

/* 微課程卡片的 HTML 由狀態長出來，重置後要能重畫（監聽器綁在容器上，不會重複） */
function buildMcList(){
  var read = S.get("mcRead", []);
  $("mcList").innerHTML = MC.map(function(m,i){
    return '<div class="mc'+(read.indexOf(i)>=0?" read":"")+'" data-i="'+i+'">'
      + '<button class="hd" type="button"><span class="ix">'+(read.indexOf(i)>=0?"✓":(i+1))+'</span>'
      + '<span class="ti">'+m.t+'</span><span class="sec">'+m.sec+'</span></button>'
      + '<div class="bd"><p>'+m.p+'</p>'
      + '<div class="path"><div class="t">'+m.hT+'</div>'+m.hB+'</div>'
      + '<div class="incident">'+m.c+'</div></div></div>';
  }).join("");
}

function paintMc(){
  var r = S.get("mcRead", []), pct = Math.round(r.length/MC.length*100);
  $("mcN").textContent = r.length + " / " + MC.length;
  var bar = $("mcBar");
  bar.style.width = pct + "%";
  bar.className = "fill " + (pct >= 100 ? "hi" : (pct >= 50 ? "mid" : ""));
  if (r.length >= MC.length) {
    S.set("bronze", true);
    $("mcDone").style.display = "flex";
    $("mcHint").textContent = "已全部讀畢。銅牌徽章已入帳。";
  } else {
    $("mcDone").style.display = "none";
    $("mcHint").textContent = "還差 " + (MC.length - r.length) + " 則。點開任一則即視為讀畢。";
  }
}

function paintAdmin(){
  var caseNo = S.get("caseNo","YC-2026-0000");
  var mine = (S.get("name","申請人") || "申請人").slice(0,1) + "**";
  var rows = [
    {no:caseNo, who:mine, pid:S.get("pidMask","O123******"), mine:true,
     f:["ok","ok","ok","wait"], chk:"wait", st:"文件審查中"},
    {no:"YC-2026-2841", who:"林**", pid:"O222******", f:["ok","ok","ok","ok"], chk:"ok", st:"已撥款"},
    {no:"YC-2026-3317", who:"黃**", pid:"O112******", f:["ok","ok","ok","no"], chk:"wait", st:"退回補件"},
    {no:"YC-2026-5520", who:"吳**", pid:"O223******", f:["ok","ok","ok","ok"], chk:"no", st:"待補檢核"},
    {no:"YC-2026-6093", who:"陳**", pid:"O223******", f:["ok","ok","ok","ok"], chk:"ok", st:"核銷通過"}
  ];
  var cell = function(v){
    return v==="ok" ? '<span class="chip g">✓ 通過</span>'
         : v==="no" ? '<span class="chip r">✕ 不符</span>'
                    : '<span class="chip w">◷ 待驗</span>'; };
  $("adminRows").innerHTML = rows.map(function(r){
    return '<tr'+(r.mine?' class="hl"':"")+'>'
      + '<td class="mono">'+esc(r.no)+(r.mine?' <span class="chip a">本案</span>':"")+'</td>'
      + '<td>'+esc(r.who)+'<br><span class="mono" style="font-size:11px;color:var(--ink-3)">'+esc(r.pid)+'</span></td>'
      + r.f.map(function(x){ return "<td>"+cell(x)+"</td>"; }).join("")
      + '<td>'+cell(r.chk)+'</td><td>'+esc(r.st)+'</td></tr>';
  }).join("");
}

