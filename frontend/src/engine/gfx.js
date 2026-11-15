// Utilidades gráficas compartidas: texturas, brillos, trazas de circuito, rejilla holográfica y partículas.
import * as THREE from 'three'

export const TIME = { value: 0 } // reloj compartido por todos los shaders
export const WARP = { value: 0 } // intensidad de "warp" durante las transiciones
export const WARPD = { value: 0 } // distancia acumulada del warp

export function rng(seed) {
  let s = seed >>> 0 || 1
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
}

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

let _glow
export function glowTexture() {
  if (!_glow) {
    _glow = canvasTex(128, 128, (c, w, h) => {
      const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.25, 'rgba(255,255,255,.35)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      c.fillStyle = g
      c.fillRect(0, 0, w, h)
    })
  }
  return _glow
}

export function makeGlow(color, scale = 4, opacity = 1) {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture(),
      color,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
  )
  s.scale.setScalar(scale)
  return s
}

export const mat = (color, o = {}) =>
  new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.35, ...o })

export const glowMat = (color, op = 0.5) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: op,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })

/** Cambia la opacidad de todo un grupo (guarda la opacidad original). */
export function fade(obj, o) {
  obj.traverse((m) => {
    if (!m.material) return
    const list = Array.isArray(m.material) ? m.material : [m.material]
    list.forEach((x) => {
      if (x.userData.o === undefined) x.userData.o = x.opacity
      x.transparent = true
      x.opacity = x.userData.o * o
    })
  })
}

/** Trazas de circuito con pulsos de energía que recorren cada pista. */
export function makeTraces({
  count = 80,
  extent = [20, 14],
  color = 0x39d0ff,
  seed = 1,
  outward = false,
  hole = 3.6,
  maxR = 30,
  segs = [4, 9],
}) {
  const r = rng(seed)
  const pos = []
  const dist = []
  const nodes = []
  const A = Math.PI / 4
  const dirs = [...Array(8)].map((_, k) => [Math.cos(k * A), Math.sin(k * A)])
  for (let i = 0; i < count; i++) {
    let x
    let z
    if (outward) {
      const e = (r() * 4) | 0
      const u = (r() * 2 - 1) * hole
      ;[x, z] = e === 0 ? [hole, u] : e === 1 ? [-hole, u] : e === 2 ? [u, hole] : [u, -hole]
    } else {
      x = (r() * 2 - 1) * (extent[0] / 2)
      z = (r() * 2 - 1) * (extent[1] / 2)
    }
    let k = (r() * 8) | 0
    let d = r() * 10
    const n = segs[0] + ((r() * (segs[1] - segs[0])) | 0)
    for (let s = 0; s < n; s++) {
      if (outward) k = Math.round(Math.atan2(z, x) / A) + (((r() * 3) | 0) - 1)
      else if (r() < 0.5) k += r() < 0.5 ? 1 : -1
      const dd = dirs[((k % 8) + 8) % 8]
      const len = 0.8 + r() * 2.4
      const nx = x + dd[0] * len
      const nz = z + dd[1] * len
      if (!outward && (Math.abs(nx) > extent[0] / 2 || Math.abs(nz) > extent[1] / 2)) break
      pos.push(x, 0, z, nx, 0, nz)
      dist.push(d, d + len)
      d += len
      x = nx
      z = nz
      if (outward && Math.hypot(x, z) > maxR) break
    }
    nodes.push(x, 0, z)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('aD', new THREE.Float32BufferAttribute(dist, 1))
  const lines = new THREE.LineSegments(
    geo,
    new THREE.ShaderMaterial({
      uniforms: { uTime: TIME, uColor: { value: new THREE.Color(color) } },
      vertexShader: `attribute float aD; varying float vD;
        void main(){ vD=aD; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform float uTime; uniform vec3 uColor; varying float vD;
        void main(){ float p=fract(vD*.09-uTime*.22); float pulse=pow(p,14.);
          gl_FragColor=vec4(uColor*(.7+pulse*1.6), .26+pulse*1.2); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  const ng = new THREE.BufferGeometry()
  ng.setAttribute('position', new THREE.Float32BufferAttribute(nodes, 3))
  const pts = new THREE.Points(
    ng,
    new THREE.PointsMaterial({
      color,
      size: 0.22,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  const g = new THREE.Group()
  g.add(lines, pts)
  return g
}

/** Suelo holográfico con rejilla y ondas que se expanden. */
export function makeGrid({ size = 160, div = 80, color = 0x9b5cff }) {
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: TIME, uColor: { value: new THREE.Color(color) }, uDiv: { value: div } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uTime; uniform vec3 uColor; uniform float uDiv; varying vec2 vUv;
      void main(){ vec2 q=vUv*uDiv; vec2 g=abs(fract(q-.5)-.5)/fwidth(q);
        float l=1.-min(min(g.x,g.y),1.); float r=length(vUv-.5)*2.;
        float fade=1.-smoothstep(.05,1.,r);
        float ring=exp(-pow((fract(r*2.5-uTime*.12)-.5)*12.,2.));
        gl_FragColor=vec4(uColor*(.5+ring*2.), l*fade*(.55+ring)); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2), m)
  return mesh
}

/** Partículas en caja con movimiento continuo; el warp las acelera durante transiciones. */
export function makeParticles({ count = 600, box = [60, 26, 110], color = 0x66ccff, size = 2.4, px = 1 }) {
  const r = rng(count + 7)
  const p = new Float32Array(count * 3)
  const s = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    p[i * 3] = (r() - 0.5) * box[0]
    p[i * 3 + 1] = (r() - 0.5) * box[1]
    p[i * 3 + 2] = (r() - 0.5) * box[2]
    s[i] = r()
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3))
  geo.setAttribute('aS', new THREE.BufferAttribute(s, 1))
  const pts = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: TIME,
        uWarp: WARP,
        uWarpD: WARPD,
        uBox: { value: new THREE.Vector3(...box) },
        uColor: { value: new THREE.Color(color) },
        uSize: { value: size * px },
      },
      vertexShader: `attribute float aS; uniform float uTime,uWarp,uWarpD,uSize; uniform vec3 uBox; varying float vA;
        void main(){ vec3 p=position; 
          p.y=mod(p.y+uTime*(.25+aS*.6)+uBox.y*.5,uBox.y)-uBox.y*.5;
          p.x+=sin(uTime*.4+aS*40.)*.8;
          p.z=mod(p.z+uWarpD*(.4+aS)+uBox.z*.5,uBox.z)-uBox.z*.5;
          vec4 mv=modelViewMatrix*vec4(p,1.);
          gl_PointSize=uSize*(1.+uWarp*1.6)*(26./-mv.z)*(.4+aS);
          vA=.35+.65*(.5+.5*sin(uTime*2.+aS*60.));
          gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uColor; varying float vA;
        void main(){ float d=length(gl_PointCoord-.5); if(d>.5) discard;
          gl_FragColor=vec4(uColor, vA*smoothstep(.5,.0,d)); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  pts.frustumCulled = false
  return pts
}
