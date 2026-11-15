/* Complemento de integración — UX real para ASP.NET Core MVC; sin dependencias adicionales */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const all = (s, root=document) => [...root.querySelectorAll(s)];
  const notify = (form, msg) => {
    const target = $('[data-tn-quick-error]', form);
    if (target) target.textContent = msg;
    else {
      let box = $('[data-tn-client-error]', form);
      if (!box) { box=document.createElement('p');box.dataset.tnClientError='';box.className='tn-field-error';box.setAttribute('role','alert');form.prepend(box); }
      box.textContent = msg;
    }
  };
  const dirty = (form) => !!form && !!form.dataset.tnDirty;
  const hasDirty = () => all('form[data-tn-form]').some(dirty);
  function validate(form) {
    const find = (n) => form.elements.namedItem(n);
    const sku=find('Sku')?.value?.trim()||'';
    const name=find('Nombre')?.value?.trim()||'';
    const price=find('PrecioTexto')?.value?.trim()||'';
    const stock=find('Stock')?.value||'';
    const category=find('CategoriaId')?.value||'';
    const value = Number(price.replace(',','.'));
    if (!sku || sku.length > 30) return ['Sku','Escribe un código de hasta 30 caracteres.'];
    if (!name || name.length > 100) return ['Nombre','Escribe el nombre del equipo (máximo 100 caracteres).'];
    if (!category) return ['CategoriaId','Elige una categoría para continuar.'];
    if (!price || !Number.isFinite(value) || value <= 0 || value > 99999999) return ['PrecioTexto','Ingresa un precio mayor a Bs 0. Puedes usar coma o punto.'];
    if (!/^\d+$/.test(stock)||Number(stock)>999999) return ['Stock','Ingresa una cantidad entera entre 0 y 999999.'];
    return null;
  }
  document.addEventListener('input', e => {
    const form=e.target?.closest?.('form[data-tn-form]');
    if (!form) return;
    form.dataset.tnDirty='1';
    const box=$('[data-tn-quick-error]',form)||$('[data-tn-client-error]',form);
    if(box)box.textContent='';
  },true);
  document.addEventListener('change',e=>{const f=e.target?.closest?.('form[data-tn-form]');if(f)f.dataset.tnDirty='1';},true);
  document.addEventListener('submit',e=>{
    const form=e.target;
    if(!form?.matches?.('form[data-tn-form]'))return;
    const error=validate(form);
    if(error){e.preventDefault();e.stopImmediatePropagation();notify(form,error[1]);form.elements.namedItem(error[0])?.focus();return;}
    // Habilitar POST MVC con token antifalsificación; anular alerta de cierre tras un guardado válido.
    delete form.dataset.tnDirty;
  },true);
  document.addEventListener('click', e=>{
    const opener=e.target.closest?.('[data-tn-open-modal]');
    if(opener){e.preventDefault();const modal=$('#tn-quick-modal');if(modal?.showModal){modal.showModal();modal.querySelector('input[name="Sku"]')?.focus();}else location.href='/Interfaz/Nuevo';return;}
    const closer=e.target.closest?.('[data-tn-modal-close]');
    if(closer){e.preventDefault();const modal=closer.closest('dialog');const form=$('form[data-tn-form]',modal);
      if(dirty(form)&&!confirm('¿Salir sin guardar? Puedes seguir editando o descartar los cambios.'))return;
      delete form?.dataset.tnDirty;modal.close();return;}
    const clear=e.target.closest?.('[data-tn-clear-filters]');
    if(clear){e.preventDefault();const q=$('[data-tn-search]');if(q){q.value='';q.dispatchEvent(new Event('input',{bubbles:true}));}const chip=$('[data-tn-filter=""]');chip?.click();return;}
    const anchor=e.target.closest?.('a[href]');
    if(anchor&&hasDirty()&&!!anchor.closest('#tn-main')&&!anchor.hasAttribute('download')){
      const target=anchor.getAttribute('href')||'';
      if(!target.startsWith('#')&& !confirm('¿Salir sin guardar? Los datos del formulario se perderán.')){e.preventDefault();e.stopImmediatePropagation();return;}
      all('form[data-tn-form]').forEach(f=>delete f.dataset.tnDirty);
    }
  },true);
  document.addEventListener('cancel',e=>{
    if(e.target?.id!=='tn-quick-modal')return;
    const form=$('form[data-tn-form]',e.target);
    if(dirty(form)&&!confirm('¿Quieres salir sin guardar?'))e.preventDefault();
    else if(form)delete form.dataset.tnDirty;
  },true);
  document.addEventListener('keydown',e=>{
    const modal=$('#tn-quick-modal');const form=modal?.open?$('form[data-tn-form]',modal):$('#tn-main-form');
    if(!form)return;
    if(e.key==='Escape'&&!modal?.open){e.preventDefault();const url='/Interfaz/Inventario';
      if(!dirty(form)||confirm('¿Salir sin guardar? Puedes volver al formulario o descartar los datos.')){delete form.dataset.tnDirty;window.TecnoNova?.navigate?.(url)??(location.href=url);}}
    else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();form.requestSubmit();}
  },true);
  // búsqueda de inventario y CSV, reutilizando los atributos de datos del servidor.
  document.addEventListener('input',e=>{
    if(!e.target?.matches?.('[data-tn-inventory-search]'))return;
    const q=e.target.value.trim().toLocaleLowerCase();const rows=all('[data-tn-inventory-row]');let visible=0;
    rows.forEach(r=>{r.hidden=!!q && !r.dataset.search.includes(q);if(!r.hidden)visible++;});
    const empty=$('[data-tn-inventory-empty]');if(empty)empty.hidden=visible>0;
  });
  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('[data-tn-export]');if(!btn)return;
    const rows=all('[data-tn-inventory-row]').filter(r=>!r.hidden);
    const csv=(s)=>'"'+String(s??'').replaceAll('"','""')+'"';
    const records=[['SKU','Nombre','Categoría','Precio (Bs)','Stock'],...rows.map(r=>[r.dataset.sku,r.dataset.name,r.dataset.category,r.dataset.price,r.dataset.stock])];
    const bytes='\uFEFF'+records.map(row=>row.map(csv).join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([bytes],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='TecnoNova-Inventario.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  });
  // Aviso de abandono cuando se cierra la pestaña, incluso sin navegación parcial.
  window.addEventListener('beforeunload',e=>{if(hasDirty()){e.preventDefault();e.returnValue='';}});
})();
