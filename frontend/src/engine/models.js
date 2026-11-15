// Modelos 3D procedurales (procesador, laptop, celular, RAM, ventilador, SSD...).
// Son geometría generada por código: no hay archivos .glb que descargar ni licenciar.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { canvasTex, mat, glowMat } from './gfx.js'

export function makeCPU({ size = 6, accent = '#39d0ff', label = 'NOVA X1' } = {}) {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.BoxGeometry(size, 0.16, size), mat(0x0a3b30, { metalness: 0.2, roughness: 0.55 })))
  // condensadores SMD alrededor del disipador
  const caps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.1, 0.12), mat(0xc9a24e, { metalness: 1, roughness: 0.3 }), 64)
  const m4 = new THREE.Matrix4()
  for (let i = 0; i < 64; i++) {
    const side = i % 4
    const t = ((i / 4) | 0) / 16 - 0.5
    const h = size * 0.445
    const [x, z] = side === 0 ? [t * size * 0.8, h] : side === 1 ? [t * size * 0.8, -h] : side === 2 ? [h, t * size * 0.8] : [-h, t * size * 0.8]
    m4.makeRotationY(side > 1 ? Math.PI / 2 : 0).setPosition(x, 0.13, z)
    caps.setMatrixAt(i, m4)
  }
  g.add(caps)
  const sp = new THREE.Mesh(new RoundedBoxGeometry(size * 0.78, 0.3, size * 0.78, 3, 0.08), mat(0xb9c4d0, { metalness: 1, roughness: 0.22 }))
  sp.position.y = 0.24
  g.add(sp)
  const tex = canvasTex(512, 512, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h)
    gr.addColorStop(0, '#1b2634')
    gr.addColorStop(1, '#05080d')
    c.fillStyle = gr
    c.fillRect(0, 0, w, h)
    c.strokeStyle = accent
    c.globalAlpha = 0.3
    c.lineWidth = 1
    for (let i = 0; i <= w; i += 16) {
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke()
      c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke()
    }
    c.globalAlpha = 1
    c.lineWidth = 3
    c.strokeRect(36, 36, w - 72, h - 72)
    c.globalAlpha = 0.18
    c.fillStyle = accent
    c.fillRect(140, 140, w - 280, h - 280)
    c.globalAlpha = 1
    c.strokeRect(140, 140, w - 280, h - 280)
    c.fillStyle = '#fff'
    c.textAlign = 'center'
    c.font = '700 46px monospace'
    c.fillText(label, w / 2, h / 2 - 4)
    c.font = '500 19px monospace'
    c.fillText('TECNONOVA · 16 CORES', w / 2, h / 2 + 34)
    c.beginPath(); c.moveTo(36, 36); c.lineTo(96, 36); c.lineTo(36, 96); c.fill()
  })
  const top = new THREE.Mesh(
    new THREE.PlaneGeometry(size * 0.7, size * 0.7).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.85, metalness: 0.5, roughness: 0.4 }),
  )
  top.position.y = 0.4
  g.add(top)
  g.userData.top = top
  const rim = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(size * 0.78, 0.3, size * 0.78)),
    new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.8 }),
  )
  rim.position.y = 0.24
  g.add(rim)
  return g
}

function screenTexture(hue, label) {
  return canvasTex(512, 320, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h)
    gr.addColorStop(0, `hsl(${hue},80%,14%)`)
    gr.addColorStop(1, `hsl(${hue + 50},80%,8%)`)
    c.fillStyle = gr
    c.fillRect(0, 0, w, h)
    c.fillStyle = `hsl(${hue},100%,65%)`
    for (let i = 0; i < 12; i++) {
      const bh = 30 + ((i * 53) % 110)
      c.globalAlpha = 0.75
      c.fillRect(40 + i * 36, h - 50 - bh, 22, bh)
    }
    c.globalAlpha = 1
    c.strokeStyle = `hsl(${hue + 40},100%,75%)`
    c.lineWidth = 3
    c.beginPath()
    for (let i = 0; i <= 20; i++) c.lineTo(30 + i * 23, 90 + Math.sin(i * 0.7) * 30)
    c.stroke()
    c.fillStyle = '#fff'
    c.font = '700 26px sans-serif'
    c.fillText(label, 34, 44)
  })
}

