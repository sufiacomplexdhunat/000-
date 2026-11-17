const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='rent_manager_free_v1';
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{admin:{phone:'01700000000',password:'ChangeMe123!'},units:[],tenants:[],charges:[],payments:[]};
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function money(n){return '৳'+Number(n||0).toLocaleString('en-US')}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function tenant(id){return db.tenants.find(t=>t.id===id)}
function balance(tid){let c=db.charges.filter(x=>x.tenant===tid&&x.type!=='জামানত').reduce((a,x)=>a+x.amount,0),p=db.payments.filter(x=>x.tenant===tid&&x.type!=='জামানত').reduce((a,x)=>a+x.amount,0);return c-p}

// ভাড়াটিয়া সার্চ ও আলাদা প্রোফাইল প্যানেল
function setupTenantSearch(){
 const list=$('#tenantList'); if(!list||$('#tenantSearch')) return;
 const search=document.createElement('div'); search.className='search-tools';
 search.innerHTML='<input id="tenantSearch" type="search" placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..." aria-label="ভাড়াটিয়া খুঁজুন" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #bbb;border-radius:8px;margin:8px 0">';
 list.parentNode.insertBefore(search,list);
 const profile=document.createElement('section');profile.id='tenantProfile';profile.hidden=true;profile.style.cssText='border:1px solid #bbb;border-radius:10px;padding:14px;margin:12px 0;background:#fff';
 list.parentNode.insertBefore(profile,list);
 $('#tenantSearch').addEventListener('input',render);
}
window.viewTenantProfile=function(tid){
 const t=tenant(tid);if(!t)return;
 const u=db.units.find(x=>x.id===t.unit)||{};
 const charges=db.charges.filter(x=>x.tenant===tid);
 const payments=db.payments.filter(x=>x.tenant===tid);
 const box=$('#tenantProfile');if(!box)return;
 box.hidden=false;
 box.innerHTML=`<div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><h3>ভাড়াটিয়ার প্রোফাইল</h3><button onclick="document.getElementById('tenantProfile').hidden=true">বন্ধ করুন</button></div>
 <p><b>নাম:</b> ${esc(t.name)}</p><p><b>মোবাইল:</b> ${esc(t.phone)}</p>
 <p><b>বাড়ি:</b> ${esc(u.name||'')} · <b>ইউনিট:</b> ${esc(u.unit||'')}</p>
 <p><b>মাসিক ভাড়া:</b> ${money(t.rent)} · <b>অগ্রিম জামানত:</b> ${money(t.deposit)}</p>
 <p><b>বর্তমান বকেয়া:</b> ${money(balance(tid))}</p>
 <h4>বিল ও চার্জ</h4>${charges.map(c=>`<div class="item">${esc(c.month)} · ${esc(c.type)} <b>${money(c.amount)}</b></div>`).join('')||'<p>কোনো বিল যোগ করা হয়নি।</p>'}
 <h4>পেমেন্ট ইতিহাস</h4>${payments.map(p=>`<div class="item">${esc(p.date)} · ${esc(p.type)} · ${money(p.amount)} ${esc(p.note||'')}</div>`).join('')||'<p>কোনো পেমেন্ট নেই।</p>'}`;
 box.scrollIntoView({behavior:'smooth',block:'start'});
};
function showTab(name){$$('.tab').forEach(x=>x.hidden=x.id!==name);$$('.tabs button').forEach(x=>x.classList.toggle('active',x.dataset.tab===name))}
function login(){let p=$('#loginPhone').value.trim(),pw=$('#loginPass').value;if(p===db.admin.phone&&pw===db.admin.password){$('#login').hidden=true;$('#app').hidden=false;$('#tenantView').hidden=true;render()}else{let t=db.tenants.find(x=>x.phone===p&&x.password===pw);if(t){$('#login').hidden=true;$('#app').hidden=true;$('#tenantView').hidden=false;tenantPage(t)}else alert('মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।')}}
$('#loginBtn').onclick=login;$('#loginPass').addEventListener('keydown',e=>{if(e.key==='Enter')login()});
$$('.tabs button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
$('#houseForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);db.units.push({id:id(),name:f.get('name'),address:f.get('address'),unit:f.get('unit')});e.target.reset();save()};
$('#tenantForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);if(!db.units.some(u=>u.id===f.get('unit')))return alert('আগে বাড়ি/ফ্ল্যাট যোগ করুন');db.tenants.push({id:id(),name:f.get('name'),phone:f.get('phone'),unit:f.get('unit'),rent:+f.get('rent'),deposit:+f.get('deposit')});e.target.reset();save()};
$('#chargeForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);db.charges.push({id:id(),tenant:f.get('tenant'),month:f.get('month'),type:f.get('type'),amount:+f.get('amount')});e.target.reset();save()};
$('#paymentForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);db.payments.push({id:id(),tenant:f.get('tenant'),date:f.get('date'),type:f.get('type'),amount:+f.get('amount'),note:f.get('note')});e.target.reset();save()};
$('#passwordForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);db.admin={phone:f.get('phone'),password:f.get('password')};save();alert('অ্যাডমিন লগইন পরিবর্তন হয়েছে')};
$('#logoutBtn').onclick=()=>{location.reload()};$('#tenantLogout').onclick=()=>location.reload();
$('#exportBtn').onclick=()=>{let a=document.createElement('a'),blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});a.href=URL.createObjectURL(blob);a.download='bari-bhara-backup.json';a.click();URL.revokeObjectURL(a.href)};
$('#importFile').onchange=e=>{let file=e.target.files[0];if(!file)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x.admin||!Array.isArray(x.tenants)||!Array.isArray(x.units))throw 0;if(confirm('বর্তমান ডেটা প্রতিস্থাপন করে ব্যাকআপ ফিরিয়ে আনবেন?')){db=x;save();alert('ব্যাকআপ ফিরিয়ে আনা হয়েছে')}}catch{alert('ব্যাকআপ ফাইলটি সঠিক নয়')}};r.readAsText(file)};
function render(){setupTenantSearch();let due=db.tenants.reduce((a,t)=>a+balance(t.id),0),rent=db.tenants.reduce((a,t)=>a+t.rent,0),paid=db.payments.reduce((a,p)=>a+p.amount,0);$('#stats').innerHTML=`<div class="stat"><b>${db.units.length}</b><span>ইউনিট</span></div><div class="stat"><b>${db.tenants.length}</b><span>ভাড়াটিয়া</span></div><div class="stat"><b>${money(rent)}</b><span>মাসিক নির্ধারিত ভাড়া</span></div><div class="stat"><b>${money(due)}</b><span>মোট বকেয়া (হিসাবভুক্ত)</span></div><div class="stat"><b>${money(paid)}</b><span>মোট আদায়</span></div>`;
$('#houseList').innerHTML=db.units.map(u=>`<div class="item"><div><b>${esc(u.name)} · ${esc(u.unit)}</b><small>${esc(u.address)}</small></div><button class="danger" onclick="delUnit('${u.id}')">মুছুন</button></div>`).join('')||'<p class="muted">এখনো কোনো ইউনিট যোগ হয়নি।</p>';
let opts=db.units.map(u=>`<option value="${u.id}">${esc(u.name)} · ${esc(u.unit)}</option>`).join('');$('#tenantUnit').innerHTML=opts;
let tops=db.tenants.map(t=>`<option value="${t.id}">${esc(t.name)} (${esc(t.phone)})</option>`).join('');$('#chargeTenant').innerHTML=tops;$('#paymentTenant').innerHTML=tops;
const q=($('#tenantSearch')?.value||'').trim().toLowerCase();
$('#tenantList').innerHTML=db.tenants.filter(t=>{let u=db.units.find(x=>x.id===t.unit);return !q||t.name.toLowerCase().includes(q)||t.phone.toLowerCase().includes(q)||(u?.name||'').toLowerCase().includes(q)||(u?.unit||'').toLowerCase().includes(q)}).map(t=>{let u=db.units.find(x=>x.id===t.unit);return `<div class="item"><div><b>${esc(t.name)}</b><small>${esc(t.phone)} · ${esc(u?.name||'')} ${esc(u?.unit||'')} · মাসিক ভাড়া ${money(t.rent)} · বকেয়া ${money(balance(t.id))}</small></div><div><button onclick="viewTenantProfile('${t.id}')">প্রোফাইল</button> <button class="danger" onclick="delTenant('${t.id}')">মুছুন</button></div></div>`}).join('')||'<p class="muted">কোনো ভাড়াটিয়া পাওয়া যায়নি।</p>';
let rows=[...db.payments.map(p=>({...p,kind:'পেমেন্ট'})),...db.charges.map(c=>({...c,kind:'বিল',date:c.month}))].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
$('#accountList').innerHTML=rows.map(x=>`<div class="item"><div><b>${esc(tenant(x.tenant)?.name||'অজানা')} · ${esc(x.kind)} (${esc(x.type)})</b><small>${esc(x.date)} ${esc(x.note||'')}</small></div><div><b>${money(x.amount)}</b>${x.kind==='পেমেন্ট'?`<br><button onclick="printReceipt('${x.id}')">রসিদ PDF</button>`:''}</div></div>`).join('')||'<p class="muted">কোনো হিসাব নেই।</p>';
$('#recent').innerHTML=db.tenants.slice(-5).map(t=>`<div class="item"><div><b>${esc(t.name)}</b><small>${esc(t.phone)}</small></div><b>${money(balance(t.id))}</b></div>`).join('')||'<p class="muted">ভাড়াটিয়ার তথ্য যোগ করলে এখানে দেখা যাবে।</p>';
}
window.printReceipt=function(paymentId){
 const p=db.payments.find(x=>x.id===paymentId);if(!p)return alert('পেমেন্ট পাওয়া যায়নি');
 const t=tenant(p.tenant);if(!t)return alert('ভাড়াটিয়ার তথ্য পাওয়া যায়নি');
 const u=db.units.find(x=>x.id===t.unit)||{};
 const w=window.open('','_blank');if(!w)return alert('পপ-আপ বন্ধ আছে। Chrome সেটিংসে পপ-আপ অনুমতি দিন।');
 const receiptNo='R-'+String(p.id||'').slice(-8).toUpperCase();
 w.document.write(`<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ভাড়া আদায়ের রসিদ</title><style>body{font-family:Arial,'Noto Sans Bengali',sans-serif;padding:24px;color:#111}.receipt{max-width:680px;margin:auto;border:1px solid #222;padding:24px}h2,p{text-align:center;margin:6px}h3{margin-top:24px;text-align:center}.line{display:flex;justify-content:space-between;border-bottom:1px dashed #aaa;padding:12px 0;gap:12px}.amount{font-size:22px;font-weight:bold}.foot{margin-top:40px;display:flex;justify-content:space-between}.print{text-align:center;margin:20px}@media print{.print{display:none}body{padding:0}.receipt{border:1px solid #222}}</style></head><body><div class="receipt"><h2>বাড়ি ভাড়া আদায়ের রসিদ</h2><p>${esc(u.name||'বাড়িওয়ালার বাড়ি')}</p><p>${esc(u.address||'')}</p><h3>পেমেন্ট রসিদ</h3><div class="line"><span>রসিদ নম্বর</span><b>${esc(receiptNo)}</b></div><div class="line"><span>ভাড়াটিয়ার নাম</span><b>${esc(t.name)}</b></div><div class="line"><span>মোবাইল</span><b>${esc(t.phone)}</b></div><div class="line"><span>ফ্ল্যাট / ইউনিট</span><b>${esc(u.unit||'')}</b></div><div class="line"><span>পরিশোধের তারিখ</span><b>${esc(p.date)}</b></div><div class="line"><span>জমার খাত</span><b>${esc(p.type)}</b></div><div class="line"><span>বিবরণ</span><b>${esc(p.note||'—')}</b></div><div class="line amount"><span>মোট জমা</span><b>${money(p.amount)}</b></div><div class="foot"><span>গ্রহণকারীর স্বাক্ষর: __________</span><span>ভাড়াটিয়ার স্বাক্ষর: __________</span></div></div><div class="print"><button onclick="window.print()">প্রিন্ট / Save as PDF</button></div></body></html>`);
 w.document.close();w.focus();
};
window.delUnit=x=>{if(db.tenants.some(t=>t.unit===x))return alert('এই ইউনিটে ভাড়াটিয়া আছে। আগে ভাড়াটিয়ার তথ্য সরান।');if(confirm('ইউনিটটি মুছবেন?')){db.units=db.units.filter(u=>u.id!==x);save()}};
window.delTenant=x=>{if(confirm('ভাড়াটিয়া ও তার হিসাব মুছবেন?')){db.tenants=db.tenants.filter(t=>t.id!==x);db.charges=db.charges.filter(c=>c.tenant!==x);db.payments=db.payments.filter(p=>p.tenant!==x);save()}};
function tenantPage(t){let u=db.units.find(x=>x.id===t.unit),charges=db.charges.filter(x=>x.tenant===t.id),payments=db.payments.filter(x=>x.tenant===t.id);$('#tenantStatement').innerHTML=`<h3>${esc(t.name)}</h3><p>${esc(u?.name||'')} · ${esc(u?.unit||'')}</p><div class="stat"><b>${money(balance(t.id))}</b><span>বর্তমান বকেয়া</span></div><h3>বিল</h3>${charges.map(c=>`<div class="item">${esc(c.month)} · ${esc(c.type)} <b>${money(c.amount)}</b></div>`).join('')||'কোনো বিল নেই'}<h3>পেমেন্ট</h3>${payments.map(p=>`<div class="item">${esc(p.date)} · ${esc(p.type)} <b>${money(p.amount)}</b></div>`).join('')||'কোনো পেমেন্ট নেই'}<button onclick="window.print()">হিসাব প্রিন্ট / PDF</button>`}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
let deferred;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('#installBtn').hidden=false});$('#installBtn').onclick=async()=>{if(deferred){deferred.prompt();deferred=null}else alert('Chrome মেনু থেকে Add to Home screen নির্বাচন করুন।')};
const now=new Date();$('#chargeForm [name=month]').value=now.toISOString().slice(0,7);$('#paymentForm [name=date]').value=now.toISOString().slice(0,10);
