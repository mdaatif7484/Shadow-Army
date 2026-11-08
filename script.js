const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const STORE = { members: "shadowArmy_members_v2", battles: "shadowArmy_battles_v2", news: "shadowArmy_news_v2", apps: "shadowArmy_apps_v2" };

const starterMembers = [
  {id:"m1",name:"Shadow King",role:"Leader",level:2600,bounty:30,fruit:"Dragon",race:"Ghoul",wins:25},
  {id:"m2",name:"Dark Knight",role:"Co-Leader",level:2450,bounty:15,fruit:"Kitsune",race:"Cyborg",wins:18},
  {id:"m3",name:"Red Phantom",role:"Elite",level:2200,bounty:8.5,fruit:"Dough",race:"Shark",wins:12}
];
const starterBattles = [
  {id:"b1",player:"Shadow King",opponent:"Sea Hunter",result:"Win",date:"2026-10-20",notes:"Crew sparring match"},
  {id:"b2",player:"Dark Knight",opponent:"Crimson Blade",result:"Win",date:"2026-10-22",notes:"Friendly PvP"},
  {id:"b3",player:"Red Phantom",opponent:"Storm Fang",result:"Loss",date:"2026-10-24",notes:"Training match"}
];
const starterNews = [{id:"n1",title:"Welcome to Shadow Army",message:"Welcome to our crew. Train together, support each other, and keep growing stronger.",date:new Date().toISOString()}];

function load(key, fallback) {
  try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback; }
  catch { return fallback; }
}
let members = load(STORE.members, starterMembers);
let battles = load(STORE.battles, starterBattles);
let news = load(STORE.news, starterNews);
let applications = load(STORE.apps, []);
let isAdmin = false;

function saveAll() {
  localStorage.setItem(STORE.members, JSON.stringify(members));
  localStorage.setItem(STORE.battles, JSON.stringify(battles));
  localStorage.setItem(STORE.news, JSON.stringify(news));
  localStorage.setItem(STORE.apps, JSON.stringify(applications));
}
function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function money(value) { return `${Number(value).toLocaleString("en-IN",{maximumFractionDigits:1})}M`; }
function toast(message) {
  const box=$("#toast"); box.textContent=message; box.classList.add("show");
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>box.classList.remove("show"),2400);
}
function renderMembers() {
  const term=$("#memberSearch").value.trim().toLowerCase();
  const shown=members.filter(m=>[m.name,m.role,m.fruit,m.race].join(" ").toLowerCase().includes(term));
  $("#memberGrid").innerHTML=shown.map(m=>`
    <article class="member-card">
      <div class="member-top"><div class="avatar">${safe(m.name.charAt(0).toUpperCase())}</div><div><h3 class="member-name">${safe(m.name)}</h3><span class="member-role">${safe(m.role)}</span></div></div>
      <div class="member-meta">
        <div><span>LEVEL</span><strong>${Number(m.level).toLocaleString("en-IN")}</strong></div>
        <div><span>BOUNTY</span><strong>${money(m.bounty)}</strong></div>
        <div><span>FRUIT</span><strong>${safe(m.fruit)}</strong></div>
        <div><span>RACE</span><strong>${safe(m.race)}</strong></div>
      </div>
      ${isAdmin?`<div class="card-actions"><button class="small-btn" data-edit-member="${safe(m.id)}">Edit member</button></div>`:""}
    </article>`).join("");
  $("#memberEmpty").hidden=shown.length!==0;
  $$("[data-edit-member]").forEach(btn=>btn.addEventListener("click",()=>openMember(btn.dataset.editMember)));
}
function renderLeaderboard() {
  const sorted=[...members].sort((a,b)=>Number(b.bounty)-Number(a.bounty));
  $("#leaderboardBody").innerHTML=sorted.map((m,i)=>`<tr><td class="rank">#${i+1}</td><td><strong>${safe(m.name)}</strong></td><td>${Number(m.level).toLocaleString("en-IN")}</td><td>${safe(m.fruit)}</td><td>${money(m.bounty)}</td></tr>`).join("");
}
function renderBattles() {
  $("#battleGrid").innerHTML=battles.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(b=>`
    <article class="battle-card"><span class="battle-result ${b.result==="Win"?"win":"loss"}">${safe(b.result)}</span>
      <h3>${safe(b.player)} vs ${safe(b.opponent)}</h3><p>${safe(b.date)}</p><p>${safe(b.notes||"No notes added.")}</p>
      ${isAdmin?`<button class="small-btn" data-delete-battle="${safe(b.id)}">Delete record</button>`:""}
    </article>`).join("");
  $("#battleEmpty").hidden=battles.length!==0;
  $$("[data-delete-battle]").forEach(btn=>btn.addEventListener("click",()=>{battles=battles.filter(b=>b.id!==btn.dataset.deleteBattle);saveAll();render();toast("Battle record deleted.");}));
}
function renderNews() {
  $("#newsGrid").innerHTML=news.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).map(n=>`
    <article class="news-card"><span class="news-date">${new Date(n.date).toLocaleDateString()}</span><h3>${safe(n.title)}</h3><p>${safe(n.message)}</p>
    ${isAdmin?`<button class="small-btn" data-delete-news="${safe(n.id)}">Delete post</button>`:""}</article>`).join("");
  $$("[data-delete-news]").forEach(btn=>btn.addEventListener("click",()=>{news=news.filter(n=>n.id!==btn.dataset.deleteNews);saveAll();render();toast("Announcement deleted.");}));
}
function renderStats() {
  $("#totalMembers").textContent=members.length;
  $("#totalBounty").textContent=money(members.reduce((sum,m)=>sum+Number(m.bounty||0),0));
  $("#totalWins").textContent=battles.filter(b=>b.result==="Win").length;
  $("#totalNews").textContent=news.length;
}
function render() { renderMembers();renderLeaderboard();renderBattles();renderNews();renderStats(); }
function openDialog(id) { $(id).showModal(); }
function closeDialogs() { $$("dialog").forEach(d=>d.close()); }
function openMember(id=null) {
  const form=$("#memberForm");form.reset();
  form.elements.id.value="";
  $("#memberDialogTitle").textContent=id?"EDIT MEMBER":"ADD MEMBER";
  $("#deleteMemberBtn").style.display=id?"inline-flex":"none";
  if(id) {
    const m=members.find(x=>x.id===id); if(!m)return;
    Object.entries(m).forEach(([key,value])=>{if(form.elements[key])form.elements[key].value=value;});
  }
  openDialog("#memberDialog");
}