export function makeLaptop({ color = 0x9aa4b2, hue = 200, w = 3.2, d = 2.2, label = 'TECNONOVA' } = {}) {
  const g = new THREE.Group()
  const metal = mat(color, { metalness: 0.9, roughness: 0.28 })
  g.add(new THREE.Mesh(new RoundedBoxGeometry(w, 0.14, d, 3, 0.05), metal))
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, d * 0.55).rotateX(-Math.PI / 2), mat(0x0c1118, { metalness: 0.3, roughness: 0.7 }))
  deck.position.set(0, 0.075, -d * 0.13)
  g.add(deck)
  const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.04, 0.17), mat(0x1c2430, { metalness: 0.2 }), 14 * 5)
  const m4 = new THREE.Matrix4()
  for (let i = 0; i < 70; i++) {
    m4.setPosition(((i % 14) - 6.5) * 0.205, 0.1, -d * 0.35 + Math.floor(i / 14) * 0.21)
    keys.setMatrixAt(i, m4)
  }
  g.add(keys)
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5).rotateX(-Math.PI / 2), mat(0x2a3340, { metalness: 0.6, roughness: 0.3 }))
  pad.position.set(0, 0.078, d * 0.33)
  g.add(pad)
  const pivot = new THREE.Group()
  pivot.position.set(0, 0.07, -d / 2)
  const lidH = d * 0.95
  const lid = new THREE.Mesh(new RoundedBoxGeometry(w, lidH, 0.07, 3, 0.03), metal)
  lid.position.set(0, lidH / 2, 0)
  pivot.add(lid)
  const sMat = new THREE.MeshBasicMaterial({ map: screenTexture(hue, label), toneMapped: false })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.93, lidH * 0.9), sMat)
  screen.position.set(0, lidH / 2, 0.037)
  pivot.add(screen)
  g.add(pivot)
  g.userData = { pivot, screen: sMat, setOpen: (a) => (pivot.rotation.x = Math.PI / 2 - a) }
  g.userData.setOpen(1.75)
  return g
}

export function makePhone({ hue = 280, color = 0x20242c } = {}) {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new RoundedBoxGeometry(0.95, 1.95, 0.1, 4, 0.14), mat(color, { metalness: 0.9, roughness: 0.25 })))
  const tex = canvasTex(256, 512, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h)
    gr.addColorStop(0, `hsl(${hue},90%,45%)`)
    gr.addColorStop(1, `hsl(${hue + 70},90%,18%)`)
    c.fillStyle = gr
    c.fillRect(0, 0, w, h)
    c.fillStyle = 'rgba(255,255,255,.85)'
    c.font = '700 60px sans-serif'
    c.textAlign = 'center'
    c.fillText('12:30', w / 2, 120)
    c.fillStyle = 'rgba(255,255,255,.25)'
    for (let i = 0; i < 4; i++) c.fillRect(30, 200 + i * 62, w - 60, 46)
  })
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.85), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }))
  sc.position.z = 0.052
  g.add(sc)
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16).rotateX(Math.PI / 2), mat(0x0a0a0a))
    b.position.set(-0.2 + (i % 2) * 0.28, 0.7 - Math.floor(i / 2) * 0.28, -0.07)
    g.add(b)
  }
  return g
}

export function makeRAM({ accent = 0x2cff9a } = {}) {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 5.4), mat(0x0d3b2c, { metalness: 0.2, roughness: 0.5 })))
  for (let i = 0; i < 8; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.5), mat(0x111418, { metalness: 0.4 }))
    c.position.set(0.07, 0.1, -2.2 + i * 0.62)
    g.add(c)
  }
  const gold = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 5.2), mat(0xd9b45a, { metalness: 1, roughness: 0.3 }))
  gold.position.y = -0.4
  g.add(gold)
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 5), glowMat(accent, 0.9))
  led.position.y = 0.43
  g.add(led)
  return g
}

export function makeFan({ r = 1.4, accent = 0x39d0ff } = {}) {
  const g = new THREE.Group()
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.09, 8, 48).rotateX(Math.PI / 2), mat(0x1a2029))
  g.add(ring)
  const rotor = new THREE.Group()
  rotor.add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 24), mat(0x0e1218)))
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(r * 0.78, 0.03, 0.34), mat(0x2b3442, { metalness: 0.4 }))
    const a = (i / 7) * Math.PI * 2
    b.position.set(Math.cos(a) * r * 0.5, 0, Math.sin(a) * r * 0.5)
    b.rotation.set(0.25, -a, 0)
    rotor.add(b)
  }
  g.add(rotor)
  const halo = new THREE.Mesh(new THREE.TorusGeometry(r + 0.1, 0.03, 6, 64).rotateX(Math.PI / 2), glowMat(accent, 0.9))
  g.add(halo)
  g.userData.rotor = rotor
  return g
}

export function makeSSD({ accent = 0xffb347 } = {}) {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new RoundedBoxGeometry(3.2, 0.18, 1, 2, 0.04), mat(0x1c232d)))
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.07, 0.62), mat(0x090b0f, { metalness: 0.3 }))
    c.position.set(-0.9 + i * 0.95, 0.12, 0)
    g.add(c)
  }
  const l = new THREE.Mesh(new THREE.BoxGeometry(3, 0.02, 0.05), glowMat(accent, 0.9))
  l.position.set(0, 0.1, 0.43)
  g.add(l)
  return g
}

export function makeHeatsink({ w = 2, h = 1.2, d = 3, fins = 14, color = 0x6c7886 } = {}) {
  const g = new THREE.Group()
  const m = mat(color, { metalness: 1, roughness: 0.3 })
  for (let i = 0; i < fins; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(w / fins - 0.04, h, d), m)
    f.position.set(-w / 2 + (i + 0.5) * (w / fins), h / 2, 0)
    g.add(f)
  }
  return g
}
