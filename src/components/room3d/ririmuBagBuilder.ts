import * as THREE from 'three';
import { RoomTextureManager } from './textureCache';

export interface RirimuBagResult {
  bagGroup: THREE.Group;
  pouchFrontMat: THREE.MeshPhysicalMaterial;
  pouchSideMat: THREE.MeshPhysicalMaterial;
}

export function createRirimuBagGroup(
  interactiveForLobby: boolean,
  texMgr: RoomTextureManager,
  isLampOn = true
): RirimuBagResult {
  const ririmuFrontTex = texMgr.loadTexture('/assets/ririmu_bag_front.webp');
  const ririmuBackTex = texMgr.loadTexture('/assets/ririmu_bag_back.webp');
  const ririmuSideTex = texMgr.loadTexture('/assets/ririmu_bag_side.webp', {
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  });

  const POUCH_W = 0.122;
  const POUCH_H = 0.17;
  const POUCH_D = 0.064;
  const P_EXP = 2.38;
  const FRONT_PUFF = 0.0085;
  const BACK_PUFF = 0.004;
  const N_SEG = 96;

  const evalSuperellipse = (theta: number, rScale: number): [number, number] => {
    const cx = -Math.sin(theta);
    const cy = Math.cos(theta);
    const denom =
      Math.pow(Math.pow(Math.abs(cx), P_EXP) + Math.pow(Math.abs(cy), P_EXP), 1 / P_EXP) || 1;
    const x = (cx / denom) * (POUCH_W / 2) * rScale;
    const y = (cy / denom) * (POUCH_H / 2) * rScale;
    return [x, y];
  };

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const pushVert = (x: number, y: number, z: number, u: number, v: number): number => {
    const idx = positions.length / 3;
    positions.push(x, y, z);
    uvs.push(u, v);
    return idx;
  };

  const pouchGeo = new THREE.BufferGeometry();

  // 1. Group 0: Front Dome Cap
  const frontStartIdx = indices.length;
  const frontCenterV = pushVert(0, 0, POUCH_D / 2 + FRONT_PUFF, 0.5, 0.5);
  const FRONT_RINGS = 10;
  const frontRings: number[][] = [];
  for (let rIdx = 1; rIdx <= FRONT_RINGS; rIdx++) {
    const r = rIdx / FRONT_RINGS;
    const bead = r > 0.92 ? 0.0022 * Math.sin((Math.PI * (r - 0.92)) / 0.08) : 0;
    const z = POUCH_D / 2 + FRONT_PUFF * (1 - r * r) + bead;
    const ring: number[] = [];
    for (let i = 0; i <= N_SEG; i++) {
      const theta = (i / N_SEG) * Math.PI * 2;
      const [x, y] = evalSuperellipse(theta, r);
      ring.push(pushVert(x, y, z, 0.5 + x / POUCH_W, 0.5 + y / POUCH_H));
    }
    frontRings.push(ring);
  }
  for (let i = 0; i < N_SEG; i++) {
    indices.push(frontCenterV, frontRings[0][i], frontRings[0][i + 1]);
  }
  for (let rIdx = 0; rIdx < FRONT_RINGS - 1; rIdx++) {
    for (let i = 0; i < N_SEG; i++) {
      const a = frontRings[rIdx][i];
      const b = frontRings[rIdx + 1][i];
      const c = frontRings[rIdx + 1][i + 1];
      const d = frontRings[rIdx][i + 1];
      indices.push(a, b, c, a, c, d);
    }
  }
  pouchGeo.addGroup(frontStartIdx, indices.length - frontStartIdx, 0);

  // 2. Group 1: Back Cushioned Cap
  const backStartIdx = indices.length;
  const backCenterV = pushVert(0, 0, -POUCH_D / 2 - BACK_PUFF, 0.5, 0.5);
  const BACK_RINGS = 8;
  const backRings: number[][] = [];
  for (let rIdx = 1; rIdx <= BACK_RINGS; rIdx++) {
    const r = rIdx / BACK_RINGS;
    const bead = r > 0.92 ? 0.0018 * Math.sin((Math.PI * (r - 0.92)) / 0.08) : 0;
    const z = -POUCH_D / 2 - BACK_PUFF * (1 - r * r) - bead;
    const ring: number[] = [];
    for (let i = 0; i <= N_SEG; i++) {
      const theta = (i / N_SEG) * Math.PI * 2;
      const [x, y] = evalSuperellipse(theta, r);
      ring.push(pushVert(x, y, z, 0.5 - x / POUCH_W, 0.5 + y / POUCH_H));
    }
    backRings.push(ring);
  }
  for (let i = 0; i < N_SEG; i++) {
    indices.push(backCenterV, backRings[0][i + 1], backRings[0][i]);
  }
  for (let rIdx = 0; rIdx < BACK_RINGS - 1; rIdx++) {
    for (let i = 0; i < N_SEG; i++) {
      const a = backRings[rIdx][i];
      const b = backRings[rIdx + 1][i];
      const c = backRings[rIdx + 1][i + 1];
      const d = backRings[rIdx][i + 1];
      indices.push(a, c, b, a, d, c);
    }
  }
  pouchGeo.addGroup(backStartIdx, indices.length - backStartIdx, 1);

  // 3. Group 2: Continuous 360° Curved Side Gusset Wall
  const sideStartIdx = indices.length;
  const DEPTH_RINGS = 10;
  const sideRings: number[][] = [];
  for (let dIdx = 0; dIdx <= DEPTH_RINGS; dIdx++) {
    const s = dIdx / DEPTH_RINGS;
    const z = -POUCH_D / 2 + s * POUCH_D;
    const pillow = Math.sin(Math.PI * s) * 0.036;
    const bead =
      s < 0.12
        ? Math.sin((s / 0.12) * Math.PI) * 0.018
        : s > 0.88
          ? Math.sin(((s - 0.88) / 0.12) * Math.PI) * 0.018
          : 0;
    const rScale = 1.0 + pillow + bead;
    const ring: number[] = [];
    for (let i = 0; i <= N_SEG; i++) {
      const u = i / N_SEG;
      const theta = u * Math.PI * 2;
      const [x, y] = evalSuperellipse(theta, rScale);
      ring.push(pushVert(x, y, z, u, s));
    }
    sideRings.push(ring);
  }
  for (let dIdx = 0; dIdx < DEPTH_RINGS; dIdx++) {
    for (let i = 0; i < N_SEG; i++) {
      const a = sideRings[dIdx][i];
      const b = sideRings[dIdx][i + 1];
      const c = sideRings[dIdx + 1][i + 1];
      const d = sideRings[dIdx + 1][i];
      indices.push(a, b, c, a, c, d);
    }
  }
  pouchGeo.addGroup(sideStartIdx, indices.length - sideStartIdx, 2);

  pouchGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  pouchGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  pouchGeo.setIndex(indices);
  pouchGeo.computeVertexNormals();

  const pouchFrontMat = new THREE.MeshPhysicalMaterial({
    map: ririmuFrontTex,
    roughness: interactiveForLobby ? (isLampOn ? 0.2 : 0.36) : 0.2,
    metalness: 0.02,
    clearcoat: interactiveForLobby ? (isLampOn ? 0.96 : 0.32) : 0.88,
    clearcoatRoughness: interactiveForLobby ? (isLampOn ? 0.08 : 0.24) : 0.1,
    specularIntensity: interactiveForLobby ? (isLampOn ? 1.0 : 0.42) : 0.92,
    envMapIntensity: interactiveForLobby ? 1.05 : 1.25,
  });

  const pouchBackMat = new THREE.MeshPhysicalMaterial({
    map: ririmuBackTex,
    roughness: 0.26,
    metalness: 0.02,
    clearcoat: 0.72,
    clearcoatRoughness: 0.14,
    envMapIntensity: 1.15,
  });

  const pouchSideMat = new THREE.MeshPhysicalMaterial({
    map: ririmuSideTex,
    roughness: interactiveForLobby ? (isLampOn ? 0.22 : 0.36) : 0.24,
    metalness: 0.03,
    clearcoat: interactiveForLobby ? (isLampOn ? 0.88 : 0.32) : 0.78,
    clearcoatRoughness: interactiveForLobby ? (isLampOn ? 0.1 : 0.24) : 0.12,
    specularIntensity: interactiveForLobby ? (isLampOn ? 0.95 : 0.42) : 0.88,
    envMapIntensity: interactiveForLobby ? 1.0 : 1.2,
  });

  const bagGroup = new THREE.Group();

  const pouchLeanEuler = new THREE.Euler(-0.92, 0, 0.14, 'XYZ');
  const pouchLeanQuat = new THREE.Quaternion().setFromEuler(pouchLeanEuler);
  const tmpVert = new THREE.Vector3();
  let pouchMinY = Infinity;
  for (let vi = 0; vi < positions.length; vi += 3) {
    tmpVert.set(positions[vi], positions[vi + 1], positions[vi + 2]).applyQuaternion(pouchLeanQuat);
    if (tmpVert.y < pouchMinY) pouchMinY = tmpVert.y;
  }

  const pouchFlatPivot = new THREE.Group();
  pouchFlatPivot.quaternion.copy(pouchLeanQuat);
  pouchFlatPivot.position.y = -pouchMinY;
  bagGroup.add(pouchFlatPivot);

  const pouchMesh = new THREE.Mesh(pouchGeo, [pouchFrontMat, pouchBackMat, pouchSideMat]);
  pouchMesh.castShadow = true;
  pouchMesh.receiveShadow = true;
  pouchFlatPivot.add(pouchMesh);

  const dRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.007, 0.0015, 8, 18),
    new THREE.MeshStandardMaterial({ color: 0xd0d4dc, roughness: 0.24, metalness: 0.85 })
  );
  dRingMesh.position.set(0, POUCH_H / 2 + 0.004, -POUCH_D * 0.22);
  dRingMesh.rotation.x = 0.2;
  pouchFlatPivot.add(dRingMesh);

  const claspRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.009, 0.002, 8, 20),
    new THREE.MeshStandardMaterial({ color: 0xf6f5f8, roughness: 0.4, metalness: 0.04 })
  );
  claspRingMesh.position.set(-0.008, POUCH_H / 2 + 0.013, -POUCH_D * 0.36);
  claspRingMesh.rotation.set(0.18, 0.12, 0.25);
  pouchFlatPivot.add(claspRingMesh);

  return {
    bagGroup,
    pouchFrontMat,
    pouchSideMat,
  };
}
