// Escena NUEVO PRODUCTO: ensamblaje tecnológico. Piezas que convergen sobre una plataforma. Violeta / ámbar.
import * as THREE from 'three'
import { makeCPU, makeRAM, makeFan, makeSSD, makePhone, makeLaptop } from '../engine/models.js'
import { makeParticles, makeGlow, glowMat, mat, makeGrid, rng } from '../engine/gfx.js'
import { pose, fly, origin } from './util.js'

export function createNuevo({ px, light }) {
  const o = origin(3)
  const group = new THREE.Group()
  group.position.copy(o)

  const grid = makeGrid({ size: 180, div: 90, color: 0xffa24a })
  grid.position.y = -2.6
  group.add(grid)
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.8, 0.4, 64), mat(0x1a1030, { metalness: 0.9, roughness: 0.3 }))
  plat.position.y = -2.4
  group.add(plat)
  const pulses = [0, 1, 2].map(() => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 100).rotateX(Math.PI / 2), glowMat(0xffa24a, 0.8))
    r.position.y = -2.15
    group.add(r)
    return r
  })
  const column = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 14, 48, 1, true), glowMat(0x9b5cff, 0.06))
  column.position.y = 4.8
  group.add(column)

  // piezas: [objeto, posición ensamblada, rotación ensamblada]
  const defs = [
    [makeCPU({ size: 3.4, accent: '#ffa24a', label: 'NOVA X1' }), [0, -1.2, 0], [0, 0, 0]],
    [makeRAM({ accent: 0xffa24a }), [-2.6, -0.5, 0], [0, Math.PI / 2, 0]],
    [makeRAM({ accent: 0x9b5cff }), [2.6, -0.5, 0], [0, Math.PI / 2, 0]],
    [makeFan({ r: 1.3, accent: 0xffa24a }), [0, 0.3, 0], [0, 0, 0]],
    [makeSSD(), [0, -1.9, 2.2], [0, 0, 0]],
    [makeSSD({ accent: 0x9b5cff }), [0, -1.9, -2.2], [0, 0, 0]],
    [makePhone({ hue: 30 }), [0, 1.8, 0], [-0.2, 0.4, 0]],
    [Object.assign(makeLaptop({ hue: 30, w: 2.4, d: 1.7, label: 'TN-PRO' }), {}), [0, 3.3, 0], [0, 0.2, 0]],
  ]
  const r = rng(77)
  const parts = defs.map(([obj, ap, ar], i) => {
    group.add(obj)
    const ang = r() * Math.PI * 2
    const rad = 13 + r() * 6
    return {
      obj, ap: new THREE.Vector3(...ap), ar: new THREE.Euler(...ar),
      ep: new THREE.Vector3(Math.cos(ang) * rad, (r() - 0.3) * 12, Math.sin(ang) * rad - 4),
      er: new THREE.Euler((r() - 0.5) * 6, (r() - 0.5) * 6, (r() - 0.5) * 6), i,
    }
  })
  const S = { asm: 0.92 } // 0 = disperso, 1 = ensamblado
  const tmpQ = new THREE.Quaternion()
  const qa = new THREE.Quaternion()
  const qb = new THREE.Quaternion()
  function place(t) {
    parts.forEach((p) => {
      const e = THREE.MathUtils.smootherstep(THREE.MathUtils.clamp((S.asm - p.i * 0.045) / 0.6, 0, 1), 0, 1)
      const breath = 1 + Math.sin(t * 0.9) * 0.05 * e
      p.obj.position.lerpVectors(p.ep, p.ap, e)
      p.obj.position.x += (p.ap.x * (breath - 1)) * 2
      p.obj.position.y += (1 - e) * Math.sin(t * 1.3 + p.i) * 0.6 + p.ap.y * (breath - 1)
      qa.setFromEuler(p.er); qb.setFromEuler(p.ar)
      p.obj.quaternion.copy(tmpQ.copy(qa).slerp(qb, e))
      if (p.obj.userData.rotor) p.obj.userData.rotor.rotation.y = t * 7
    })
  }
  group.add(makeParticles({ count: light ? 280 : 620, color: 0xffc27a, box: [60, 26, 90], px }))
  const gl = makeGlow(0xff9b3d, 20, 0.28)
  gl.position.y = 0
  group.add(gl)

  const rest = pose(o, [0, 3.6, 13], [0, 0.4, 0], 50, 0.24)

  return {
    name: 'nuevo', group, origin: o, rest,
    env: {
      bg: 0x0c0414, fog: [26, 85], flash: '#ffd9a8',
      hemi: [0xb98cff, 0x1a0a22, 0.5],
      p1: { c: 0xffa24a, pos: [-6, 6, 6], i: 170, d: 42 },
      p2: { c: 0x9b5cff, pos: [8, 3, -4], i: 150, d: 42 },
    },
    update(t) {
      place(t)
      pulses.forEach((p, k) => {
        const u = ((t * 0.35 + k / 3) % 1)
        p.scale.setScalar(1 + u * 9)
        p.material.opacity = (1 - u) * 0.8
      })
      column.rotation.y = t * 0.2
    },
    exit(tl, rig) {
      tl.to(S, { asm: 1, duration: 0.6, ease: 'power2.out' }, 0)
      fly(tl, rig, pose(o, [0, 0.4, 2.4], [0, -0.4, 0], 90, 0), 1.2, 0, 'power3.in')
    },
    enter(tl, rig) {
      S.asm = 0
      tl.set(rig, pose(o, [-16, 7, 24], [0, 0, 0], 70, 0), 0)
      tl.to(S, { asm: 0.92, duration: 3.0, ease: 'power2.inOut' }, 0.1)
      fly(tl, rig, rest, 3.0, 0, 'power2.inOut')
    },
  }
}
