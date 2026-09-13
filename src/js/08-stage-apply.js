/* ═══════════════════════════════════════════════════════════
   ① 申請 — 畫面與邏輯
   ═══════════════════════════════════════════════════════════ */
function formData(){
  var files = {};
  ATTACH.forEach(function(a){ files[a.id] = done.files ? done.files[a.id] : null; });
  var bdayRaw = $("f-bday").value;
  return {
    name:$("f-name").value.trim(),
    phone:$("f-phone").value.replace(/[^\d]/g,""),
    pid:$("f-pid").value.trim().toUpperCase(),
    bdayRaw:bdayRaw,
    mail:$("f-mail").value.trim(),
    hrCity:$("f-hrCity").value, hrDist:$("f-hrDist").value.trim(), hrAddr:$("f-hrAddr").value.trim(),
    mlCity:$("f-mlCity").value, mlDist:$("f-mlDist").value.trim(), mlAddr:$("f-mlAddr").value.trim(),
    same:$("f-same").checked,
    idType:$("f-idType").value,
    scheme:$("f-scheme").value, func:$("f-func").value,
    sw:$("f-sw").value.trim(), vendor:$("f-vendor").value.trim(),
    pdate:$("f-pdate").value, pmethod:$("f-pmethod").value,
    cur:$("f-cur").value,
    amt:parseFloat($("f-amt").value) || 0,
    twd:parseInt($("f-twd").value, 10) || 0,
    rate:FX[$("f-cur").value] || 0,
    voucher:VOUCHER.map(function(_,i){ var el = $("v"+i); return el ? el.checked : false; }),
    files:files
  };
}

function runAudit(){
  var d = formData();
  var rows = RULES.map(function(r){
    var res;
    if (r.async) {
      res = ASYNC[r.id] || W("待送出後由系統呼叫");
    } else {
      try { res = r.run(d); } catch(e){ res = W("待資料填寫完成"); }
    }
    var chip = res.s === "ok" ? "g" : (res.s === "no" ? "r" : "w");
    var mark = res.s === "ok" ? "✓ 通過" : (res.s === "no" ? "✕ 不符" : "◷ 待驗");
    var scope = r.scope === "local" ? "本機即時" : (r.scope === "api" ? "API 介接" : "人工審查");
    return '<div class="auditrow">'
      + '<span class="chip '+chip+'">'+mark+'</span>'
      + '<span class="ar-x"><span class="ar-l">'+r.label
      + ' <span class="chip">'+scope+'</span></span>'
      + '<span class="ar-m">'+esc(res.m)+'</span></span></div>';
  }).join("");
  $("auditList").innerHTML = rows;

  var okN = 0, noN = 0;
  RULES.forEach(function(r){
    var res = r.async ? (ASYNC[r.id] || W("")) : (function(){ try{ return r.run(d); }catch(e){ return W(""); } })();
    if (res.s === "ok") okN++; else if (res.s === "no") noN++;
  });
  $("auditCount").textContent = "通過 " + okN + " ／ 不符 " + noN + " ／ 共 " + RULES.length + " 項";
  return { ok:okN, no:noN, data:d };
}

function fillCounties(sel){
  var s = $(sel);
  s.innerHTML = '<option value="">請選擇</option>'
    + COUNTIES.map(function(c){ return '<option'+(c==="新竹市"?' value="新竹市"':'')+'>'+c+'</option>'; }).join("");
}
function fillDistricts(county, listId){
  API.districts(county).then(function(r){
    $(listId).innerHTML = r.list.map(function(d){ return '<option value="'+d+'"></option>'; }).join("");
  });
}

