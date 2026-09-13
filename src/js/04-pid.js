/* ═══════════════════════════════════════════════════════════
   ① 申請
   ═══════════════════════════════════════════════════════════ */
var CITY = {A:"臺北市",B:"臺中市",C:"基隆市",D:"臺南市",E:"高雄市",F:"新北市",G:"宜蘭縣",H:"桃園市",
 I:"嘉義市",J:"新竹縣",K:"苗栗縣",L:"臺中縣",M:"南投縣",N:"彰化縣",O:"新竹市",P:"雲林縣",Q:"嘉義縣",
 R:"臺南縣",S:"高雄縣",T:"屏東縣",U:"花蓮縣",V:"臺東縣",W:"金門縣",X:"澎湖縣",Y:"陽明山",Z:"連江縣"};
var LV = {A:10,B:11,C:12,D:13,E:14,F:15,G:16,H:17,I:34,J:18,K:19,L:20,M:21,N:22,O:35,P:23,Q:24,
 R:25,S:26,T:27,U:28,V:29,W:32,X:30,Y:31,Z:33};

function checkPid(v){
  if(!/^[A-Z][12][0-9]{8}$/.test(v)) return null;
  var n = LV[v[0]], sum = Math.floor(n/10) + (n%10)*9;
  for(var i=1;i<=8;i++) sum += (+v[i]) * (9-i);
  sum += (+v[9]);
  if(sum % 10 !== 0) return false;
  /* 首碼代表「初次設籍地」——出生後首次申報戶口的縣市。
     它不是出生地：在臺北出生、父母在臺中縣報戶口者，首碼為 L。
     它也不是現在的戶籍地：遷籍之後首碼永遠不會變更。
     所以絕不可用來判定補助資格，只能當參考資訊。
     設籍資格一律以「戶籍地址」欄位認定，並由戶政介接做權威核驗。
     欄位刻意命名為 firstCity / firstRegHsinchu，讓誤用一眼可見。 */
  return { firstCity: CITY[v[0]], sex: v[1] === "1" ? "男性" : "女性",
           firstRegHsinchu: v[0] === "O" };
}
function ageOf(d){
  var b=new Date(d), t=new Date(), a=t.getFullYear()-b.getFullYear(), m=t.getMonth()-b.getMonth();
  if(m<0 || (m===0 && t.getDate()<b.getDate())) a--;
  return a;
}

var done = {}, fired = false, applyInit = false;

function echo(id, text, warn){
  var el = $("e-"+id);
  el.className = "echo" + (warn ? " warn" : "");
  el.innerHTML = '<span class="b">AI</span><span>'+text+'</span>';
  requestAnimationFrame(function(){ el.classList.add("on"); });
}
function fieldErr(id, msg){
  var e = $("e-"+id+"-err"), inp = $("f-"+id);
  if (msg) { e.textContent = msg; e.classList.add("on"); if(inp) inp.setAttribute("aria-invalid","true"); }
  else { e.classList.remove("on"); if(inp) inp.removeAttribute("aria-invalid"); }
}

