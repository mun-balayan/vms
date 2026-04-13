// ═══════════════════════════════════════
// VMS — Utility / Helper Functions
// Loaded as a plain script (before app.js module)
// so all functions are available globally.
// ═══════════════════════════════════════

function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function closeOverlay(e,id){if(e.target.id===id)closeModal(id);}
window.openModal=openModal;
window.closeModal=closeModal;
window.closeOverlay=closeOverlay;

function fmtDate(d){
  if(!d||d==='null')return '';
  const s=String(d);
  if(s.includes('00:00:00')||s.includes('T')){
    const dt=new Date(s);
    if(isNaN(dt))return s.substring(0,10);
    return dt.toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'});
  }
  return s.substring(0,10);
}

function parseAmt(s){return parseFloat(String(s||0).replace(/[,\s]/g,''))||0;}

function parseParts(str){
  if(!str)return [];
  return str.split(';').map(p=>{
    const[name,qty,unit,price]=p.split('|');
    return{name:(name||'').trim(),qty:(qty||'').trim(),unit:(unit||'').trim(),price:(price||'0').trim()};
  }).filter(p=>p.name&&p.name!=='-'&&p.name!=='undefined');
}

function dr(label,val,cls=''){
  if(!val||val==='null'||val==='undefined'||String(val).trim()==='')return '';
  return `<div class="detail-row"><span class="detail-label">${label}</span><span class="detail-value ${cls?'detail-'+cls:''}">${val}</span></div>`;
}

function ea(s){return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function eh(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

let toastTimer;
function toast(msg,type='success'){
  const el=document.getElementById('toast');
  const icon=type==='success'
    ?'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10" cy="10" r="8"/><path d="M6 10l3 3 5-5"/></svg>'
    :'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 7v4M10 13v.5"/></svg>';
  el.innerHTML=icon+msg;
  el.className=`toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),3000);
}

window.fmtDate=fmtDate;
window.parseAmt=parseAmt;
window.parseParts=parseParts;
window.dr=dr;
window.ea=ea;
window.eh=eh;
window.toast=toast;