function renderApply(){
  paintCase();
  if (applyInit) return;
  applyInit = true;

  fillCounties("f-hrCity"); fillCounties("f-mlCity");
  $("f-hrCity").value = "新竹市";
  fillDistricts("新竹市", "dl-hrDist");

  /* 憑證檢核五項 */
  $("voucherList").innerHTML = VOUCHER.map(function(t,i){
    return '<label class="opt" for="v'+i+'"><input type="checkbox" id="v'+i+'"><span>'+t+'</span></label>';
  }).join("");

  /* 附件 */
  done.files = {};
  $("attachList").innerHTML = ATTACH.map(function(a){
    return '<div class="attach" data-a="'+a.id+'">'
      + '<div class="at-h"><span class="at-n">'+a.n+'</span>'
      + (a.req ? '<span class="chip r">必附</span>'
               : '<span class="chip w">特定對象必附</span>')+'</div>'
      + '<div class="at-hint">'+a.hint+'</div>'
      + '<div class="filepick"><input type="file" id="'+a.id+'" accept="image/jpeg,image/png,application/pdf">'
      + '<span class="nm" id="n-'+a.id+'"></span></div></div>';
  }).join("");

  /* ── 欄位監聽 ── */
  $("f-name").addEventListener("blur", function(e){
    var v = e.target.value.trim(); if(!v) return;
    if(v.length < 2){ fieldErr("name","姓名至少 2 個字，請填寫身分證上的全名。"); return; }
    fieldErr("name",""); done.name = v;
    echo("name", esc(v) + " 您好，我先幫您記下來了。");
  });

  $("f-phone").addEventListener("blur", function(e){
    var v = e.target.value.replace(/[^\d]/g,""); if(!v) return;
    if(!/^09\d{8}$/.test(v) && !/^0\d{7,9}$/.test(v)){
      fieldErr("phone","請填 09 開頭共 10 碼的手機，或含區碼的市話，例如 0351xxxxx。"); return; }
    fieldErr("phone",""); done.phone = v;
    echo("phone", (/^09/.test(v) ? v.slice(0,4)+"-"+v.slice(4,7)+"-"+v.slice(7) : v)
      + "，收到。有狀況我直接打給您。");
  });

  $("f-pid").addEventListener("input", function(e){ e.target.value = e.target.value.toUpperCase(); });
  $("f-pid").addEventListener("blur", function(e){
    var v = e.target.value.trim().toUpperCase(); if(!v) return;
    var r = checkPid(v);
    if(r === null){ fieldErr("pid","格式應為 1 個英文字母 + 1 或 2 + 8 位數字，例如 O123456789。");
      echo("pid","格式看起來不太對，請確認一次。",true); return; }
    if(r === false){ fieldErr("pid","檢查碼不符，請再核對一次號碼。");
      echo("pid","這組號碼的檢查碼不符，您是不是打錯了？",true); return; }
    /* 不以首碼判定資格，也不據以自動填入戶籍縣市——
       首碼是初次設籍地，遷籍後不會變更，自動帶入會誤導遷入者。 */
    fieldErr("pid", "");
    done.pid = v; done.firstCity = r.firstCity; done.sex = r.sex;
    echo("pid","身分核驗完成。這組號碼是在"+r.firstCity+"初次設籍的，"+r.sex+"，我一併記下了。");
  });

  $("f-bday").addEventListener("change", function(e){
    var v = e.target.value; if(!v) return;
    var a = ageOf(v);
    if(a < 0 || a > 120){ fieldErr("bday","請確認出生日期是否正確。"); return; }
    fieldErr("bday", (a < 18 || a > 40)
      ? "本計畫限 18 至 40 歲青年申請，您目前為 "+a+" 歲。展示模式仍可繼續填寫。" : "");
    done.bday = a;
    echo("bday", "今年 " + a + " 歲。" + v.slice(5).replace("-","/") + " 生日，到時候我提醒您。");
  });

  $("f-mail").addEventListener("blur", function(e){
    var v = e.target.value.trim(); if(!v) return;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){
      fieldErr("mail","請填寫完整的電子郵件，例如 you@example.com。"); return; }
    fieldErr("mail",""); done.mail = v;
    echo("mail", "之後所有通知都會寄到這裡，我存好了。");
  });

  /* 地址 */
  function onCity(p){
    var c = $("f-"+p+"City").value;
    fillDistricts(c, "dl-"+p+"Dist");
    $("f-"+p+"Dist").value = "";
  }
  $("f-hrCity").addEventListener("change", function(){ onCity("hr"); runAudit(); });
  $("f-mlCity").addEventListener("change", function(){ onCity("ml"); runAudit(); });

  $("f-hrAddr").addEventListener("blur", function(){
    var d = formData();
    if (!d.hrCity || !d.hrDist || !d.hrAddr) return;
    done.addr = d.hrCity + d.hrDist + d.hrAddr;
    echo("hrAddr", "住址我記下來了：" + esc(done.addr) + "。撥款通知會寄到這裡。");
  });

  $("f-same").addEventListener("change", function(e){
    $("mailAddrBox").style.display = e.target.checked ? "none" : "flex";
    runAudit();
  });

  $("f-idType").addEventListener("change", function(e){
    var t = e.target.value;
    echo("idType", t === "general"
      ? "一般青年，補助 50%、上限 3,000 元。"
      : "特定對象，補助 90%、上限 6,000 元，記得附上證明文件。");
    paintAttachReq();
    runAudit();
  });

  /* 購買工具 */
  $("f-sw").addEventListener("blur", function(e){
    var v = e.target.value.trim(); if(!v) return;
    done.sw = v;
    var k = guessTool(v);
    echo("sw", k ? "「"+esc(v)+"」我認得，等一下核銷的資安檢核清單會直接帶出它的設定路徑。"
                 : "「"+esc(v)+"」記下了。");
  });

  function recalc(){
    var cur = $("f-cur").value, amt = parseFloat($("f-amt").value) || 0;
    if (!amt) return;
    var rate = FX[cur] || 0;
    if (!rate) return;
    var twd = Math.round(amt * rate);
    if (cur === "TWD") { $("f-twd").value = Math.round(amt); }
    else if (!$("f-twd").dataset.touched) { $("f-twd").value = twd; }
    echo("twd", cur === "TWD" ? "新臺幣 " + twd.toLocaleString("en-US") + " 元。"
      : "依 1 " + cur + " ＝ " + rate + " 元（" + FX_SRC + "）換算，約新臺幣 "
        + twd.toLocaleString("en-US") + " 元。正式核銷以購買日臺灣銀行牌告匯率為準。");
    runAudit();
  }
  $("f-cur").addEventListener("change", recalc);
  $("f-amt").addEventListener("input", recalc);
  $("f-twd").addEventListener("input", function(e){ e.target.dataset.touched = "1"; runAudit(); });

  /* 憑證與附件 */
  $("voucherList").addEventListener("change", runAudit);

  $("attachList").addEventListener("change", function(e){
    var inp = e.target;
    if (inp.type !== "file" || !inp.files || !inp.files.length) return;
    var f = inp.files[0];
    var okType = /\.(jpe?g|png|pdf)$/i.test(f.name);
    var okSize = f.size <= 10 * 1024 * 1024;
    done.files[inp.id] = { name:f.name, size:f.size, bad: !okType || !okSize };
    $("n-"+inp.id).innerHTML = esc(f.name) + " · " + (f.size/1024).toFixed(0) + " KB"
      + (okType && okSize ? "" : ' <span class="chip r">'
        + (!okType ? "格式不符" : "超過 10MB") + "</span>");
    var meta = ATTACH.filter(function(a){ return a.id === inp.id; })[0];
    if (inp.id === "a-id") echo2("身分證正反面我收到了，兩面都很清楚，我幫您存好了。");
    if (inp.id === "a-bank") echo2("存摺封面也收到了，戶名和帳號我記下來了，撥款會匯到這裡。");
    runAudit();
  });

  $("submitBtn").addEventListener("click", onSubmit);

  /* 其他欄位一律觸發重新審核 */
  ["f-scheme","f-func","f-vendor","f-pdate","f-pmethod","f-hrDist","f-hrAddr","f-mlDist","f-mlAddr"]
    .forEach(function(id){
      var el = $(id); if (el) el.addEventListener("change", runAudit);
    });
  $("form").addEventListener("blur", runAudit, true);

  /* 載入匯率後再跑一次 */
  API.rates().then(function(r){ FX = r.rates; runAudit(); });

  paintAttachReq();
  runAudit();
}

