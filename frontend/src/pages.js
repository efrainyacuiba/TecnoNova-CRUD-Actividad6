// Interacciones propias de cada pantalla. Cada init devuelve (o registra) su limpieza.
import gsap from 'gsap'

/** Inicializa la pantalla dentro de `root`. Devuelve una función de limpieza. */
export function initPage(root) {
  const ac = new AbortController()
  const on = (el, ev, fn, o = {}) => el && el.addEventListener(ev, fn, { signal: ac.signal, ...o })
  const ctx = gsap.context(() => {}, root)
  const page = root.querySelector('[data-tn-page]')
  const name = page?.dataset.tnPage

  ctx.add(() => {
    const items = root.querySelectorAll('[data-tn-reveal]')
    if (items.length) gsap.from(items, { y: 46, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.55, clearProps: 'all' })
    root.querySelectorAll('[data-tn-count]').forEach((el) => {
      const end = parseFloat(el.dataset.tnCount) || 0
      const o = { v: 0 }
      gsap.to(o, { v: end, duration: 1.6, delay: 0.8, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString('es-BO')) })
    })
    root.querySelectorAll('[data-tn-stock]').forEach((el) => {
      gsap.from(el, { scaleX: 0, transformOrigin: 'left', duration: 1.1, delay: 0.9, ease: 'power3.out' })
    })
  })

  // Inclinación 3D de tarjetas
  root.querySelectorAll('[data-tn-tilt]').forEach((card) => {
    on(card, 'pointermove', (e) => {
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      gsap.to(card, { rotateY: x * 10, rotateX: -y * 10, duration: 0.4, transformPerspective: 800, ease: 'power2.out', overwrite: 'auto' })
    })
    on(card, 'pointerleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' }))
  })

  // Catálogo: filtros y búsqueda sobre las tarjetas ya renderizadas por el servidor
  if (name === 'catalog') {
    const cards = [...root.querySelectorAll('[data-tn-card]')]
    const chips = [...root.querySelectorAll('[data-tn-filter]')]
    const search = root.querySelector('[data-tn-search]')
    const empty = root.querySelector('[data-tn-empty]')
    let cat = ''
    const apply = () => {
      const q = (search?.value || '').trim().toLowerCase()
      let n = 0
      cards.forEach((c) => {
        const ok = (!cat || c.dataset.categoria === cat) && (!q || c.dataset.nombre.includes(q))
        c.hidden = !ok
        if (ok) n++
      })
      if (empty) empty.hidden = n > 0
      gsap.fromTo(cards.filter((c) => !c.hidden), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, clearProps: 'all' })
    }
    chips.forEach((ch) => on(ch, 'click', () => {
      cat = ch.dataset.tnFilter
      chips.forEach((x) => x.setAttribute('aria-pressed', String(x === ch)))
      apply()
    }))
    on(search, 'input', apply)
  }

  // Inventario: confirmación en Eliminar (el formulario sigue enviándose a ProductosController)
  root.querySelectorAll('form[data-tn-confirm]').forEach((f) =>
    on(f, 'submit', (e) => { if (!confirm(f.dataset.tnConfirm)) e.preventDefault() }),
  )

  // Nuevo producto: no altera nombres de campos ni el envío; solo ayuda visual
  const form = root.querySelector('form[data-tn-form]')
  if (form) {
    const f = (n) => form.elements[n]
    const prev = {
      nombre: root.querySelector('[data-prev=nombre]'),
      sku: root.querySelector('[data-prev=sku]'),
      precio: root.querySelector('[data-prev=precio]'),
      stock: root.querySelector('[data-prev=stock]'),
    }
    const sync = () => {
      if (prev.nombre) prev.nombre.textContent = f('Nombre').value || 'Nombre del producto'
      if (prev.sku) prev.sku.textContent = f('Sku').value || 'SKU-000'
      if (prev.precio) prev.precio.textContent = 'Bs ' + (f('PrecioTexto').value || '0,00')
      if (prev.stock) prev.stock.textContent = f('Stock').value || '1'
    }
    ;['Nombre', 'Sku', 'PrecioTexto', 'Stock'].forEach((n) => on(f(n), 'input', sync))
    // El precio acepta coma o punto: solo se limpian caracteres inválidos; la validación real es en C#.
    on(f('PrecioTexto'), 'input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9.,-]/g, '')
    })
    const step = (d) => {
      const s = f('Stock')
      s.value = Math.max(0, (parseInt(s.value, 10) || 0) + d)
      sync()
    }
    root.querySelectorAll('[data-tn-step]').forEach((b) => on(b, 'click', () => step(parseInt(b.dataset.tnStep, 10))))
    on(form, 'submit', () => {
      const b = form.querySelector('[type=submit]')
      if (b) { b.classList.add('is-sending'); setTimeout(() => (b.disabled = true), 0) }
    })
    sync()
  }

  return () => {
    ac.abort()
    ctx.revert()
  }
}
