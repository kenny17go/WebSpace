let allApps=[],active="All";const $=s=>document.querySelector(s);
async function init(){try{const defaults=await fetch("./apps.json",{cache:"no-store"}).then(r=>r.json());let custom=[];try{custom=JSON.parse(localStorage.getItem("webspace-custom-apps")||"[]")}catch{}allApps=[...defaults,...custom].filter(a=>!hiddenIds().includes(a.id));applySavedOrder();renderFilters();render();const mc=$("#mobileCount");if(mc)mc.textContent=`${allApps.length} apps`}catch(e){$("#apps").innerHTML="<p>Unable to load apps.</p>"}}
function hiddenIds(){try{return JSON.parse(localStorage.getItem("webspace-hidden-apps")||"[]")}catch{return[]}}
function updateCount(){const mc=$("#mobileCount");if(mc)mc.textContent=`${allApps.length} apps`}
function persistCustom(){try{localStorage.setItem("webspace-custom-apps",JSON.stringify(allApps.filter(a=>a.custom)))}catch{}}
function removeApp(id){const a=allApps.find(x=>x.id===id);if(!a)return;if(a.custom){allApps=allApps.filter(x=>x.id!==id);persistCustom()}else{const h=[...new Set([...hiddenIds(),id])];localStorage.setItem("webspace-hidden-apps",JSON.stringify(h));allApps=allApps.filter(x=>x.id!==id)}saveAppOrder();render();updateCount();setEditMode(true)}
function addCustomApp(name,url){try{const u=new URL(url);const a={id:"custom-"+Date.now(),name:name.trim()||u.hostname.replace(/^www\./,""),description:"Custom web app",category:"Custom",url:u.href,iconUrl:"https://www.google.com/s2/favicons?domain_url="+encodeURIComponent(u.origin)+"&sz=128",custom:true};allApps.push(a);persistCustom();saveAppOrder();render();updateCount();setEditMode(true);return true}catch{return false}}
function renderFilters(){const cats=["All",...new Set(allApps.map(a=>a.category))];$("#filters").innerHTML=cats.map(c=>`<button class="${c===active?"active":""}" data-cat="${c}">${c}</button>`).join("");$("#filters").onclick=e=>{if(!e.target.dataset.cat)return;active=e.target.dataset.cat;renderFilters();render()}}
function customFavicon(a){try{return "https://www.google.com/s2/favicons?domain_url="+encodeURIComponent(new URL(a.url).origin)+"&sz=128"}catch{return a.iconUrl||""}}
function iconMarkup(a){const src=a.custom?customFavicon(a):a.iconUrl;if(src)return `<img src="${src}" alt="" onerror="this.style.display='none';this.parentElement.textContent='🌐'">`;return a.icon||"🌐"}
function card(a){return `<button class="card" data-id="${a.id}" style="--tint:${a.tint}"><span class="remove-app" data-remove="${a.id}" aria-label="Remove">−</span><div class="icon">${iconMarkup(a)}</div><h3>${a.name}</h3><p>${a.description}</p><span class="tag">${a.category}</span></button>`}
function applySavedOrder(){try{const order=JSON.parse(localStorage.getItem("webspace-app-order")||"[]");if(!order.length)return;const rank=new Map(order.map((id,i)=>[id,i]));allApps.sort((a,b)=>(rank.get(a.id)??999)-(rank.get(b.id)??999))}catch{}}
function saveAppOrder(){try{localStorage.setItem("webspace-app-order",JSON.stringify(allApps.map(a=>a.id)))}catch{}}
function render(){const search=$("#search"),q=search?search.value.trim().toLowerCase():"";const apps=allApps.filter(a=>(active==="All"||a.category===active)&&(!q||[a.name,a.description,a.category].join(" ").toLowerCase().includes(q)));$("#empty").hidden=!!apps.length;const mobile=$("#apps"),desktop=$("#desktopApps");if(mobile)mobile.innerHTML=apps.map(card).join("");if(desktop)desktop.innerHTML=apps.map(card).join("");if(document.body.classList.contains("home-edit"))setEditMode(true)}
function openApp(id){const a=allApps.find(x=>x.id===id);if(!a)return;const phone=window.matchMedia("(max-width: 600px) and (pointer: coarse)").matches;if(phone||a.open==="external"){window.location.href=a.url;return}$("#viewerTitle").textContent=a.name;$("#viewerUrl").textContent=a.url;$("#external").href=a.url;$("#viewer").hidden=false;document.body.style.overflow="hidden";$("#frame").src=a.url;}
function closeApp(){$("#viewer").hidden=true;$("#frame").src="about:blank";document.body.style.overflow="";render()}
function appClick(e){const c=e.target.closest(".card");if(c)openApp(c.dataset.id)}
const appsEl=$("#apps"),desktopAppsEl=$("#desktopApps"),closeEl=$("#close"),aboutEl=$("#about"),modalCloseEl=$("#modalClose"),modalEl=$("#modal"),search=$("#search");if(appsEl)appsEl.onclick=appClick;if(desktopAppsEl)desktopAppsEl.onclick=appClick;if(search)search.addEventListener("input",render);if(closeEl)closeEl.onclick=closeApp;if(aboutEl)aboutEl.onclick=()=>{if(modalEl)modalEl.hidden=false};if(modalCloseEl)modalCloseEl.onclick=()=>{if(modalEl)modalEl.hidden=true};if(modalEl)modalEl.onclick=e=>{if(e.target.id==="modal")modalEl.hidden=true};document.addEventListener("keydown",e=>{if(e.key==="Escape")closeApp()});init();
let draggedId=null,longPressTimer=null,touchDragId=null,lastSwapId=null;
function setEditMode(on){document.body.classList.toggle("home-edit",on);if(edit)edit.textContent=on?"Done":"•••";const add=$("#addApp");if(add)add.hidden=!on;document.querySelectorAll(".card").forEach(c=>c.draggable=on);document.querySelectorAll(".home-widget").forEach(w=>w.draggable=on)}
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