/* 小幫手的額外發話（附件用） */
function echo2(msg){
  var tx = $("assistTx");
  tx.innerHTML = "<b>申辦小幫手</b>　" + msg;
  tx.parentElement.animate
    ? tx.parentElement.animate([{opacity:.4},{opacity:1}], {duration:420})
    : null;
}

function paintAttachReq(){
  var special = $("f-idType").value !== "general";
  var box = $("attachList").querySelector('[data-a="a-special"]');
  if (box) box.style.opacity = special ? "1" : ".55";
}

function guessTool(name){
  var s = (name || "").toLowerCase();
  if (s.indexOf("chatgpt") >= 0 || s.indexOf("openai") >= 0) return "chatgpt";
  if (s.indexOf("gemini") >= 0 || s.indexOf("google") >= 0) return "gemini";
  if (s.indexOf("claude") >= 0 || s.indexOf("anthropic") >= 0) return "claude";
  if (s.indexOf("copilot") >= 0 || s.indexOf("microsoft") >= 0) return "copilot";
  if (s.indexOf("midjourney") >= 0) return "midjourney";
  return "";
}

function onSubmit(){
  if (fired) {
    var a = runAudit();
    if (a.no > 0) {
      toast("尚有 " + a.no + " 項自動審核不符，請修正後再送出。");
      $("auditCard").scrollIntoView({behavior:"smooth", block:"center"});
      return;
    }
    submitCase(a.data);
    return;
  }
  var d = formData();
  var filled = [d.name, d.phone, d.pid, d.bdayRaw, d.mail].filter(function(x){ return x; }).length;
  if (filled < 3) { toast("請先完成「申請人基本資料」再送出。"); $("f-name").focus(); return; }
  blackout();
}

