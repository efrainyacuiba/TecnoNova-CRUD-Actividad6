// Escena INICIO: procesador gigante sobre una placa con pistas de energía. Azul eléctrico.
import * as THREE from 'three'
import { makeCPU } from '../engine/models.js'
import { makeTraces, makeParticles, makeGlow, glowMat, mat } from '../engine/gfx.js'
import { pose, fly, origin } from './util.js'

export function createHome({ px, light }) {
  const o = origin(0)
  const group = new THREE.Group()
  group.position.copy(o)

  const board = new THREE.Mesh(new THREE.PlaneGeometry(90, 70).rotateX(-Math.PI / 2), mat(0x04101e, { metalness: 0.5, roughness: 0.7 }))
  board.position.y = -0.2
  group.add(board)
  const traces = makeTraces({ count: light ? 70 : 130, outward: true, hole: 4.7, maxR: 40, color: 0x39d0ff, seed: 11 })
  traces.position.y = -0.1
  group.add(traces)

  const cpu = makeCPU({ size: 6, accent: '#39d0ff', label: 'NOVA X1' })
  cpu.scale.setScalar(1.5)
  group.add(cpu)
  const glow = makeGlow(0x2f9bff, 22, 0.55)
  glow.position.y = 0.5
  group.add(glow)

  const rings = [0, 1].map((i) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(7.5 + i * 1.6, 0.025, 6, 120).rotateX(Math.PI / 2), glowMat(i ? 0x7aa7ff : 0x39d0ff, 0.7))
    r.position.y = 0.2
    group.add(r)
    return r
  })
  group.add(makeParticles({ count: light ? 260 : 560, color: 0x7ad0ff, px }))

  const rest = pose(o, [0, 5.2, 14.5], [0, 0, 0], 48, 0.2)

  return {
    name: 'home', group, origin: o, rest,
    env: {
      bg: 0x020814, fog: [30, 95], flash: '#9fdcff',
      hemi: [0x5aa8ff, 0x04101e, 0.55],
      p1: { c: 0x39d0ff, pos: [-6, 7, 6], i: 160, d: 40 },
      p2: { c: 0x6c5bff, pos: [8, 4, -4], i: 90, d: 36 },
    },
    update(t) {
      cpu.rotation.y = Math.sin(t * 0.3) * 0.28
      cpu.position.y = Math.sin(t * 0.8) * 0.12
      rings[0].rotation.y = t * 0.2
      rings[1].rotation.y = -t * 0.14
      rings.forEach((r, i) => (r.scale.setScalar(1 + Math.sin(t * 0.9 + i) * 0.03)))
    },
    exit(tl, rig) {
      // El procesador se acerca a la cámara hasta ocupar toda la pantalla.
      fly(tl, rig, pose(o, [0, 1.1, 2.4], [0, 0.3, 0], 88, 0), 1.25, 0, 'power3.in')
      tl.to(cpu.rotation, { y: 0, x: -0.05, duration: 1.1, ease: 'power2.out' }, 0)
      tl.to(cpu.scale, { x: 2.3, y: 2.3, z: 2.3, duration: 1.25, ease: 'power3.in' }, 0)
      tl.to(rings.map((r) => r.scale), { x: 2.6, z: 2.6, duration: 1.2, ease: 'power2.in' }, 0)
    },
    enter(tl, rig, from) {
      cpu.scale.setScalar(1.5)
      cpu.rotation.x = 0
      rings.forEach((r) => r.scale.setScalar(1))
      if (from === 'boot') {
        tl.set(rig, pose(o, [0, 14, 52], [0, 0, 0], 34, 0), 0)
        fly(tl, rig, rest, 2.6, 0, 'power3.out')
      } else {
        tl.set(rig, pose(o, [0, 1.2, 2.6], [0, 0.3, 0], 90, 0), 0)
        fly(tl, rig, rest, 2, 0, 'power3.out')
      }
    },
  }
}
