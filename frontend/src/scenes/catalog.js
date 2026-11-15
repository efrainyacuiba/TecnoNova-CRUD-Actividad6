// Escena CATÁLOGO: laboratorio holográfico con laptops y celulares. Magenta / violeta / turquesa.
import * as THREE from 'three'
import { makeLaptop, makePhone } from '../engine/models.js'
import { makeGrid, makeParticles, makeGlow, glowMat, mat } from '../engine/gfx.js'
import { pose, fly, origin } from './util.js'

export function createCatalog({ px, light }) {
  const o = origin(1)
  const group = new THREE.Group()
  group.position.copy(o)

  const grid = makeGrid({ size: 220, div: 110, color: 0xb35cff })
  grid.position.y = -2.4
  group.add(grid)

  // laptop héroe
  const hero = makeLaptop({ hue: 290, w: 3.8, d: 2.6, label: 'NOVA BOOK' })
  hero.position.y = -0.6
  group.add(hero)
  const heroRing = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.04, 6, 100).rotateX(Math.PI / 2), glowMat(0xff3df0, 0.8))
  heroRing.position.y = -2.3
  group.add(heroRing)
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 8, 40, 1, true), glowMat(0xb35cff, 0.07))
  beam.position.y = 1.7
  group.add(beam)

  // órbita de productos
  const items = []
  const N = 8
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    const isPhone = i % 2 === 1
    const m = isPhone ? makePhone({ hue: 180 + i * 30 }) : makeLaptop({ hue: 260 + i * 15, w: 2.2, d: 1.5, label: 'TN-' + (100 + i) })
    if (isPhone) m.scale.setScalar(1.15)
    const pivot = new THREE.Group()
    pivot.add(m)
    group.add(pivot)
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.12, 32), mat(0x1b1430, { metalness: 0.9 }))
    pad.position.set(Math.cos(a) * 8, -2.3, Math.sin(a) * 8 - 2)
    group.add(pad)
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.95, 3.6, 24, 1, true), glowMat(i % 2 ? 0x31e6ff : 0xff3df0, 0.1))
    cone.position.set(pad.position.x, -0.5, pad.position.z)
    group.add(cone)
    items.push({ pivot, a, m, isPhone, r: 8, base: -0.9 + (i % 3) * 0.35 })
  }
  // paneles de cristal del laboratorio
  for (let i = -3; i <= 3; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(5.6, 9, 0.05), glowMat(0x7a4dff, 0.07))
    p.position.set(i * 6, 2.4, -17)
    group.add(p)
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(p.geometry), new THREE.LineBasicMaterial({ color: 0xb35cff, transparent: true, opacity: 0.6 }))
    e.position.copy(p.position)
    group.add(e)
  }
  // portal de entrada al laboratorio
  const gate = new THREE.Group()
  gate.position.z = 24
  const gm = mat(0x151028, { metalness: 0.9, roughness: 0.3 })
  const left = new THREE.Mesh(new THREE.BoxGeometry(14, 24, 0.8), gm)
  const right = left.clone()
  const edgeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.15, 24, 0.9), glowMat(0xff3df0, 1))
  left.add(edgeGlow.clone().translateX(7))
  right.add(edgeGlow.clone().translateX(-7))
  gate.add(left, right)
  group.add(gate)
  const g1 = makeGlow(0xff3df0, 26, 0.35)
  g1.position.set(0, 2, -6)
  group.add(g1)
  group.add(makeParticles({ count: light ? 300 : 700, color: 0xf08bff, box: [70, 26, 110], px }))

  const rest = pose(o, [0, 1.8, 14], [0, 0, 0], 52, 0)
  const setGate = (v) => { left.position.x = -7 - v; right.position.x = 7 + v }
  setGate(0)

  return {
    name: 'catalog', group, origin: o, rest,
    env: {
      bg: 0x08031a, fog: [28, 110], flash: '#ff9bf6',
      hemi: [0xb78cff, 0x14062c, 0.6],
      p1: { c: 0xff3df0, pos: [-8, 6, 5], i: 170, d: 45 },
      p2: { c: 0x31e6ff, pos: [9, 3, 3], i: 140, d: 45 },
    },
    update(t) {
      hero.rotation.y = Math.sin(t * 0.35) * 0.5
      hero.position.y = -0.6 + Math.sin(t) * 0.1
      heroRing.rotation.y = t * 0.4
      items.forEach((it, k) => {
        const a = it.a + t * 0.12
        it.pivot.position.set(Math.cos(a) * it.r, it.base + Math.sin(t * 1.1 + k) * 0.35, Math.sin(a) * it.r - 2)
        it.m.rotation.y = -a + Math.PI / 2 + Math.sin(t + k) * 0.2
      })
    },
    exit(tl, rig, to) {
      if (to === 'inventory') {
        // Acercamiento a la pantalla de la laptop: de ahí saldremos a la placa base.
        tl.to(hero.rotation, { y: 0, duration: 0.5, ease: 'power2.out' }, 0)
        tl.to(hero.userData.screen.color, { r: 2.4, g: 2.4, b: 2.4, duration: 1.2, ease: 'power2.in' }, 0.2)
        fly(tl, rig, pose(o, [0, -0.1, 3.3], [0, -0.1, -1.3], 46, 0), 1.35, 0, 'power3.inOut')
      } else {
        fly(tl, rig, pose(o, [0, 1.2, 1.5], [0, -0.3, -9], 92, 0), 1.2, 0, 'power3.in')
      }
    },
    enter(tl, rig, from) {
      hero.userData.screen.color.setRGB(1, 1, 1)
      tl.set(rig, pose(o, [0, 0.8, 48], [0, 0.4, 0], 100, 0), 0)
      const gs = { v: 0 }
      tl.set(gs, { v: 0 }, 0).to(gs, { v: 10, duration: 1.1, ease: 'power3.inOut', onUpdate: () => setGate(gs.v) }, 0)
      fly(tl, rig, rest, 2.3, 0, 'power3.out')
    },
    reset() { setGate(0) },
  }
}
