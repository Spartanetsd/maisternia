/* Автономне кешування всього каталогу для GitHub Pages. */
const CACHE_NAME = 'maisteria-offline-v1';
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./catalog.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/window.svg",
  "./assets/touch-icon.png",
  "./pdfs/banketka.pdf",
  "./assets/banketka.webp",
  "./assets/banketka-p1.webp",
  "./assets/banketka-p3.webp",
  "./assets/banketka-p4.webp",
  "./pdfs/garden-bed.pdf",
  "./assets/garden-bed.webp",
  "./assets/garden-bed-p1.webp",
  "./assets/garden-bed-p3.webp",
  "./assets/garden-bed-p4.webp",
  "./pdfs/dining.pdf",
  "./assets/dining.webp",
  "./assets/dining-p1.webp",
  "./assets/dining-p3.webp",
  "./assets/dining-p4.webp",
  "./pdfs/garden-cabinet.pdf",
  "./assets/garden-cabinet.webp",
  "./assets/garden-cabinet-p1.webp",
  "./assets/garden-cabinet-p3.webp",
  "./assets/garden-cabinet-p4.webp",
  "./pdfs/garden-sofa.pdf",
  "./assets/garden-sofa.webp",
  "./assets/garden-sofa-p1.webp",
  "./assets/garden-sofa-p3.webp",
  "./assets/garden-sofa-p4.webp",
  "./pdfs/garden-set.pdf",
  "./assets/garden-set.webp",
  "./assets/garden-set-p1.webp",
  "./assets/garden-set-p3.webp",
  "./assets/garden-set-p4.webp",
  "./pdfs/window.pdf",
  "./assets/window-p1.webp",
  "./assets/window-p3.webp",
  "./assets/window-p4.webp",
  "./pdfs/holder-dowel.pdf",
  "./assets/holder-dowel.webp",
  "./assets/holder-dowel-p1.webp",
  "./assets/holder-dowel-p3.webp",
  "./assets/holder-dowel-p4.webp",
  "./pdfs/holder-classic.pdf",
  "./assets/holder-classic.webp",
  "./assets/holder-classic-p1.webp",
  "./assets/holder-classic-p3.webp",
  "./assets/holder-classic-p4.webp",
  "./pdfs/shoe-console.pdf",
  "./assets/shoe-console.webp",
  "./assets/shoe-console-p1.webp",
  "./assets/shoe-console-p3.webp",
  "./assets/shoe-console-p4.webp"
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 // iOS PDF viewers often request partial PDF bytes. Serve the correct 206 response even offline.
 if(event.request.headers.has('range') && new URL(event.request.url).pathname.endsWith('.pdf')){
   event.respondWith(caches.match(event.request.url,{ignoreSearch:true}).then(async cached=>{
     if(!cached) return fetch(event.request);
     const all=await cached.arrayBuffer(),total=all.byteLength;
     const match=/bytes=(\d+)-(\d*)/.exec(event.request.headers.get('range')||'');
     if(!match)return cached;
     const start=Number(match[1]),end=Math.min(match[2]?Number(match[2]):total-1,total-1);
     if(start>=total||start>end)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${total}`}});
     return new Response(all.slice(start,end+1),{status:206,statusText:'Partial Content',headers:{'Content-Range':`bytes ${start}-${end}/${total}`,'Accept-Ranges':'bytes','Content-Length':String(end-start+1),'Content-Type':cached.headers.get('Content-Type')||'application/pdf'}});
   }));return;
 }
const u=new URL(event.request.url);if(u.origin!==location.origin)return;event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(r=>r||fetch(event.request).then(res=>{if(res&&res.ok){const clone=res.clone();caches.open(CACHE_NAME).then(c=>c.put(event.request,clone));}return res}).catch(()=>{if(event.request.mode==='navigate')return caches.match('./index.html');return Response.error();})));});