const widgetArea=$("#widgetArea");
function applyWidgetOrder(){if(!widgetArea)return;try{const order=JSON.parse(localStorage.getItem("webspace-widget-order")||"[]");order.forEach(id=>{const w=widgetArea.querySelector('[data-widget="'+id+'"]');if(w)widgetArea.appendChild(w)})}catch{}}
function saveWidgetOrder(){if(!widgetArea)return;try{localStorage.setItem("webspace-widget-order",JSON.stringify([...widgetArea.querySelectorAll(".home-widget")].map(w=>w.dataset.widget)))}catch{}}
let widgetDrag=null,widgetTouch=null;
if(widgetArea){
 applyWidgetOrder();
 widgetArea.addEventListener("dragstart",e=>{if(!document.body.classList.contains("home-edit"))return e.preventDefault();const w=e.target.closest(".home-widget");if(!w)return;widgetDrag=w.dataset.widget;w.classList.add("dragging")});
 widgetArea.addEventListener("dragend",e=>{e.target.closest(".home-widget")?.classList.remove("dragging");widgetDrag=null;saveWidgetOrder()});
 widgetArea.addEventListener("dragover",e=>{if(!widgetDrag)return;e.preventDefault();const target=e.target.closest(".home-widget"),moving=widgetArea.querySelector('[data-widget="'+widgetDrag+'"]');if(target&&moving&&target!==moving){const r=target.getBoundingClientRect();widgetArea.insertBefore(moving,e.clientY<r.top+r.height/2?target:target.nextSibling)}});
 widgetArea.addEventListener("pointerdown",e=>{if(!document.body.classList.contains("home-edit"))return;const w=e.target.closest(".home-widget");if(!w)return;widgetTouch=w.dataset.widget;e.preventDefault()});
 widgetArea.addEventListener("pointermove",e=>{if(!widgetTouch||!document.body.classList.contains("home-edit"))return;e.preventDefault();const target=document.elementFromPoint(e.clientX,e.clientY)?.closest(".home-widget"),moving=widgetArea.querySelector('[data-widget="'+widgetTouch+'"]');if(target&&moving&&target!==moving){const r=target.getBoundingClientRect();widgetArea.insertBefore(moving,e.clientY<r.top+r.height/2?target:target.nextSibling)}});
 const endWidget=()=>{if(widgetTouch)saveWidgetOrder();widgetTouch=null};widgetArea.addEventListener("pointerup",endWidget);widgetArea.addEventListener("pointercancel",endWidget);
}
function weatherWidgetSize(size){
 const w=document.querySelector('[data-widget="weather"]'),b=$("#weatherSizeBtn");if(!w)return;
 const allowed=["small","medium","large"];size=allowed.includes(size)?size:"medium";
 w.dataset.size=size;w.classList.remove("size-small","size-medium","size-large");w.classList.add("size-"+size);
 if(b)b.textContent=size==="small"?"小":size==="large"?"大":"中";
 try{localStorage.setItem("webspace-weather-size",size)}catch{}
}
const weatherSizeBtn=$("#weatherSizeBtn"),weatherSizeModal=$("#weatherSizeModal"),weatherSizeClose=$("#weatherSizeClose");
try{weatherWidgetSize(localStorage.getItem("webspace-weather-size")||"medium")}catch{weatherWidgetSize("medium")}
if(weatherSizeBtn)weatherSizeBtn.onclick=e=>{e.stopPropagation();if(document.body.classList.contains("home-edit")&&weatherSizeModal)weatherSizeModal.hidden=false};
if(weatherSizeClose)weatherSizeClose.onclick=()=>weatherSizeModal.hidden=true;
if(weatherSizeModal){weatherSizeModal.onclick=e=>{if(e.target===weatherSizeModal)weatherSizeModal.hidden=true;const b=e.target.closest("[data-wsize]");if(b){weatherWidgetSize(b.dataset.wsize);weatherSizeModal.hidden=true}}}