function buildRecap(){
  var d = formData();
  var f = function(id){ return done.files && done.files[id] ? done.files[id].name : null; };
  var rows = [
    ["姓名", d.name || "—"],
    ["出生日期", d.bdayRaw || "—"],
    ["聯絡電話", d.phone || "—"],
    ["電子郵件", d.mail || "—"],
    ["身分證字號", d.pid ? d.pid.slice(0,4)+"******" : "—"],
    ["戶籍地址", d.hrCity ? d.hrCity + d.hrDist + d.hrAddr : "—"]
  ];
  if (f("a-id"))   rows.push(["身分證影像", f("a-id")]);
  if (f("a-bank")) rows.push(["存摺封面", f("a-bank")]);

  $("recap").innerHTML = rows.map(function(r){
    return "<div><span>"+esc(r[0])+"</span>"+esc(r[1])+"</div>"; }).join("");

  var lines = [];
  if (d.pid && done.firstCity) {
    lines.push("而最後那句「這組號碼是在"+esc(done.firstCity)+"初次設籍的、"+esc(done.sex)
      +"」，不是我猜的。那組號碼的第一個字母就是您出生後首次申報戶口的縣市，"
      +"第二碼就是性別。您以為只填了一個欄位，它讀到的是一整組連您自己都沒想過會洩漏的資訊。");
  }
  if (f("a-id") && f("a-bank")) {
    lines.push("<b>而您剛剛還上傳了身分證正反面和存摺封面。</b>"
      + "這兩樣東西湊在一起，足以讓人以您的名義去辦門號、開帳戶、申辦貸款——"
      + "這正是人頭帳戶最常見的取得方式。市府的系統依法有保管責任；"
      + "把同樣兩張圖丟進 AI 對話框請它「幫我看看這份文件」，沒有任何人對它負責。");
  } else if (f("a-id") || f("a-bank")) {
    lines.push("<b>而您剛剛上傳了證件影像。</b>"
      + "證件照片一旦離開有保管責任的系統，就再也收不回來了。");
  }
  if (!lines.length) lines.push("您以為只填了幾個欄位，對方讀到的是一整組可以互相拼湊的資訊。");
  $("idLine").innerHTML = lines.join("<br><br>");
}

function openSheet(){
  $("term").classList.remove("on");
  $("modal").classList.add("on");
  requestAnimationFrame(function(){ $("modalSheet").classList.add("on"); });
  $("closeModal").focus();
}

