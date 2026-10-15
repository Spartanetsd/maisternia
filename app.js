/* Увесь інтерфейс працює локально: немає CDN, аналітики, сторонніх шрифтів або API. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const state={filter:'Усі',search:'',favoritesOnly:false};
const storage={get(k,def){try{return JSON.parse(localStorage.getItem('maisteria:'+k))??def}catch{return def}},set(k,v){try{localStorage.setItem('maisteria:'+k,JSON.stringify(v))}catch{}}};
let favs=new Set(storage.get('favorites',[])),done=new Set(storage.get('done',[]));
const iconHeart=s=>s?'♥':'♡';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=id=>PROJECTS.find(p=>p.id===id);
function selectFilter(name){state.filter=name;state.favoritesOnly=false;$('tabFav').classList.remove('active');$('tabAll').classList.add('active');document.querySelectorAll('.chip').forEach(b=>b.classList.toggle('selected',b.dataset.filter===name));render()}
function toggleFavorite(id){if(favs.has(id))favs.delete(id);else favs.add(id);storage.set('favorites',[...favs]);render();if($('projectDialog').open){const save=$('dialogSave');if(save){save.textContent=iconHeart(favs.has(id));save.classList.toggle('saved',favs.has(id));}}}
function render(){const q=state.search.toLocaleLowerCase('uk').trim();const found=PROJECTS.filter(p=>{
 if(state.favoritesOnly&&!favs.has(p.id))return false;
 if(state.filter!=='Усі'&&p.category!==state.filter&&!state.favoritesOnly)return false;
 return !q||[p.title,p.subtitle,p.description,p.dim,p.category,...p.tags].join(' ').toLocaleLowerCase('uk').includes(q);
});
 $('resultsTitle').textContent=state.favoritesOnly?'Улюблені проєкти':q?'Результати пошуку':'Каталог проєктів';
 $('resultCount').textContent=found.length+' '+(found.length===1?'виріб':(found.length>1&&found.length<5?'вироби':'виробів'));
 $('projectCounter').innerHTML=found.length+' <small>проєктів</small>';
 $('cards').innerHTML=found.map(p=>`<article class="tile" data-project="${esc(p.id)}" role="button" tabindex="0" aria-label="Відкрити проєкт ${esc(p.title)}" style="--tile-a:${p.colors[0]};--tile-b:${p.colors[1]}"><button type="button" class="heart ${favs.has(p.id)?'saved':''}" aria-label="${favs.has(p.id)?'Прибрати з улюблених':'Додати в улюблені'}" data-fav="${esc(p.id)}">${iconHeart(favs.has(p.id))}</button><div class="tile-heading"><div class="tile-kicker">${esc(p.category)} · ${p.pages} арк.</div><h3 class="tile-title">${esc(p.title)}</h3><div class="tile-sub">${esc(p.subtitle)}</div></div><img class="tile-art" src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy"><div class="tile-bottom"><span class="size-pill">${esc(p.dim)}</span><span class="pdf-indicator" aria-hidden="true">PDF</span></div></article>`).join('');
 $('empty').hidden=!!found.length;
}
function openProject(id, updateHash=true){const p=byId(id);if(!p)return;
 const holder=$('projectContent');
 holder.innerHTML=`<div class="project-hero" style="--tile-a:${p.colors[0]};--tile-b:${p.colors[1]}"><div class="top-action"><button class="round" type="button" data-close="project" aria-label="Назад">‹</button><button class="round ${favs.has(id)?'saved':''}" type="button" id="dialogSave" data-fav="${esc(id)}" aria-label="До улюблених">${iconHeart(favs.has(id))}</button></div><img src="${esc(p.cover)}" alt="${esc(p.title)}"><div class="hero-label">${esc(p.category)} • ${p.pages} сторінок</div></div><div class="dialog-content"><h2>${esc(p.title)}</h2><p class="dialog-sub">${esc(p.description)}</p><div class="stats"><div class="stat"><small>ГАБАРИТИ</small><strong>${esc(p.dim)}</strong></div><div class="stat"><small>ФАЙЛ</small><strong>PDF · ${p.pages} сторінок</strong></div></div><div class="action-row"><a class="primary" href="${esc(p.pdf)}" target="_blank" rel="noopener">↗ Відкрити PDF</a><a class="secondary" href="${esc(p.pdf)}" download="${esc(p.id)}.pdf">↓ Зберегти PDF</a></div><label class="checkline"><input type="checkbox" id="doneCheck" ${done.has(id)?'checked':''}><span>Позначити як виготовлений</span></label><h3 class="preview-title">Аркуші креслень</h3><p class="preview-note">Натисни на аркуш, щоб збільшити. Повний документ — у PDF вище.</p><div class="preview-row">${p.previews.map(r=>`<button class="page-preview" type="button" data-zoom="${esc(r.file)}" data-alt="${esc(p.title)}, сторінка ${r.page}"><img src="${esc(r.file)}" loading="lazy" alt="Сторінка ${r.page}"><span>Аркуш ${r.page} ↗</span></button>`).join('')}</div><p class="disclaimer">Розміри та специфікації взято з оригінальної інструкції. Перед розкроєм перевір фактичні габарити заготовок, навантаження та умови монтажу.</p></div>`;
 if(!$('projectDialog').open)$('projectDialog').showModal();
 holder.scrollTop=0;
 holder.querySelector('#doneCheck').addEventListener('change',e=>{e.target.checked?done.add(id):done.delete(id);storage.set('done',[...done])});
 if(updateHash&&/^https?:$/.test(location.protocol)){try{history.replaceState(null,'','#'+encodeURIComponent(id))}catch{}}
}
function closeProject(){if($('projectDialog').open)$('projectDialog').close();if(location.hash&&/^https?:$/.test(location.protocol)){try{history.replaceState(null,'',location.pathname+location.search)}catch{}}}
function reset(){state.filter='Усі';state.search='';state.favoritesOnly=false;$('search').value='';document.querySelectorAll('.chip').forEach(b=>b.classList.toggle('selected',b.dataset.filter==='Усі'));$('tabFav').classList.remove('active');$('tabAll').classList.add('active');render()}
$('filterRow').addEventListener('click',e=>{const b=e.target.closest('button[data-filter]');if(b)selectFilter(b.dataset.filter)});
$('search').addEventListener('input',e=>{state.search=e.target.value;render()});
$('cards').addEventListener('click',e=>{const f=e.target.closest('[data-fav]');if(f){toggleFavorite(f.dataset.fav);return}const t=e.target.closest('[data-project]');if(t)openProject(t.dataset.project)});
$('cards').addEventListener('keydown',e=>{const t=e.target.closest('[data-project]');if(t&&!e.target.closest('button')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openProject(t.dataset.project)}});
$('projectContent').addEventListener('click',e=>{const f=e.target.closest('[data-fav]');if(f){toggleFavorite(f.dataset.fav);return}const c=e.target.closest('[data-close]');if(c){closeProject();return}const z=e.target.closest('[data-zoom]');if(z){$('zoomImage').src=z.dataset.zoom;$('zoomImage').alt=z.dataset.alt;$('zoomDialog').showModal()}});
$('tabFav').addEventListener('click',()=>{state.favoritesOnly=true;state.filter='Усі';document.querySelectorAll('.chip').forEach(b=>b.classList.remove('selected'));$('tabAll').classList.remove('active');$('tabFav').classList.add('active');render();scrollTo({top:0,behavior:'smooth'})});
$('tabAll').addEventListener('click',()=>{reset();scrollTo({top:0,behavior:'smooth'})});
$('tabHelp').addEventListener('click',()=>$('helpDialog').showModal());
$('helpDialog').addEventListener('click',e=>{if(e.target.closest('[data-close]'))$('helpDialog').close()});
$('closeZoom').addEventListener('click',()=>$('zoomDialog').close());
$('resetSearch').addEventListener('click',reset);
$('projectDialog').addEventListener('close',()=>{if(location.hash&&/^https?:$/.test(location.protocol)){try{history.replaceState(null,'',location.pathname+location.search)}catch{}}});
window.addEventListener('hashchange',()=>{const id=decodeURIComponent(location.hash.slice(1));if(byId(id))openProject(id,false);else if($('projectDialog').open)$('projectDialog').close()});
render();
if(location.hash&&byId(decodeURIComponent(location.hash.slice(1))))openProject(decodeURIComponent(location.hash.slice(1)),false);
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){
 navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{$('offlineBadge').innerHTML='<span class="status-dot"></span>Офлайн готово';}).catch(()=>{$('offlineBadge').innerHTML='<span class="status-dot"></span>PDF локально';});
}else if(location.protocol==='file:')$('offlineBadge').innerHTML='<span class="status-dot"></span>Без мережі ✓';
})();
