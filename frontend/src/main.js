// Punto de entrada: se carga una vez desde _Layout.cshtml y vive mientras dure la sesión de navegación.
import { createStage } from './engine/stage.js'
import { createNavigator, sceneFor } from './nav.js'
import gsap from 'gsap'

export function boot() {
  if (window.TecnoNova) window.TecnoNova.destroy()
  const canvas = document.getElementById('tn-stage')
  const flash = document.getElementById('tn-flash')
  const main = document.getElementById('tn-main')
  if (!main) return
  let stage = null
  try {
    if (!canvas) throw new Error('sin canvas')
    stage = createStage(canvas, flash)
  } catch (err) {
    console.warn('[TecnoNova] WebGL no disponible, se usa solo la navegación animada 2D:', err)
    document.body.classList.add('tn-no-webgl')
  }
  const markActive = (scene) => {
    document.body.dataset.tnScene = scene
    document.querySelectorAll('[data-tn-link]').forEach((a) => {
      const on = sceneFor(a.href) === scene
      on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')
    })
  }
  const initial = sceneFor(location.href) || main.querySelector('[data-tn-page]')?.dataset.tnPage || 'home'
  const sceneName = { home: 'home', catalog: 'catalog', inventory: 'inventory', nuevo: 'nuevo' }[initial] || 'home'
  const nav = createNavigator({ stage, main, onPageChange: markActive })
  markActive(sceneName)
  stage?.start(sceneName)
  document.body.classList.add('tn-ready')
  // Menú móvil
  const toggle = document.querySelector('[data-tn-menu]')
  const onToggle = () => document.body.classList.toggle('tn-menu-open')
  toggle?.addEventListener('click', onToggle)
  document.addEventListener('click', (e) => { if (e.target.closest('.tn-nav a')) document.body.classList.remove('tn-menu-open') })
  window.TecnoNova = {
    stage,
    navigate: nav.go,
    destroy() {
      nav.destroy()
      stage?.destroy()
      toggle?.removeEventListener('click', onToggle)
      gsap.globalTimeline.clear()
      window.TecnoNova = null
    },
  }
}

if (!window.__TN_MANUAL_BOOT__) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
}