function blackout(){
  if (fired) return;
  fired = true;
  buildRecap();

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { $("veil").classList.add("on"); openSheet(); return; }

  var pid = done.pid ? done.pid.slice(0,4)+"******" : "—";
  var dd = formData();
  var addr = dd.hrCity ? dd.hrCity + dd.hrDist + dd.hrAddr : "—";
  var fn = function(id){ return done.files && done.files[id] ? done.files[id].name : null; };

  var seq = [
    ["> 正在送出申請資料 ...", "dim", 260],
    ["> 姓名　　　　" + (dd.name || "—") + "　　[ 已擷取 ]", "", 190],
    ["> 出生日期　　" + (dd.bdayRaw || "—") + "　　[ 已擷取 ]", "", 170],
    ["> 聯絡電話　　" + (dd.phone || "—") + "　　[ 已擷取 ]", "", 170],
    ["> 電子郵件　　" + (dd.mail || "—") + "　　[ 已擷取 ]", "", 170],
    ["> 戶籍地址　　" + addr + "　　[ 已擷取 ]", "", 240],
    ["> 身分證字號　" + pid + "　　[ 已擷取 ]", "hit", 380]
  ];
  if (fn("a-id"))   seq.push(["> 附件　　　　" + fn("a-id") + "　　[ 影像已保存 ]", "hit", 380]);
  if (fn("a-bank")) seq.push(["> 附件　　　　" + fn("a-bank") + "　　[ 影像已保存 ]", "hit", 420]);
  seq.push(
    ["> 封包轉送中 ████████████████ 100%", "dim", 420],
    ["> 目的地：unknown-host.??? ", "hit", 520],
    ["> 對方留存期限：？？？　可否刪除：？？？", "hit", 760]
  );

  $("veil").classList.add("on");
  var term = $("term");
  term.className = "on"; term.innerHTML = "";

  var t = 700;
  seq.forEach(function(row){
    setTimeout(function(){
      term.insertAdjacentHTML("beforeend", '<div class="ln '+row[1]+'">'+esc(row[0])+"</div>");
    }, t);
    t += row[2];
  });
  setTimeout(function(){ term.classList.add("bad"); }, t);
  setTimeout(function(){
    term.insertAdjacentHTML("beforeend",
      '<div class="ln" style="margin-top:1.4em">&gt; 模擬傳輸結束</div>');
  }, t + 700);
  setTimeout(openSheet, t + 1500);
}

$("closeModal").addEventListener("click", function(){
  $("modalSheet").classList.remove("on");
  $("modal").classList.remove("on");
  $("veil").classList.remove("on");
  $("term").className = ""; $("term").innerHTML = "";
  $("banner").style.display = "flex";
  $("assistTx").innerHTML = "<b>申辦小幫手</b>　剩下的是購買工具與憑證資訊，不涉及您的個人身分資料，可以放心填寫。";
  $("submitBtn").textContent = "完成其餘欄位，正式送件";
  var nx = $("f-scheme"); if (nx) nx.focus();
});
$("guideFromModal").addEventListener("click", function(){
  $("closeModal").click();
  location.hash = "#/guide";
});

function submitCase(d){
  var no = "YC-2026-" + String(Math.floor(Math.random()*9000)+1000);
  S.merge({
    applied:true, caseNo:no,
    name:d.name, age:d.bdayRaw ? ageOf(d.bdayRaw) : null, bday:d.bdayRaw,
    phone:d.phone, mail:d.mail,
    pidMask: d.pid ? d.pid.slice(0,4)+"******" : "",
    firstCity: done.firstCity || "", hsinchu: d.hrCity === "新竹市",
    addr: d.hrCity ? d.hrCity + d.hrDist + d.hrAddr : "",
    mailAddr: d.same ? "同戶籍地址" : (d.mlCity + d.mlDist + d.mlAddr),
    idType:d.idType, scheme:d.scheme, func:d.func,
    sw:d.sw, vendor:d.vendor, pdate:d.pdate, pmethod:d.pmethod,
    cur:d.cur, amt:d.amt, twd:d.twd,
    tool: guessTool(d.sw) || S.get("tool",""),
    toolName: d.sw || S.get("toolName",""),
    appliedAt: fmt(new Date())
  });

  /* 送出後由系統呼叫外部介接，結果回填自動審核面板 */
  Promise.all([
    API.verifyInvoice({sw:d.sw, amt:d.amt, pdate:d.pdate}),
    API.verifyHousehold(d.pid, d.hrCity),
    API.checkDuplicate(d.pid),
    d.idType === "general" ? Promise.resolve(null) : API.verifyLowIncome(d.pid, d.idType)
  ]).then(function(r){
    ASYNC.einvoice  = r[0].valid ? OK("查驗相符（" + r[0].src + "）") : NO(r[0].reason || "查驗不符");
    ASYNC.household = r[1].valid ? OK("戶籍核驗通過：" + r[1].city) : NO(r[1].reason || "核驗不符");
    ASYNC.dup       = r[2].duplicated ? NO("本年度已有申請紀錄") : OK("無重複申請紀錄");
    ASYNC.lowinc    = r[3] === null ? OK("一般青年，無須查驗")
                    : (r[3].valid ? OK("資格查驗通過，" + r[3].note) : NO("查無特定對象資格"));
    S.set("auditAsync", ASYNC);
  });

  toast("申請已送出，案件編號 " + no);
  location.hash = "#/bind";
}

