const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],KEY='rent_manager_free_v1';
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{admin:{phone:'01700000000',password:'ChangeMe123!'},units:[],tenants:[],charges:[],payments:[],receiptSeq:0};
db.units||=[];db.tenants||=[];db.charges||=[];db.payments||=[];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7),monthNow=()=>{let d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')},money=n=>'৳'+Number(n||0).toLocaleString('bn-BD');
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function room(t){let old=db.units.find(u=>u.id===t.unit);return old?old.unit:(t.unit||'—')}
function tname(id){return db.tenants.find(t=>t.id===id)?.name||'অজানা'}
function allocations(){
 const paid={}; db.charges.forEach(c=>paid[c.id]=0);
 db.payments.filter(p=>p.chargeId).forEach(p=>{if(paid[p.chargeId]!==undefined)paid[p.chargeId]+=Number(p.amount||0)});
 const legacy=db.payments.filter(p=>!p.chargeId).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
 legacy.forEach(p=>{
  let left=Number(p.amount||0);
  const matches=db.charges.filter(c=>c.tenant===p.tenant&&c.month===p.month&&c.type===p.type);
  for(const c of matches){let due=Math.max(0,Number(c.amount||0)-paid[c.id]);if(!due)continue;let use=Math.min(left,due);paid[c.id]+=use;left-=use;if(left<=0)break}
 });
 return paid;
}
function paidFor(c){return allocations()[c.id]||0}
function totals(id){let c=db.charges.filter(x=>x.tenant===id).reduce((a,x)=>a+Number(x.amount||0),0),p=db.payments.filter(x=>x.tenant===id).reduce((a,x)=>a+Number(x.amount||0),0);return{charge:c,paid:p,due:c-p}}
function ensureBills(){
 const current=monthNow();
 const monthList=[];
 if(db.autoLastMonth){
  let [y,m]=db.autoLastMonth.split('-').map(Number);m++;
  while(y*100+m<=Number(current.replace('-',''))){if(m>12){m=1;y++}monthList.push(`${y}-${String(m).padStart(2,'0')}`);m++}
 }else monthList.push(current);
 if(!monthList.includes(current))monthList.push(current);
 monthList.forEach(month=>db.tenants.forEach(t=>{
  if(Number(t.rent)>0&&!db.charges.some(c=>c.tenant===t.id&&c.month===month&&c.type==='ভাড়া'))
   db.charges.push({id:uid(),tenant:t.id,month,type:'ভাড়া',amount:Number(t.rent)});
 }));
 db.autoLastMonth=current;localStorage.setItem(KEY,JSON.stringify(db));
}
function showTab(id){$$('.page').forEach(x=>x.hidden=x.id!==id);$$('nav button').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));render()}
function render(){ $('#sTenants').textContent=db.tenants.length.toLocaleString('bn-BD');$('#sDue').textContent=money(db.tenants.reduce((a,t)=>a+Math.max(0,totals(t.id).due),0));$('#sPaid').textContent=money(db.payments.reduce((a,p)=>a+Number(p.amount||0),0));renderTenants();renderBills();renderReceipts();$('#certTenant').innerHTML=db.tenants.map(t=>`<option value="${t.id}">${esc(t.name)} — ${esc(room(t))}</option>`).join('')}
function clearForm(){$('#tenantForm').reset();$('#tenantId').value='';$('#tenantFormTitle').textContent='নতুন ভাড়াটিয়া যোগ'}
function renderTenants(){let q=($('#tenantSearch').value||'').toLowerCase();let a=db.tenants.filter(t=>[t.name,t.accountNo,t.phone,t.address,t.nid,room(t)].join(' ').toLowerCase().includes(q));$('#tenantList').innerHTML=a.map(t=>`<div class="tenant"><div class="row"><div><h3>${esc(t.name)}</h3><div>হিসাব: ${esc(t.accountNo||'—')} | রুম: ${esc(room(t))}</div><div>মোবাইল: ${esc(t.phone||'—')} | ভাড়া: ${money(t.rent)} | বকেয়া: ${money(Math.max(0,totals(t.id).due))}</div></div><div><button class="smallbtn" onclick="profile('${t.id}')">বিস্তারিত</button><button class="smallbtn secondary" onclick="editTenant('${t.id}')">সম্পাদনা</button></div></div></div>`).join('')||'<p>কোনো ভাড়াটিয়া পাওয়া যায়নি।</p>'}
$('#tenantForm').onsubmit=e=>{e.preventDefault();let id=$('#tenantId').value,t={id:id||uid(),accountNo:$('#accountNo').value.trim(),name:$('#name').value.trim(),phone:$('#phone').value.trim(),address:$('#address').value.trim(),nid:$('#nid').value.trim(),unit:$('#unit').value.trim(),rent:Number($('#rent').value),deposit:Number($('#deposit').value||0)};if(id){let i=db.tenants.findIndex(x=>x.id===id);if(i>=0)db.tenants[i]=t}else{db.tenants.push(t);if(t.rent)db.charges.push({id:uid(),tenant:t.id,month:monthNow(),type:'ভাড়া',amount:t.rent})}save();clearForm();alert('তথ্য সংরক্ষণ হয়েছে')};
function editTenant(id){let t=db.tenants.find(x=>x.id===id);$('#tenantId').value=t.id;['accountNo','name','phone','address','nid','rent','deposit'].forEach(k=>$('#'+k).value=t[k]??'');$('#unit').value=room(t);$('#tenantFormTitle').textContent='ভাড়াটিয়ার তথ্য সম্পাদনা';window.scrollTo(0,0)}
function profile(id){let t=db.tenants.find(x=>x.id===id),b=totals(id);$('#modalBody').innerHTML=`<h2>${esc(t.name)}</h2><p>হিসাব নম্বর: ${esc(t.accountNo||'—')}</p><p>বাসা/রুম: ${esc(room(t))}</p><p>মোবাইল: ${esc(t.phone||'—')}</p><p>ঠিকানা: ${esc(t.address||'—')}</p><p>জাতীয় পরিচয়পত্র: ${esc(t.nid||'—')}</p><p>মাসিক ভাড়া: ${money(t.rent)} | জমা: ${money(t.deposit)}</p><p>মোট বিল: ${money(b.charge)} | আদায়: ${money(b.paid)} | বকেয়া: ${money(Math.max(0,b.due))}</p><label>অগ্রিম বিলের পরিমাণ<input id="advanceAmount" type="number" min="1"></label><button onclick="addAdvance('${id}')">অগ্রিম বিল যোগ</button> <button class="secondary" onclick="printTenant('${id}')">তথ্য প্রিন্ট</button>`;$('#modal').hidden=false}
function addAdvance(id){let n=Number($('#advanceAmount').value);if(!n)return alert('টাকার পরিমাণ লিখুন');db.charges.push({id:uid(),tenant:id,month:monthNow(),type:'অগ্রিম',amount:n});save();profile(id)}
function printHTML(html){
 let w=window.open('','_blank');
 if(!w){alert('প্রিন্ট পেজ খোলা যায়নি। ব্রাউজারের Pop-ups অনুমতি দিন, তারপর আবার চেষ্টা করুন।');return}
 w.document.open();
 w.document.write(`<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>প্রিন্ট</title><style>body{font-family:system-ui,'Noto Sans Bengali',sans-serif;padding:12px;color:#111}.receipt-paper{border:1px solid #333;padding:10px;height:125mm;margin:0 0 3mm;break-inside:avoid}.receipt-paper h3{text-align:center;margin:2px}.receipt-paper p{margin:5px 0}@media print{body{padding:0}}</style></head><body>${html}<script>window.onload=()=>setTimeout(()=>window.print(),350)<\/script></body></html>`);
 w.document.close();w.focus();
}
function printTenant(id){let t=db.tenants.find(x=>x.id===id);printHTML(`<h2>ভাড়াটিয়ার তথ্য</h2><p>নাম: ${esc(t.name)}</p><p>হিসাব নম্বর: ${esc(t.accountNo||'—')}</p><p>রুম: ${esc(room(t))}</p><p>মোবাইল: ${esc(t.phone||'—')}</p><p>ঠিকানা: ${esc(t.address||'—')}</p><p>এনআইডি: ${esc(t.nid||'—')}</p><p>মাসিক ভাড়া: ${money(t.rent)}</p><p>জমা: ${money(t.deposit)}</p>`)}
function renderBills(){let a=db.charges.map(c=>({...c,paid:paidFor(c)})).filter(c=>Number(c.amount)>c.paid);$('#billList').innerHTML=a.map(c=>`<div class="bill"><div class="row"><div><b>${esc(tname(c.tenant))}</b><div>${esc(c.month)} | ${esc(c.type)} | বিল ${money(c.amount)} | বাকি ${money(c.amount-c.paid)}</div></div><button class="smallbtn" onclick="collect('${c.id}')">ভাড়া আদায়</button></div></div>`).join('')||'<p>কোনো বকেয়া বিল নেই।</p>'}
function collect(id){
 const c=db.charges.find(x=>x.id===id);if(!c)return;
 const left=Number(c.amount)-paidFor(c);
 $('#modalBody').innerHTML=`<h3>ভাড়া আদায়</h3><p>${esc(tname(c.tenant))} — ${esc(c.month)} (${esc(c.type)})</p><p>বকেয়া: <b>${money(left)}</b></p><label>আদায়ের পরিমাণ<input id="collectAmount" type="number" min="1" max="${left}" value="${left}"></label><button onclick="confirmCollect('${id}')">আদায় সংরক্ষণ</button>`;
 $('#modal').hidden=false;
}
function confirmCollect(id){
 const c=db.charges.find(x=>x.id===id);if(!c)return;
 const left=Number(c.amount)-paidFor(c),n=Number($('#collectAmount').value);
 if(!Number.isFinite(n)||n<=0||n>left){alert('সঠিক আদায়ের পরিমাণ লিখুন।');return}
 let no=String(++db.receiptSeq).padStart(4,'0');
 const payment={id:uid(),chargeId:c.id,tenant:c.tenant,date:new Date().toISOString().slice(0,10),month:c.month,type:c.type,amount:n,receiptNo:no};
 db.payments.push(payment);save();$('#modal').hidden=true;alert('ভাড়া আদায় সংরক্ষণ হয়েছে। রসিদ মেনু থেকে প্রিন্ট করুন।');
}
function receiptMarkup(p,copy){let t=db.tenants.find(x=>x.id===p.tenant)||{};return `<div class="receipt-paper"><h3>সুফিয়া কমপ্লেক্স</h3><p style="text-align:center">ভাড়া আদায়ের রসিদ — ${copy}</p><hr><p>রসিদ নং: ${esc(p.receiptNo)} | তারিখ: ${esc(p.date)}</p><p>ভাড়াটিয়া: ${esc(t.name||'')}</p><p>হিসাব: ${esc(t.accountNo||'—')} | রুম: ${esc(room(t))}</p><p>মাস: ${esc(p.month)} | বিবরণ: ${esc(p.type)}</p><p>আদায়কৃত টাকা: <b>${money(p.amount)}</b></p><p>গ্রহণকারীর স্বাক্ষর: __________________</p></div>`}
function printReceipt(id){let p=db.payments.find(x=>x.id===id);printHTML(receiptMarkup(p,'ভাড়াটিয়ার কপি')+receiptMarkup(p,'মালিকের কপি'))}
function renderReceipts(){$('#receiptList').innerHTML=[...db.payments].reverse().map(p=>`<div class="receipt"><div class="row"><div><b>রসিদ নং ${esc(p.receiptNo)}</b><div>${esc(tname(p.tenant))} | ${esc(p.date)} | ${money(p.amount)}</div></div><button class="smallbtn" onclick="printReceipt('${p.id}')">পুনরায় প্রিন্ট</button></div></div>`).join('')||'<p>এখনো কোনো রসিদ নেই।</p>'}
$('#printCert').onclick=()=>{let t=db.tenants.find(x=>x.id===$('#certTenant').value);if(!t)return alert('আগে ভাড়াটিয়া যোগ করুন');printHTML(`<h2 style="text-align:center">প্রত্যয়নপত্র</h2><p>এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, ${esc(t.name)}, বাসা/রুম নম্বর ${esc(room(t))}-এ ভাড়াটিয়া হিসেবে বসবাস করছেন।</p><p>বিষয়: ${esc($('#certPurpose').value)}</p><p>প্রয়োজনীয় কাজে ব্যবহারের জন্য এই প্রত্যয়নপত্র প্রদান করা হলো।</p><p style="margin-top:70px">তারিখ: ____________ <span style="float:right">বাড়িওয়ালার স্বাক্ষর</span></p>`)}
$('#backupBtn').onclick=()=>{let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}));a.download='sufia-rent-backup.json';a.click();URL.revokeObjectURL(a.href)};
$('#restoreFile').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let d=JSON.parse(r.result);if(!d.tenants||!d.charges||!d.payments)throw 0;if(!confirm('বর্তমান ডাটা প্রতিস্থাপন করবেন?'))return;db=d;localStorage.setItem(KEY,JSON.stringify(db));render();alert('ব্যাকআপ ফিরিয়ে আনা হয়েছে')}catch{alert('সঠিক ব্যাকআপ ফাইল নয়')}};r.readAsText(f)};
$('#saveLogin').onclick=()=>{if($('#newPhone').value.trim())db.admin.phone=$('#newPhone').value.trim();if($('#newPass').value)db.admin.password=$('#newPass').value;save();alert('লগইন তথ্য সংরক্ষণ হয়েছে')};
$('#tenantSearch').oninput=renderTenants;$('#clearTenant').onclick=clearForm;$('#closeModal').onclick=()=>$('#modal').hidden=true;$$('nav button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));$('#loginBtn').onclick=()=>{if($('#loginPhone').value===db.admin.phone&&$('#loginPass').value===db.admin.password){sessionStorage.setItem('rentLogged','1');start()}else alert('মোবাইল বা পাসওয়ার্ড সঠিক নয়')};$('#logoutBtn').onclick=()=>{sessionStorage.removeItem('rentLogged');location.reload()};
function start(){$('#login').hidden=true;$('#app').hidden=false;ensureBills();render()}
if(sessionStorage.getItem('rentLogged'))start();if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
