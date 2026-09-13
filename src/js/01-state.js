
"use strict";

/* ═══════════════════════════════════════════════════════════
   狀態：localStorage，失敗時降級為記憶體
   ═══════════════════════════════════════════════════════════ */
var KEY = "hc-ai-subsidy-v2", mem = null;
function readS(){
  if (mem) return mem;
  try { var r = localStorage.getItem(KEY); return r ? JSON.parse(r) : {}; }
  catch(e){ mem = {}; return mem; }
}
function writeS(s){
  if (mem) { mem = s; return; }
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){ mem = s; }
}
var S = {
  get: function(k,d){ var v = readS()[k]; return (v === undefined || v === null) ? d : v; },
  set: function(k,v){ var s = readS(); s[k] = v; writeS(s); return v; },
  merge: function(o){ var s = readS(); for (var k in o) if (o.hasOwnProperty(k)) s[k] = o[k]; writeS(s); },
  reset: function(){ mem = null; try{ localStorage.removeItem(KEY); }catch(e){ mem = {}; } }
};

var $  = function(id){ return document.getElementById(id); };
var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };

function fmt(d){ var p=function(x){return (x<10?"0":"")+x;};
  return d.getFullYear()+"/"+p(d.getMonth()+1)+"/"+p(d.getDate()); }
function workday(n){
  var d=new Date(), step=n<0?-1:1, left=Math.abs(n);
  while(left>0){ d.setDate(d.getDate()+step); var w=d.getDay(); if(w!==0&&w!==6) left--; }
  return d;
}
var toastT;
function toast(msg){
  var t=$("toast"); t.textContent=msg; t.classList.add("on");
  clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove("on"); },2600);
}

/* 沙箱化的 iframe 可能擋掉列印對話框，擋掉時告訴使用者替代做法 */
function doPrint(){
  var framed = true;
  try { framed = window.self !== window.top; } catch(e){ framed = true; }
  try {
    window.print();
    if (framed) setTimeout(function(){
      toast("若沒有跳出列印視窗，請先以新分頁開啟本頁，再按 Ctrl／Cmd + P");
    }, 900);
  } catch(e){
    toast("此環境擋住了列印對話框，請以新分頁開啟本頁後按 Ctrl／Cmd + P");
  }
}

/* ═══ 主題 ═══ */
(function(){
  var saved = S.get("theme","");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  $("themeBtn").addEventListener("click", function(){
    var cur = document.documentElement.getAttribute("data-theme");
    var next = cur === "dark" ? "light" : (cur === "light" ? "dark"
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark"));
    document.documentElement.setAttribute("data-theme", next);
    S.set("theme", next);
  });
})();