$("#adminToggle").addEventListener("click",()=>{
  isAdmin=!isAdmin;document.body.classList.toggle("admin-mode",isAdmin);
  $("#adminToggle").textContent=`Admin: ${isAdmin?"ON":"OFF"}`;
  render();toast(isAdmin?"Demo admin mode enabled.":"Admin mode disabled.");
  
const ADMIN_PASSWORD = "sommda@1234";

let adminMode = false;

const adminToggle = document.getElementById("adminToggle");

if (adminToggle) {
    adminToggle.addEventListener("click", () => {

        // If already logged in, turn Admin Mode off
        if (adminMode) {
            adminMode = false;
            adminToggle.textContent = "Admin Mode: OFF";
            alert("Admin Mode Disabled!");
            return;
        }

        // Ask for password
        const enteredPassword = prompt("Enter Admin Password:");

        if (enteredPassword === null) return;

        if (enteredPassword === ADMIN_PASSWORD) {
            adminMode = true;
            adminToggle.textContent = "Admin Mode: ON";
            alert("Welcome, Admin!");
        } else {
            alert("Incorrect Password!");
        }
    });
}

});
$("#addMemberBtn").addEventListener("click",()=>openMember());
$("#memberForm").addEventListener("submit",e=>{
  e.preventDefault();if(!isAdmin)return;
  const f=e.currentTarget;const data=Object.fromEntries(new FormData(f).entries());
  const member={id:data.id||crypto.randomUUID(),name:data.name.trim(),role:data.role.trim(),level:Number(data.level),bounty:Number(data.bounty),fruit:data.fruit.trim(),race:data.race.trim(),wins:Number(data.wins)};
  if(data.id)members=members.map(m=>m.id===data.id?member:m);else members.push(member);
  saveAll();render();closeDialogs();toast("Member saved.");
});
$("#deleteMemberBtn").addEventListener("click",()=>{
  const id=$("#memberForm").elements.id.value;if(!id||!isAdmin)return;
  members=members.filter(m=>m.id!==id);saveAll();render();closeDialogs();toast("Member deleted.");
});
$("#addBattleBtn").addEventListener("click",()=>openDialog("#battleDialog"));
$("#battleForm").addEventListener("submit",e=>{
  e.preventDefault();if(!isAdmin)return;
  const d=Object.fromEntries(new FormData(e.currentTarget).entries());
  battles.push({id:crypto.randomUUID(),...d});saveAll();render();e.currentTarget.reset();closeDialogs();toast("Battle record added.");
});
$("#addNewsBtn").addEventListener("click",()=>openDialog("#newsDialog"));
$("#newsForm").addEventListener("submit",e=>{
  e.preventDefault();if(!isAdmin)return;
  const d=Object.fromEntries(new FormData(e.currentTarget).entries());
  news.push({id:crypto.randomUUID(),...d,date:new Date().toISOString()});saveAll();render();e.currentTarget.reset();closeDialogs();toast("Announcement published.");
});
$("#memberSearch").addEventListener("input",renderMembers);
$("#joinForm").addEventListener("submit",e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());
  applications.push({...d,id:crypto.randomUUID(),date:new Date().toISOString()});saveAll();
  e.currentTarget.reset();$("#joinMessage").textContent="Application saved on this browser. Contact a crew admin to submit it online.";
});
$$("[data-close]").forEach(btn=>btn.addEventListener("click",closeDialogs));
$$("dialog").forEach(dialog=>dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();}));
$("#menuToggle").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
$$("nav a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));

render();
