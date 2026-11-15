// Escena INVENTARIO: placa base con RAM, ventilador y disipadores bajo luz verde / ámbar.
import * as THREE from 'three'
import { makeCPU, makeRAM, makeFan, makeHeatsink, makeSSD, makeLaptop } from '../engine/models.js'
import { makeTraces, makeParticles, makeGlow, glowMat, mat, fade } from '../engine/gfx.js'
import { pose, fly, origin } from './util.js'

export function createInventory({ px, light }) {
  const o = origin(2)
  const group = new THREE.Group()
  group.position.copy(o)

  const board = new THREE.Mesh(new THREE.BoxGeometry(36, 0.4, 26), mat(0x062820, { metalness: 0.3, roughness: 0.6 }))
  board.position.y = -0.3
  group.add(board)
  const traces = makeTraces({ count: light ? 90 : 170, extent: [34, 24], color: 0x2cff9a, seed: 5, segs: [5, 11] })
  traces.position.y = -0.08
  group.add(traces)
  const amber = makeTraces({ count: 40, extent: [34, 24], color: 0xffb347, seed: 9, segs: [3, 6] })
  amber.position.y = -0.07
  group.add(amber)

  const cpu = makeCPU({ size: 4.6, accent: '#2cff9a', label: 'NOVA X1' })
  cpu.position.set(-3.5, 0.1, 0)
  group.add(cpu)
  const fan = makeFan({ r: 1.5, accent: 0x2cff9a })
  fan.position.set(-3.5, 1.1, 0)
  group.add(fan)
  for (let i = 0; i < 4; i++) {
    const r = makeRAM({ accent: i % 2 ? 0xffb347 : 0x2cff9a })
    r.position.set(5 + i * 0.9, 0.5, -1)
    group.add(r)
  }
  const sink = makeHeatsink({ w: 3, h: 1.6, d: 4 })
  sink.position.set(-9.5, -0.1, 0)
  group.add(sink)
  const sink2 = makeHeatsink({ w: 6, h: 0.9, d: 1.4, fins: 18 })
  sink2.position.set(-3.5, -0.1, -5.6)
  group.add(sink2)
  const ssd = makeSSD()
  ssd.position.set(3, 0.1, 8.4)
  group.add(ssd)
  const ssd2 = makeSSD({ accent: 0x2cff9a })
  ssd2.position.set(3, 0.1, 6.6)
  group.add(ssd2)
  // ranuras PCIe
  for (let i = 0; i < 2; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(11, 0.35, 0.45), mat(0x0b0f12, { metalness: 0.4 }))
    s.position.set(-5, 0.0, 8 - i * 2.4)
    group.add(s)
    const l = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.02, 0.06), glowMat(0x2cff9a, 0.7))
    l.position.set(-5, 0.19, 8 - i * 2.4)
    group.add(l)
  }
  // condensadores
  const caps = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.3, 0.7, 14), mat(0x1a2a36, { metalness: 0.8 }), 28)
  const m4 = new THREE.Matrix4()
  for (let i = 0; i < 28; i++) {
    m4.setPosition(-14 + (i % 14) * 0.85, 0.2, -10.5 + Math.floor(i / 14) * 0.9)
    caps.setMatrixAt(i, m4)
  }
  group.add(caps)
  // haz de escaneo de inventario
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 26).rotateX(-Math.PI / 2), glowMat(0xffb347, 0.9))
  scan.position.y = 1.2
  group.add(scan)
  const scanGlow = new THREE.Mesh(new THREE.PlaneGeometry(3, 26).rotateX(-Math.PI / 2), glowMat(0xffb347, 0.08))
  scanGlow.position.y = 1.2
  group.add(scanGlow)

  // "pantalla" de laptop que se disuelve al llegar desde Catálogo
  const shell = makeLaptop({ hue: 290, w: 12, d: 8, label: 'NOVA BOOK' })
  shell.userData.setOpen(Math.PI / 2 + 0.1)
  shell.position.set(0, 3, 0)
  shell.visible = false
  group.add(shell)
  group.add(makeParticles({ count: light ? 240 : 520, color: 0x8dffc2, box: [60, 26, 90], px }))
  const gl = makeGlow(0x2cff9a, 30, 0.22)
  gl.position.set(0, 3, 0)
  group.add(gl)

  const rest = pose(o, [2, 12, 13.5], [-1.5, 0, 0], 48, 0)

  return {
    name: 'inventory', group, origin: o, rest,
    env: {
      bg: 0x020d0a, fog: [30, 90], flash: '#b6ffd8',
      hemi: [0x66ffb5, 0x03150f, 0.5],
      p1: { c: 0x2cff9a, pos: [-6, 9, 5], i: 150, d: 40 },
      p2: { c: 0xffb347, pos: [9, 6, -5], i: 130, d: 36 },
    },
    update(t) {
      fan.userData.rotor.rotation.y = t * 9
      const k = (Math.sin(t * 0.7) * 0.5 + 0.5) * 30 - 15
      scan.position.x = k
      scanGlow.position.x = k
    },
    exit(tl, rig) {
      fly(tl, rig, pose(o, [4, 0.9, 3], [11, 0.4, -1], 90, 0), 1.2, 0, 'power3.in')
    },
    enter(tl, rig, from) {
      shell.visible = false
      if (from === 'catalog') {
        // Continuidad con la pantalla de la laptop: se levanta y se disuelve revelando la placa.
        shell.visible = true
        fade(shell, 1)
        shell.rotation.set(0, 0, 0)
        shell.position.set(0, 2.2, 0)
        tl.set(rig, pose(o, [0, 3.2, 3.2], [0, 2.4, 0], 70, 0), 0)
        tl.to(shell.position, { y: 12, duration: 1.7, ease: 'power2.in' }, 0.15)
        tl.to(shell.rotation, { x: -1.0, duration: 1.7, ease: 'power2.in' }, 0.15)
        tl.to({ v: 1 }, { v: 0, duration: 1.2, ease: 'none', onUpdate() { fade(shell, this.targets()[0].v) } }, 0.2)
        tl.add(() => { shell.visible = false }, 1.9)
        const path = pose(o, [-12, 1.3, 7], [-3, 0.3, 0], 80, 0)
        tl.to(rig, { ...path, duration: 1.0, ease: 'power2.inOut', overwrite: 'auto' }, 0.1)
        fly(tl, rig, pose(o, [3, 1.1, 5], [5, 0.3, -1], 78, 0), 1.0, 1.1, 'power1.inOut')
        fly(tl, rig, rest, 1.6, 2.0, 'power3.inOut')
      } else {
        tl.set(rig, pose(o, [-14, 1.0, 6], [-2, 0.3, 0], 88, 0), 0)
        fly(tl, rig, pose(o, [2, 1.6, 6], [3, 0.3, -1], 70, 0), 1.2, 0, 'power1.in')
        fly(tl, rig, rest, 1.8, 1.2, 'power3.out')
      }
    },
  }
}
