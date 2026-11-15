/* TecnoNova Bolivia / Actividad 6. Sin dependencias externas.
 * Efectos optimizados para celular + comportamiento real MVC del formulario.
 */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 720px)');
  const normalize = (s) => String(s || '').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();

  // El cursor ilumina suavemente el fondo, sin bloquear clics.
  const light = $('mouse-light');
  if(light && !small.matches && !reduced){
    window.addEventListener('pointermove', (e) => {
      light.style.left = e.clientX + 'px'; light.style.top = e.clientY + 'px';
    }, {passive:true});
  }
  // Animaciones de entrada solo cuando el elemento aparece.
  const reveals = Array.from(document.querySelectorAll('.reveal-on-scroll'));
  if('IntersectionObserver' in window && !reduced){
    const io = new IntersectionObserver((entries) => {
      for(const e of entries) if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}
    },{threshold:.07,rootMargin:'0px 0px 50px 0px'});
    reveals.forEach(x=>io.observe(x));
  } else reveals.forEach(x=>x.classList.add('in-view'));

  // Partículas que flotan y se conectan cuando el mouse se acerca.
  const canvas = $('stars');
  const ctx = canvas?.getContext('2d',{alpha:true});
  if(ctx && !reduced){
    let width=0,height=0,points=[],last=0,active=true;
    const pointer={x:-1000,y:-1000};
    const make=()=>{
      let ratio=Math.min(window.devicePixelRatio||1,1.5);
      width=innerWidth;height=innerHeight;
      canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
      canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(ratio,0,0,ratio,0,0);
      const n=small.matches?24:55;
      points=Array.from({length:n},()=>({x:Math.random()*width,y:Math.random()*height,vx:(Math.random()-.5)*.32,vy:(Math.random()-.5)*.28,r:.55+Math.random()*1.6,a:.15+Math.random()*.3}));
    };
    const loop=(time)=>{
      requestAnimationFrame(loop);
      if(!active || time-last<(small.matches?36:21)) return;
      last=time;ctx.clearRect(0,0,width,height);
      for(let i=0;i<points.length;i++){
        const a=points[i];a.x=(a.x+a.vx+width)%width;a.y=(a.y+a.vy+height)%height;
        ctx.beginPath();ctx.fillStyle=`rgba(148,204,255,${a.a})`;ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();
        if(!small.matches){
          const dx=a.x-pointer.x,dy=a.y-pointer.y;
          if(dx*dx+dy*dy<110*110){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(pointer.x,pointer.y);ctx.strokeStyle='rgba(118,227,255,.10)';ctx.stroke();}
          for(let j=i+1;j<points.length;j++){
            const b=points[j],dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;
            if(d2<105*105){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(106,176,255,${(1-Math.sqrt(d2)/105)*.11})`;ctx.stroke();}
          }
        }
      }
    };
    window.addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;},{passive:true});
    window.addEventListener('resize',make,{passive:true});
    document.addEventListener('visibilitychange',()=>active=!document.hidden);
    make();requestAnimationFrame(loop);
  }

  // Profundidad suave: capas de fotos se mueven a velocidades distintas.
  const hero=$('hero-visual');
  if(hero && !reduced && !small.matches){
    const layers=Array.from(hero.querySelectorAll('.parallax-layer'));
    hero.addEventListener('pointermove',(e)=>{
      const box=hero.getBoundingClientRect();
      const dx=(e.clientX-box.left)/box.width-.5,dy=(e.clientY-box.top)/box.height-.5;
      layers.forEach(layer=>{
        const strength=parseFloat(layer.dataset.depth||1);
        layer.style.setProperty('--px',`${(dx*strength*22).toFixed(2)}px`);
        layer.style.setProperty('--py',`${(dy*strength*17).toFixed(2)}px`);
      });
    },{passive:true});
    hero.addEventListener('pointerleave',()=>layers.forEach(layer=>{layer.style.setProperty('--px','0px');layer.style.setProperty('--py','0px');}));
  }

  // Una capa de transición aparece al cambiar de página (en navegadores modernos
  // también se aplica View Transitions mediante CSS).
  document.querySelectorAll('a[href]').forEach(a=>{
    a.addEventListener('click',(e)=>{
      const url=a.getAttribute('href');
      if(!url || url.startsWith('#') || a.target==='_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || reduced)return;
      try { const target=new URL(url,location.href);if(target.origin!==location.origin || target.pathname===location.pathname)return; }
      catch {return}
      const wipe=document.querySelector('.page-wipe');wipe?.classList.remove('active');void wipe?.offsetHeight;wipe?.classList.add('active');
    });
  });

  // CATÁLOGO: búsqueda + filtros + ficha de detalle + acciones reales MVC.
  const search=$('catalog-search'),cards=Array.from(document.querySelectorAll('.product-card')),
    pills=Array.from(document.querySelectorAll('.filter-pill')),counter=$('visible-count'),empty=$('no-results');
  if(search){
    let filter='todos';
    function update(){
      const q=normalize(search.value);let count=0;
      for(const card of cards){
        const hay=normalize(card.dataset.search),kind=normalize(card.dataset.kind);
        const show=(!q||hay.includes(q))&&(filter==='todos'||kind.includes(filter));
        card.hidden=!show;if(show)count++;
      }
      if(counter)counter.textContent=count;
      if(empty)empty.hidden=count>0||cards.length===0;
    }
    pills.forEach(p=>p.addEventListener('click',()=>{
      filter=p.dataset.filter||'todos';pills.forEach(x=>{x.classList.toggle('active',x===p);x.setAttribute('aria-pressed',String(x===p))});update();
    }));
    search.addEventListener('input',update);update();
    $('clear-search')?.addEventListener('click',()=>{search.value='';pills[0]?.click();search.focus()});
    document.addEventListener('keydown',e=>{
      if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();search.focus()}
    });
    const details=$('details-dialog');
    cards.forEach(card=>card.querySelector('.inspect-btn')?.addEventListener('click',()=>{
      if(!details)return;
      $('detail-title').textContent=card.dataset.title||'';
      $('detail-sku').textContent=card.dataset.sku||'';
      $('detail-price').textContent='Bs '+Number(card.dataset.price||0).toLocaleString('es-BO',{minimumFractionDigits:2,maximumFractionDigits:2});
      $('detail-stock').textContent=(card.dataset.stock||'0')+' unidades';
      $('detail-category').textContent=card.dataset.category||'';
      $('detail-edit').href=document.body.dataset.demo==='true'?'nuevo.html?editar='+card.dataset.id:'/Productos/Edit/'+card.dataset.id;
      $('detail-delete').href=document.body.dataset.demo==='true'?'catalogo.html?eliminar='+card.dataset.id:'/Productos/Delete/'+card.dataset.id;
      details.showModal();
    }));
    details?.querySelector('[data-close-details]')?.addEventListener('click',()=>details.close());
    details?.addEventListener('click',e=>{if(e.target===details)details.close()});
  }
  // Inventario: búsqueda local y descarga de las filas visibles como CSV (sin modificar BD).
  const invSearch=$('inventory-search'),tbl=$('inventory-table');
  if(invSearch && tbl){
    const rows=Array.from(tbl.querySelectorAll('tbody tr'));
    const update=()=>{
      const q=normalize(invSearch.value);let count=0;
      rows.forEach(row=>{row.hidden=!normalize(row.dataset.rowSearch).includes(q);if(!row.hidden)count++});
      const msg=$('inventory-no-results');if(msg)msg.hidden=count>0||rows.length===0;
    };
    invSearch.addEventListener('input',update);
    $('export-csv')?.addEventListener('click',()=>{
      const clean=(s)=>'"'+String(s).replaceAll('"','""')+'"';
      const csv=['Producto;Categoría;Precio;Stock;SKU'];
      rows.filter(x=>!x.hidden).forEach(row=>{
        const td=Array.from(row.querySelectorAll('td'));
        csv.push([td[0].querySelector('strong')?.textContent,td[1].textContent,td[2].textContent,td[3].textContent,td[0].querySelector('small')?.textContent].map(clean).join(';'));
      });
      const blob=new Blob(['\ufeff'+csv.join('\n')],{type:'text/csv;charset=utf-8;'});
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='inventario-tecnonova.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    });
  }

  // FORMULARIO NUEVO: modal real con valores por defecto, atajos y reversibilidad.
  const dialog=$('product-modal'),confirm=$('confirm-leave'),form=$('product-form');
  if(dialog && form && document.body.dataset.demo !== "true"){
    const fields={sku:$('sku'),nombre:$('nombre'),precio:$('precio'),stock:$('stock'),categoria:$('categoria')};
    const initial=()=>JSON.stringify(Object.fromEntries(Object.entries(fields).map(([k,x])=>[k,x.value])));
    const savedState=initial();
    const errors={sku:$('sku-error'),nombre:$('nombre-error'),precio:$('precio-error'),stock:$('stock-error'),categoria:$('categoria-error')};
    function clear(k){const i=fields[k],e=errors[k];if(i)i.removeAttribute('aria-invalid');if(e)e.textContent=''}
    function error(k,msg){fields[k]?.setAttribute('aria-invalid','true');if(errors[k])errors[k].textContent=msg;return false}
    function validate(){
      Object.keys(fields).forEach(clear);
      let invalid=[];
      if(!fields.sku.value.trim())invalid.push(['sku','Escribe el código del producto.']);
      else if(fields.sku.value.trim().length>30)invalid.push(['sku','El código debe tener máximo 30 caracteres.']);
      if(!fields.nombre.value.trim())invalid.push(['nombre','Escribe el nombre del equipo.']);
      const priceText=fields.precio.value.trim().replace(',','.');const price=Number(priceText);
      if(!/^\d+(\.\d{1,2})?$/.test(priceText)||!Number.isFinite(price)||price<=0||price>99999999)invalid.push(['precio','El precio debe ser mayor a Bs 0. Usa coma o punto.']);
      const stock=Number(fields.stock.value);
      if(fields.stock.value.trim()===''||!Number.isInteger(stock)||stock<0||stock>999999)invalid.push(['stock','Pon una cantidad entera desde 0.']);
      if(!fields.categoria.value)invalid.push(['categoria','Elige una categoría para continuar.']);
      for(const [k,msg] of invalid)error(k,msg);
      if(invalid.length){fields[invalid[0][0]]?.focus();return false}
      return true;
    }
    let exiting=false;
    function leave(){
      if(exiting)return;
      if(initial()!==savedState){confirm?.showModal();$('continue-editing')?.focus()}
      else location.href='/Interfaz/Catalogo';
    }
    try{dialog.showModal();}catch{}
    const serverError=form.querySelector('.field-validation-error');
    if(serverError){const i=serverError.closest('.form-field')?.querySelector('input,select');i?.setAttribute('aria-invalid','true');(i||fields.sku).focus();}
    else fields.sku.focus();
    dialog.addEventListener('cancel',e=>{e.preventDefault();leave()});
    $('cancel-product')?.addEventListener('click',leave);
    $('dialog-close')?.addEventListener('click',leave);
    $('continue-editing')?.addEventListener('click',()=>{confirm.close();fields.sku.focus()});
    $('discard-editing')?.addEventListener('click',()=>{exiting=true;confirm.close();dialog.close();location.href='/Interfaz/Catalogo'});
    confirm?.addEventListener('cancel',e=>{e.preventDefault();confirm.close();fields.sku.focus()});
    for(const [k,input] of Object.entries(fields))input.addEventListener('input',()=>clear(k));
    form.addEventListener('submit',e=>{
      if(!validate()){e.preventDefault();return}
      const b=$('save-product');if(b){b.disabled=true;b.textContent='GUARDANDO...'}
    });
    document.addEventListener('keydown',e=>{
      if(!dialog.open||confirm?.open)return;
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){
        e.preventDefault();form.requestSubmit();
      } else if(e.key==='Enter' && ['INPUT','SELECT'].includes(document.activeElement?.tagName)){
        e.preventDefault();form.requestSubmit();
      }
    });
  }
})();
