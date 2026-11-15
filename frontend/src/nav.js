// Navegación parcial compatible con MVC: intercepta solo GET a las 4 pantallas de Interfaz,
// pide el HTML al servidor, lanza la transición 3D y reemplaza #tn-main sin tocar el canvas WebGL.
import gsap from 'gsap'
import { initPage } from './pages.js'

const ROUTES = {
  inicio: 'home', index: 'home', '': 'home',
  catalogo: 'catalog',
  inventario: 'inventory',
  nuevo: 'nuevo',
}

/** Devuelve el nombre de escena si la URL es una de las 4 pantallas, o null. */
export function sceneFor(url) {
  const u = new URL(url, location.href)
  if (u.origin !== location.origin) return null
  const m = u.pathname.replace(/\/+$/, '').match(/^\/interfaz(?:\/([^/]+))?$/i)
  if (!m) return null
  return ROUTES[(m[1] || '').toLowerCase()] ?? null
}

export function createNavigator({ stage, main, onPageChange }) {
  let cleanup = initPage(main)
  let busy = false
  const current = () => sceneFor(location.href)
  history.replaceState({ tn: 1 }, '', location.href)

  async function go(url, { push = true } = {}) {
    const to = sceneFor(url)
    const from = stage?.current ?? current()
    if (!to || busy) return
    if (to === from) return
    busy = true
    document.body.classList.add('tn-transitioning')
    const abort = new AbortController()
    const timer = setTimeout(() => abort.abort(), 9000)
    try {
      const fetchP = fetch(url, { headers: { 'X-Requested-With': 'TecnoNovaPartial', Accept: 'text/html' }, credentials: 'same-origin', signal: abort.signal }).then(async (r) => {
        const type = r.headers.get('content-type') || ''
        if (!r.ok || !type.includes('text/html') || sceneFor(r.url) !== to) throw new Error('respuesta no válida')
        return r.text()
      })
      // 1) la cámara abandona la escena actual mientras el servidor responde
      gsap.to(main, { opacity: 0, y: -24, scale: 1.04, filter: 'blur(10px)', duration: 0.7, ease: 'power2.in' })
      const exitP = stage ? stage.runExit(to) : new Promise((r) => setTimeout(r, 650))
      const [html] = await Promise.all([fetchP, exitP])
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const next = doc.querySelector('#tn-main')
      if (!next) throw new Error('falta #tn-main')
      // 2) swap: limpiar la pantalla anterior, insertar la nueva, reiniciar interacciones
      cleanup()
      main.innerHTML = next.innerHTML
      document.title = doc.title || document.title
      gsap.set(main, { clearProps: 'all' })
      scrollTo(0, 0)
      if (push) history.pushState({ tn: 1 }, '', url)
      cleanup = initPage(main)
      onPageChange?.(to)
      if (stage) {
        const t = stage.runEnter(to)
        await new Promise((r) => t.eventCallback('onUpdate', () => t.time() > 0.9 && (t.eventCallback('onUpdate', null), r())))
      }
    } catch (err) {
      // Respaldo: navegación MVC normal
      console.warn('[TecnoNova] navegación parcial fallida, usando navegación normal:', err)
      location.href = url
      return
    } finally {
      clearTimeout(timer)
      busy = false
      document.body.classList.remove('tn-transitioning')
    }
  }

  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = e.target.closest?.('a[href]')
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.tnNative !== undefined) return
    if (!sceneFor(a.href)) return
    e.preventDefault()
    go(a.href)
  }
  const onPop = () => {
    if (sceneFor(location.href)) go(location.href, { push: false })
    else location.reload()
  }
  document.addEventListener('click', onClick)
  addEventListener('popstate', onPop)

  return {
    go,
    destroy() {
      document.removeEventListener('click', onClick)
      removeEventListener('popstate', onPop)
      cleanup()
    },
  }
}
