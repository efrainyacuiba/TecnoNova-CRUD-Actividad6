import * as THREE from 'three'

/** Pose de cámara relativa al origen de una escena. */
export const pose = (o, pos, look, fov = 50, vx = 0) => ({
  x: o.x + pos[0], y: o.y + pos[1], z: o.z + pos[2],
  lx: o.x + look[0], ly: o.y + look[1], lz: o.z + look[2],
  fov, vx,
})

export const fly = (tl, rig, p, duration, at = 0, ease = 'power2.inOut') =>
  tl.to(rig, { ...p, duration, ease, overwrite: 'auto' }, at)

export const origin = (i) => new THREE.Vector3(i * 300, 0, 0)
