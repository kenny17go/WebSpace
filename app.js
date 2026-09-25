let allApps=[],active="All";const $=s=>document.querySelector(s);
async function init(){try{const defaults=await fetch("./apps.json",{cache:"no-store"}).then(r=>r.json());let custom=[];try{custom=JSON.parse(localStorage.getItem("webspace-custom-apps")||"[]")}catch{}allApps=[...defaults,...custom].filter(a=>!hiddenIds().includes(a.id));applySavedOrder();renderFilters();render();renderDock();const mc=$("#mobileCount");if(mc)mc.textContent=`${allApps.length} apps`}catch(e){$("#apps").innerHTML="<p>Unable to load apps.</p>"}}
function recentIds(){try{return JSON.parse(localStorage.getItem("webspace-recent")||"[]")}catch{return[]}}
function hiddenIds(){try{return JSON.parse(localStorage.getItem("webspace-hidden-apps")||"[]")}catch{return[]}}
function updateCount(){const mc=$("#mobileCount");if(mc)mc.textContent=`${allApps.length} apps`}
function persistCustom(){try{localStorage.setItem("webspace-custom-apps",JSON.stringify(allApps.filter(a=>a.custom)))}catch{}}
function removeApp(id){const a=allApps.find(x=>x.id===id);if(!a)return;if(a.custom){allApps=allApps.filter(x=>x.id!==id);persistCustom()}else{const h=[...new Set([...hiddenIds(),id])];localStorage.setItem("webspace-hidden-apps",JSON.stringify(h));allApps=allApps.filter(x=>x.id!==id)}saveAppOrder();render();updateCount();setEditMode(true)}
function addCustomApp(name,url){try{const u=new URL(url);const a={id:"custom-"+Date.now(),name:name.trim()||u.hostname.replace(/^www\./,""),description:"Custom web app",category:"Custom",url:u.href,iconUrl:u.origin+"/favicon.ico",custom:true};allApps.push(a);persistCustom();saveAppOrder();render();updateCount();setEditMode(true);return true}catch{return false}}
function renderFilters(){const cats=["All",...new Set(allApps.map(a=>a.category))];$("#filters").innerHTML=cats.map(c=>`<button class="${c===active?"active":""}" data-cat="${c}">${c}</button>`).join("");$("#filters").onclick=e=>{if(!e.target.dataset.cat)return;active=e.target.dataset.cat;renderFilters();render()}}
function iconMarkup(a){if(a.iconUrl)return `<img src="${a.iconUrl}" alt="">`;return a.icon||"W"}
function card(a){return `<button class="card" data-id="${a.id}" style="--tint:${a.tint}"><span class="remove-app" data-remove="${a.id}" aria-label="Remove">−</span><div class="icon">${iconMarkup(a)}</div><h3>${a.name}</h3><p>${a.description}</p><span class="tag">${a.category}</span></button>`}
function applySavedOrder(){try{const order=JSON.parse(localStorage.getItem("webspace-app-order")||"[]");if(!order.length)return;const rank=new Map(order.map((id,i)=>[id,i]));allApps.sort((a,b)=>(rank.get(a.id)??999)-(rank.get(b.id)??999))}catch{}}
function saveAppOrder(){try{localStorage.setItem("webspace-app-order",JSON.stringify(allApps.map(a=>a.id)))}catch{}}
function render(){const search=$("#search"),q=search?search.value.trim().toLowerCase():"";const apps=allApps.filter(a=>(active==="All"||a.category===active)&&(!q||[a.name,a.description,a.category].join(" ").toLowerCase().includes(q)));$("#empty").hidden=!!apps.length;$("#apps").innerHTML=apps.map(card).join("")}
function renderDock(){const ids=recentIds();const open=allApps.filter(a=>ids.includes(a.id)).slice(0,5);$("#dock").innerHTML=open.map(a=>`<button data-id="${a.id}" title="${a.name}" style="--tint:${a.tint}">${iconMarkup(a)}</button>`).join("");$("#dock").classList.toggle("show",open.length>0)}
function openApp(id){const a=allApps.find(x=>x.id===id);if(!a)return;const phone=window.matchMedia("(max-width: 600px) and (pointer: coarse)").matches;if(phone||a.open==="external"){window.location.href=a.url;return}$("#viewerTitle").textContent=a.name;$("#viewerUrl").textContent=a.url;$("#external").href=a.url;$("#viewer").hidden=false;document.body.style.overflow="hidden";$("#frame").src=a.url;try{const recent=recentIds().filter(x=>x!==id);localStorage.setItem("webspace-recent",JSON.stringify([id,...recent].slice(0,6)));renderDock()}catch{}}
function closeApp(){$("#viewer").hidden=true;$("#frame").src="about:blank";document.body.style.overflow="";render()}
function appClick(e){const c=e.target.closest(".card");if(c)openApp(c.dataset.id)}
const appsEl=$("#apps"),dockEl=$("#dock"),closeEl=$("#close"),aboutEl=$("#about"),modalCloseEl=$("#modalClose"),modalEl=$("#modal"),search=$("#search");if(appsEl)appsEl.onclick=appClick;if(dockEl)dockEl.onclick=appClick;if(search)search.addEventListener("input",render);if(closeEl)closeEl.onclick=closeApp;if(aboutEl)aboutEl.onclick=()=>{if(modalEl)modalEl.hidden=false};if(modalCloseEl)modalCloseEl.onclick=()=>{if(modalEl)modalEl.hidden=true};if(modalEl)modalEl.onclick=e=>{if(e.target.id==="modal")modalEl.hidden=true};document.addEventListener("keydown",e=>{if(e.key==="Escape")closeApp()});init();
let draggedId=null,longPressTimer=null,touchDragId=null,lastSwapId=null;
function setEditMode(on){document.body.classList.toggle("home-edit",on);if(edit)edit.textContent=on?"Done":"•••";const add=$("#addApp");if(add)add.hidden=!on;document.querySelectorAll(".card").forEach(c=>c.draggable=on)}
const edit=$("#editHome");if(edit)edit.onclick=()=>setEditMode(!document.body.classList.contains("home-edit"));
function moveAppBefore(fromId,toId){if(!fromId||!toId||fromId===toId)return;const from=allApps.findIndex(a=>a.id===fromId),to=allApps.findIndex(a=>a.id===toId);if(from<0||to<0)return;const [m]=allApps.splice(from,1);allApps.splice(to,0,m);saveAppOrder();render();setEditMode(true)}
if(appsEl){
 appsEl.addEventListener("pointerdown",e=>{const c=e.target.closest(".card");if(!c)return;if(document.body.classList.contains("home-edit")){touchDragId=c.dataset.id;lastSwapId=c.dataset.id;c.setPointerCapture?.(e.pointerId);e.preventDefault();return}longPressTimer=setTimeout(()=>{setEditMode(true);touchDragId=c.dataset.id;lastSwapId=c.dataset.id},550)});
 appsEl.addEventListener("pointermove",e=>{clearTimeout(longPressTimer);if(!touchDragId||!document.body.classList.contains("home-edit"))return;e.preventDefault();const el=document.elementFromPoint(e.clientX,e.clientY),target=el?.closest(".card");if(target&&target.dataset.id!==touchDragId&&target.dataset.id!==lastSwapId){lastSwapId=target.dataset.id;moveAppBefore(touchDragId,target.dataset.id)}});
 const stopTouchDrag=()=>{clearTimeout(longPressTimer);touchDragId=null;lastSwapId=null};
 appsEl.addEventListener("pointerup",stopTouchDrag);appsEl.addEventListener("pointercancel",stopTouchDrag);
 appsEl.addEventListener("dragstart",e=>{if(!document.body.classList.contains("home-edit"))return e.preventDefault();const c=e.target.closest(".card");if(!c)return;draggedId=c.dataset.id;c.classList.add("dragging");e.dataTransfer.effectAllowed="move"});
 appsEl.addEventListener("dragend",e=>{e.target.closest(".card")?.classList.remove("dragging");draggedId=null});
 appsEl.addEventListener("dragover",e=>{if(!draggedId)return;e.preventDefault();const target=e.target.closest(".card");if(target)moveAppBefore(draggedId,target.dataset.id)});
 appsEl.addEventListener("click",e=>{const r=e.target.closest("[data-remove]");if(r&&document.body.classList.contains("home-edit")){e.preventDefault();e.stopImmediatePropagation();removeApp(r.dataset.remove);return}if(document.body.classList.contains("home-edit"))e.stopImmediatePropagation()},true);
}
const addAppBtn=$("#addApp"),addModal=$("#addModal"),addClose=$("#addClose"),addSave=$("#addSave");
if(addAppBtn)addAppBtn.onclick=()=>{if(addModal)addModal.hidden=false};
if(addClose)addClose.onclick=()=>{if(addModal)addModal.hidden=true};
if(addModal)addModal.onclick=e=>{if(e.target===addModal)addModal.hidden=true};
if(addSave)addSave.onclick=()=>{const n=$("#addName"),u=$("#addUrl");if(addCustomApp(n?.value||"",u?.value||"")){if(n)n.value="";if(u)u.value="";addModal.hidden=true}else{u?.focus()}};
function updateHomeClock(){const d=new Date();const t=$("#homeTime"),dt=$("#homeDate");if(t)t.textContent=d.toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit",hour12:false});if(dt)dt.textContent=d.toLocaleDateString("zh-TW",{month:"long",day:"numeric",weekday:"short"})}updateHomeClock();setInterval(updateHomeClock,30000);
const homeWx=(c,d=1)=>c===0?[d?"☀️":"🌙","晴朗"]:c<=2?[d?"🌤️":"☁️","晴時多雲"]:c===3?["☁️","陰天"]:c<=48?["🌫️","霧"]:c<=57?["🌦️","毛毛雨"]:c<=67?["🌧️","雨"]:c<=77?["🌨️","雪"]:c<=82?["🌦️","陣雨"]:c<=86?["🌨️","陣雪"]:["⛈️","雷雨"];
async function loadHomeWeather(){
 const set=(s,v)=>{const e=$(s);if(e)e.textContent=v};
 const fetchWx=async(latitude,longitude)=>{
  const q=new URLSearchParams({latitude,longitude,timezone:"auto",forecast_days:"1",current:"temperature_2m,is_day,weather_code",daily:"temperature_2m_max,temperature_2m_min"});
  const r=await fetch("https://api.open-meteo.com/v1/forecast?"+q);if(!r.ok)throw Error("weather");
  const x=await r.json(),w=homeWx(+x.current.weather_code,+x.current.is_day);
  set("#homeWeatherIcon",w[0]);set("#homeTemp",Math.round(x.current.temperature_2m)+"°");set("#homeWeatherText",w[1]);
  set("#homeRange","H:"+Math.round(x.daily.temperature_2m_max[0])+"° L:"+Math.round(x.daily.temperature_2m_min[0])+"°");
  localStorage.setItem("webspace-weather",JSON.stringify({at:Date.now(),latitude,longitude}));
 };
 try{
  const cached=JSON.parse(localStorage.getItem("webspace-weather")||"null");
  if(cached&&Date.now()-cached.at<15*60*1000){await fetchWx(cached.latitude,cached.longitude);return}
  if(!navigator.geolocation)throw Error("geo");
  const p=await new Promise((ok,no)=>navigator.geolocation.getCurrentPosition(ok,no,{enableHighAccuracy:false,timeout:10000,maximumAge:900000}));
  await fetchWx(p.coords.latitude,p.coords.longitude);
 }catch(e){
  set("#homeWeatherIcon","☁️");set("#homeTemp","--°");set("#homeWeatherText","天氣暫時無法取得");set("#homeRange","Weather Compare 可查看完整預報");
 }
}
setTimeout(loadHomeWeather,0);setInterval(loadHomeWeather,15*60*1000);
