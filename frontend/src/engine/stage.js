// Escenario WebGL persistente: un solo renderer, una sola cámara y 4 escenas.
// La navegación solo anima la cámara/escena; el canvas nunca se destruye entre páginas.
import * as THREE from 'three'
import gsap from 'gsap'
import { TIME, WARP, WARPD } from './gfx.js'
import { createHome } from '../scenes/home.js'
import { createCatalog } from '../scenes/catalog.js'
import { createInventory } from '../scenes/inventory.js'
import { createNuevo } from '../scenes/nuevo.js'

export function createStage(canvas, flashEl) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
  const light = Math.min(innerWidth, innerHeight) < 700 || matchMedia('(pointer:coarse)').matches
  const dpr = Math.min(devicePixelRatio || 1, light ? 1.5 : 2)
  renderer.setPixelRatio(dpr)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020814)
  scene.fog = new THREE.Fog(0x020814, 30, 95)
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400)

  // 3 luces globales que cambian de color/posición según la escena (evita recompilar shaders)
  const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 0.5)
  const p1 = new THREE.PointLight(0xffffff, 0, 40, 1.4)
  const p2 = new THREE.PointLight(0xffffff, 0, 40, 1.4)
  scene.add(hemi, p1, p2)

  const opts = { px: dpr, light }
  const scenes = {
    home: createHome(opts),
    catalog: createCatalog(opts),
    inventory: createInventory(opts),
    nuevo: createNuevo(opts),
  }
  Object.values(scenes).forEach((s) => { s.group.visible = false; scene.add(s.group) })

  const rig = { x: 0, y: 5, z: 14, lx: 0, ly: 0, lz: 0, fov: 50, vx: 0 }
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  const lightLevel = { v: 1 }
  let current = null
  let tl = null
  let width = 1
  let height = 1

  function resize() {
    width = innerWidth
    height = innerHeight
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', resize)
  resize()
  const onMove = (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1
    pointer.y = (e.clientY / innerHeight) * 2 - 1
  }
  addEventListener('pointermove', onMove, { passive: true })

  function applyEnv(s) {
    const e = s.env
    const o = s.origin
    scene.background.setHex(e.bg)
    scene.fog.color.setHex(e.bg)
    scene.fog.near = e.fog[0]
    scene.fog.far = e.fog[1]
    hemi.color.setHex(e.hemi[0])
    hemi.groundColor.setHex(e.hemi[1])
    hemi.userData.i = e.hemi[2]
    ;[[p1, e.p1], [p2, e.p2]].forEach(([l, d]) => {
      l.color.setHex(d.c)
      l.position.set(o.x + d.pos[0], d.pos[1], d.pos[2])
      l.distance = d.d
      l.userData.i = d.i
    })
    if (flashEl) flashEl.style.setProperty('--tn-flash', e.flash)
  }

  const tmpV = new THREE.Vector3()
  let last = performance.now()
  let raf = 0
  function frame() {
    raf = requestAnimationFrame(frame)
    const nowT = performance.now()
    const dt = Math.min((nowT - last) / 1000, 0.05)
    last = nowT
    TIME.value += dt
    WARPD.value += WARP.value * dt * 60
    pointer.sx += (pointer.x - pointer.sx) * 0.05
    pointer.sy += (pointer.y - pointer.sy) * 0.05
    Object.values(scenes).forEach((s) => s.group.visible && s.update(TIME.value, dt))
    const L = lightLevel.v
    hemi.intensity = (hemi.userData.i ?? 0.5) * L
    p1.intensity = (p1.userData.i ?? 0) * L
    p2.intensity = (p2.userData.i ?? 0) * L

    // Cámara: pose animada + paralaje con el puntero + adaptación a pantallas verticales.
    const k = camera.aspect < 1 ? 1 + (1 - camera.aspect) * 0.95 : 1
    const par = tl ? 0.25 : 1
    tmpV.set(rig.lx, rig.ly, rig.lz)
    camera.position.set(
      tmpV.x + (rig.x - tmpV.x) * k + pointer.sx * 1.6 * par,
      tmpV.y + (rig.y - tmpV.y) * k - pointer.sy * 0.9 * par,
      tmpV.z + (rig.z - tmpV.z) * k,
    )
    camera.lookAt(tmpV)
    camera.fov = rig.fov
    camera.updateProjectionMatrix()
    const portrait = camera.aspect < 0.9
    const vx = portrait ? 0 : -rig.vx * width
    const vy = portrait ? -height * 0.2 : 0
    camera.setViewOffset(width, height, vx, vy, width, height)
    renderer.render(scene, camera)
  }

  function show(name) {
    Object.entries(scenes).forEach(([n, s]) => (s.group.visible = n === name))
  }

  const api = {
    scenes,
    get current() { return current },
    /** Primera carga: la cámara entra desde lejos. */
    start(name) {
      current = name
      const s = scenes[name]
      show(name)
      applyEnv(s)
      lightLevel.v = 1
      const t = gsap.timeline({ onComplete: () => (tl = null) })
      tl = t
      s.enter(t, rig, 'boot')
      if (!raf) frame()
      return t
    },
    /** Fase 1: la cámara abandona la escena actual y el destello cubre la pantalla. */
    runExit(to) {
      tl?.kill()
      const s = scenes[current]
      const t = gsap.timeline()
      tl = t
      const T = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.01 : 1
      s.exit(t, rig, to)
      const end = Math.max(t.duration(), 0.8)
      t.to(WARP, { value: 1, duration: end * 0.8, ease: 'power2.in' }, 0)
      t.to(flashEl, { opacity: 1, duration: 0.28, ease: 'power2.in' }, end - 0.28)
      t.timeScale(1 / T)
      return new Promise((res) => t.eventCallback('onComplete', res))
    },
    /** Fase 2: se sustituye la escena (con el destello cubriendo) y la cámara entra en la nueva. */
    runEnter(to) {
      const from = current
      scenes[from].reset?.()
      current = to
      const s = scenes[to]
      show(to)
      applyEnv(s)
      tl?.kill()
      const t = gsap.timeline({ onComplete: () => { tl = null } })
      tl = t
      s.enter(t, rig, from)
      lightLevel.v = 0
      t.to(lightLevel, { v: 1, duration: 1.2, ease: 'power2.out' }, 0)
      t.to(WARP, { value: 0, duration: 1.4, ease: 'power2.out' }, 0)
      t.to(flashEl, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.15)
      return t
    },
    destroy() {
      cancelAnimationFrame(raf)
      raf = 0
      tl?.kill()
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
      scene.traverse((o) => {
        o.geometry?.dispose?.()
        const m = o.material
        ;(Array.isArray(m) ? m : m ? [m] : []).forEach((x) => { x.map?.dispose?.(); x.dispose() })
      })
      renderer.dispose()
    },
  }
  return api
}