const homeGrid=$("#homeGrid");
function applyHomeOrder(){
 if(!homeGrid||innerWidth>820)return;
 try{
  const order=JSON.parse(localStorage.getItem("webspace-home-order")||"[]");
  order.forEach(key=>{
   let el=null;
   if(key==="widget:clock")el=document.querySelector('[data-widget="clock"]');
   else if(key==="widget:weather")el=document.querySelector('[data-widget="weather"]');
   else if(key==="apps")el=$("#apps");
   if(el)homeGrid.appendChild(el);
  });
 }catch{}
}
function saveHomeOrder(){
 if(!homeGrid)return;
 const order=[...homeGrid.children].map(el=>el.dataset?.widget?"widget:"+el.dataset.widget:el.id==="apps"?"apps":null).filter(Boolean);
 try{localStorage.setItem("webspace-home-order",JSON.stringify(order))}catch{}
}
function normalizeUnifiedHome(){
 if(!homeGrid||innerWidth>820)return;
 const wa=$("#widgetArea");
 if(wa){[...wa.querySelectorAll(".home-widget")].forEach(w=>homeGrid.insertBefore(w,$(".mobile-intro")));wa.remove()}
 applyHomeOrder();
}
normalizeUnifiedHome();

const settingsEdit=$("#settingsEdit"),settingsAdd=$("#settingsAdd");
if(settingsEdit)settingsEdit.onclick=()=>{if(modalEl)modalEl.hidden=true;setEditMode(true)};
if(settingsAdd)settingsAdd.onclick=()=>{if(modalEl)modalEl.hidden=true;if(addModal)addModal.hidden=false};

function setWallpaper(name){
 const allowed=["ocean","sky","sunset","midnight"];name=allowed.includes(name)?name:"ocean";
 document.body.dataset.wallpaper=name;
 try{localStorage.setItem("webspace-wallpaper",name)}catch{}
 document.querySelectorAll("[data-wallpaper]").forEach(b=>b.classList.toggle("selected",b.dataset.wallpaper===name));
}
const settingsWallpaper=$("#settingsWallpaper"),wallpaperModal=$("#wallpaperModal"),wallpaperClose=$("#wallpaperClose");
try{setWallpaper(localStorage.getItem("webspace-wallpaper")||"ocean")}catch{setWallpaper("ocean")}
if(settingsWallpaper)settingsWallpaper.onclick=()=>{if(modalEl)modalEl.hidden=true;if(wallpaperModal)wallpaperModal.hidden=false};
if(wallpaperClose)wallpaperClose.onclick=()=>wallpaperModal.hidden=true;
if(wallpaperModal)wallpaperModal.onclick=e=>{if(e.target===wallpaperModal)wallpaperModal.hidden=true;const b=e.target.closest("[data-wallpaper]");if(b){setWallpaper(b.dataset.wallpaper);wallpaperModal.hidden=true}};


/* V1 stable settings */
const restoreModal=$("#restoreModal"),restoreClose=$("#restoreClose"),restoreList=$("#restoreList"),settingsRestore=$("#settingsRestore");
async function renderRestoreApps(){
 if(!restoreList)return;
 const hidden=hiddenIds();
 if(!hidden.length){restoreList.innerHTML='<div><span>No hidden apps</span><small>All default apps are already on your Home Screen.</small></div>';return}
 try{
  const defaults=await fetch("./apps.json",{cache:"no-store"}).then(r=>r.json());
  restoreList.innerHTML=defaults.filter(a=>hidden.includes(a.id)).map(a=>'<button data-restore="'+a.id+'"><span>'+a.name+'</span><small>Restore to Home Screen</small></button>').join("")||'<div><span>No hidden apps</span></div>';
 }catch{restoreList.innerHTML='<div><span>Unable to load apps</span></div>'}
}
if(settingsRestore)settingsRestore.onclick=async()=>{if(modalEl)modalEl.hidden=true;await renderRestoreApps();if(restoreModal)restoreModal.hidden=false};
if(restoreClose)restoreClose.onclick=()=>restoreModal.hidden=true;
if(restoreModal)restoreModal.onclick=async e=>{
 if(e.target===restoreModal){restoreModal.hidden=true;return}
 const b=e.target.closest("[data-restore]");if(!b)return;
 const id=b.dataset.restore,hidden=hiddenIds().filter(x=>x!==id);
 localStorage.setItem("webspace-hidden-apps",JSON.stringify(hidden));
 await init();await renderRestoreApps();
};

const resetModal=$("#resetModal"),settingsReset=$("#settingsReset"),resetClose=$("#resetClose"),resetCancel=$("#resetCancel"),resetConfirm=$("#resetConfirm");
if(settingsReset)settingsReset.onclick=()=>{if(modalEl)modalEl.hidden=true;if(resetModal)resetModal.hidden=false};
const closeReset=()=>{if(resetModal)resetModal.hidden=true};
if(resetClose)resetClose.onclick=closeReset;if(resetCancel)resetCancel.onclick=closeReset;
if(resetModal)resetModal.onclick=e=>{if(e.target===resetModal)closeReset()};
if(resetConfirm)resetConfirm.onclick=async()=>{
 ["webspace-app-order","webspace-widget-order","webspace-home-order","webspace-weather-size","webspace-wallpaper"].forEach(k=>localStorage.removeItem(k));
 setWallpaper("ocean");weatherWidgetSize("medium");closeReset();await init();location.reload();
};
