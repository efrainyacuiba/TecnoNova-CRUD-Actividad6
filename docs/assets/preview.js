/* Esta versión de GitHub Pages es una demostración educativa. Su localStorage
 * NO es PostgreSQL. El backend real está en C#/MVC en el ZIP. */
(()=>{
 'use strict';
 const storageKey='TN6_DEMO_V3';
 const seed=[
  {id:1,sku:'TN-LAP-1001',nombre:'Lenovo Laptop A101',precio:4255.92,stock:5,categoria:'Laptops'},
  {id:2,sku:'TN-CEL-1002',nombre:'ASUS Smartphone B102',precio:3405.84,stock:26,categoria:'Celulares'},
  {id:3,sku:'TN-ACC-1012',nombre:'Logitech Hub USB L112',precio:308,stock:18,categoria:'Accesorios'},
  {id:4,sku:'TN-COM-1005',nombre:'Logitech GPU E105',precio:4332.24,stock:14,categoria:'Componentes'}
 ];
 const esc=(s)=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
 const data=()=>{try{const d=JSON.parse(localStorage.getItem(storageKey));if(Array.isArray(d))return d}catch{}return structuredClone(seed)};
 const save=(d)=>localStorage.setItem(storageKey,JSON.stringify(d));
 const list=data();if(!localStorage.getItem(storageKey))save(list);
 const fmt=(n)=>Number(n).toLocaleString('es-BO',{minimumFractionDigits:2,maximumFractionDigits:2});
 const info=(s)=>document.getElementById(s);
 const photos={
   Laptops:'https://images.pexels.com/photos/3550483/pexels-photo-3550483.jpeg?auto=compress&cs=tinysrgb&w=1100',
   Celulares:'https://images.unsplash.com/photo-1732020884042-11dfad2ad029?auto=format&fit=crop&w=1100&q=83',
   Accesorios:'https://vmart.pk/cdn/shop/files/products-premium-hub.jpg?v=1737143334',
   Componentes:'https://images.unsplash.com/photo-1727895949000-da3c10a7d562?auto=format&fit=crop&w=1100&q=83'};
 const symbols={Laptops:'⌨',Celulares:'▯',Accesorios:'⊞',Componentes:'◈'};
 const total=(id,n)=>{if(info(id))info(id).textContent=String(n).padStart(2,'0')};
 total('home-total',list.length);total('home-cats',new Set(list.map(x=>x.categoria)).size);total('home-stock',list.reduce((s,x)=>s+x.stock,0));
 total('count-products',list.length);total('count-stock',list.reduce((s,x)=>s+x.stock,0));total('count-category',new Set(list.map(x=>x.categoria)).size);total('count-low',list.filter(x=>x.stock<=5).length);
 const grid=info('product-grid');
 if(grid){grid.innerHTML=list.map((x)=>`<article class="product-card tilt-card reveal-on-scroll" data-kind="${esc(x.categoria.toLowerCase())}" data-search="${esc((x.nombre+' '+x.sku+' '+x.categoria).toLowerCase())}" data-id="${x.id}" data-sku="${esc(x.sku)}" data-title="${esc(x.nombre)}" data-price="${x.precio}" data-stock="${x.stock}" data-category="${esc(x.categoria)}"><div class="product-photo"><span class="photo-index">TN / ${esc(x.sku)}</span><img src="${photos[x.categoria]||photos.Laptops}" loading="lazy" alt="Foto de referencia para ${esc(x.categoria)}" onerror="this.style.display='none'"/><span class="product-fallback">${symbols[x.categoria]||'✳'}</span><span class="photo-note">FOTOGRAFÍA ILUSTRATIVA</span></div><div class="product-meta"><span>${esc(x.categoria)}</span><span>STOCK / ${x.stock}</span></div><h2>${esc(x.nombre)}</h2><p class="product-price">Bs ${fmt(x.precio)}</p><div class="product-footer"><button class="text-link inspect-btn" type="button">VER DETALLES <span>↗</span></button><div class="product-mini-actions"><a href="nuevo.html?editar=${x.id}" title="Editar">✎</a><a href="catalogo.html?eliminar=${x.id}" title="Eliminar">×</a></div></div></article>`).join('');}
 const tbody=document.querySelector('#inventory-table tbody');
 if(tbody){tbody.innerHTML=list.map(x=>`<tr data-row-search="${esc((x.nombre+' '+x.sku+' '+x.categoria).toLowerCase())}"><td><strong>${esc(x.nombre)}</strong><small>${esc(x.sku)}</small></td><td><span class="category-badge">${esc(x.categoria)}</span></td><td>Bs ${fmt(x.precio)}</td><td><span class="stock-dot ${x.stock<=5?'low':''}"></span>${x.stock}</td><td class="row-actions"><a href="nuevo.html?editar=${x.id}">Editar ↗</a><a href="inventario.html?eliminar=${x.id}">Eliminar ×</a></td></tr>`).join('')}
 const query=new URLSearchParams(location.search),deleteId=Number(query.get('eliminar'));
 if(deleteId){const x=list.find(p=>p.id===deleteId);if(x){if(confirm(`¿Eliminar ${x.nombre}? Esta demo guarda el cambio solo en este navegador.`)){save(list.filter(p=>p.id!==deleteId));location.replace(location.pathname+'?eliminado=1')}else history.replaceState(null,'',location.pathname);}}
 // La creación y edición usan exactamente los mismos campos que la vista MVC.
 const dialog=info('product-modal'),form=info('product-form');
 if(dialog&&form){
  const fields={sku:info('sku'),nombre:info('nombre'),precio:info('precio'),stock:info('stock'),categoria:info('categoria')};
  let editing=Number(query.get('editar'))||0;
  let item=list.find(x=>x.id===editing);
  if(item){fields.sku.value=item.sku;fields.nombre.value=item.nombre;fields.precio.value=String(item.precio);fields.stock.value=item.stock;fields.categoria.value=item.categoria;info('modal-title').innerHTML='Editar producto<span class="accent">.</span>'}
  const serialized=()=>JSON.stringify(Object.fromEntries(Object.entries(fields).map(([k,e])=>[k,e.value])));
  const initial=serialized();
  dialog.showModal();fields.sku.focus();
  function clear(k){fields[k].removeAttribute('aria-invalid');info(k+'-error').textContent=''}
  function error(k,s){fields[k].setAttribute('aria-invalid','true');info(k+'-error').textContent=s}
  for(const [k,x] of Object.entries(fields)){x.addEventListener('input',()=>clear(k));}
  function validate(){
    Object.keys(fields).forEach(clear);const bad=[];
    if(!fields.sku.value.trim())bad.push(['sku','Escribe el código del producto.']);
    if(!fields.nombre.value.trim())bad.push(['nombre','Escribe el nombre del equipo.']);
    const n=Number(fields.precio.value.trim().replace(',','.'));
    if(!/^\d+(\.\d{1,2})?$/.test(fields.precio.value.trim().replace(',','.'))||n<=0||n>99999999)bad.push(['precio','El precio debe ser mayor a Bs 0. Usa coma o punto.']);
    const stock=Number(fields.stock.value);
    if(!Number.isInteger(stock)||stock<0||stock>999999||fields.stock.value.trim()==='')bad.push(['stock','Pon una cantidad entera desde 0.']);
    if(!fields.categoria.value)bad.push(['categoria','Elige una categoría para continuar.']);
    if(list.some(x=>x.sku.toLowerCase()===fields.sku.value.trim().toLowerCase() && x.id!==editing))bad.push(['sku','Ese código ya existe. Prueba con otro.']);
    bad.forEach(([k,v])=>error(k,v));if(bad.length){fields[bad[0][0]].focus();return false}return true;
  }
  let exit=false;
  const askLeave=()=>{
    if(exit)return;
    if(serialized()!==initial){info('confirm-leave').showModal();info('continue-editing').focus()}
    else location.href='catalogo.html';
  };
  form.addEventListener('submit',(e)=>{
    e.preventDefault();if(!validate())return;
    const obj={id:editing||Math.max(...list.map(x=>x.id),0)+1,sku:fields.sku.value.trim(),nombre:fields.nombre.value.trim(),precio:Number(fields.precio.value.replace(',','.')),stock:Number(fields.stock.value),categoria:fields.categoria.value};
    const newList=editing?list.map(x=>x.id===editing?obj:x):[...list,obj];
    save(newList);location.href='catalogo.html?guardado=1';
  });
  dialog.addEventListener('cancel',e=>{e.preventDefault();askLeave()});
  info('cancel-product').addEventListener('click',askLeave);
  info('dialog-close').addEventListener('click',askLeave);
  info('continue-editing').addEventListener('click',()=>{info('confirm-leave').close();fields.sku.focus()});
  info('discard-editing').addEventListener('click',()=>{exit=true;location.href='catalogo.html'});
  document.addEventListener('keydown',e=>{
    if(!dialog.open||info('confirm-leave').open)return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();form.requestSubmit();}
    if(e.key==='Enter'&&['INPUT','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();form.requestSubmit()}
  });
 }
 if(query.has('guardado')||query.has('eliminado')){
  const message=document.createElement('div');message.className='notice success';message.setAttribute('role','status');message.textContent=query.has('guardado')?'✓ Producto guardado en esta demo del navegador.':'✓ Producto eliminado en esta demo del navegador.';
  document.querySelector('.catalog-page,.inventory-page')?.prepend(message);
 }
 // En la ficha del catálogo las acciones también deben llevar a la demo, no al servidor MVC.
 const detail=info('details-dialog');
 if(detail){const edit=info('detail-edit'),del=info('detail-delete');const observer=new MutationObserver(()=>{
    const sku=info('detail-sku').textContent;const record=list.find(x=>x.sku===sku);
    if(record){edit.href='nuevo.html?editar='+record.id;del.href='catalogo.html?eliminar='+record.id}
  });observer.observe(info('detail-sku'),{childList:true,characterData:true,subtree:true});}
 // Restablecer demo es opcional: accesible con ?reiniciar=1, no borrar por accidente.
 if(query.get('reiniciar')==='1'){save(structuredClone(seed));location.replace(location.pathname)}
})();
