import * as THREE from 'three';

export interface PortalDoorOptions {
  colors: readonly [number, number, number, number];
  hasColorSlot: readonly [boolean, boolean, boolean, boolean];
  initialIdx: number;
  currentAngle: number;
  showFloorLabel: boolean;
  floorLabelTexture?: THREE.Texture;
  accentWoodTint?: number;
  isRusticArchedOak?: boolean;
  oakDoorTexture?: THREE.Texture;
  cuteRoomPlaqueTexture?: THREE.Texture;
  dialOffset?: [number, number, number];
  dialParentIsContainer?: boolean;
}

export interface PortalDoorInstance {
  doorGroup: THREE.Group;
  leafPivot: THREE.Group;
  leafOffset: THREE.Group;
  doorHitbox: THREE.Mesh;
  dialHitbox: THREE.Mesh;
  wheelGroup: THREE.Group;
  outerGearGroup: THREE.Group;
  sectorMats: THREE.MeshStandardMaterial[];
  rimGemMats: THREE.MeshStandardMaterial[];
  tipGemMat: THREE.MeshStandardMaterial;
  dialLight: THREE.PointLight;
  plaqueMat: THREE.MeshStandardMaterial | null;
}

export function createPortalDoorAndDial(opts: PortalDoorOptions): PortalDoorInstance {
  const doorContainer = new THREE.Group();
  const isArched = Boolean(opts.isRusticArchedOak);
  const FD_WIDTH = 0.96;
  const ARCH_SPRING_Y = 1.72;
  const ARCH_RADIUS = FD_WIDTH / 2; // 0.48 -> apex at 2.20m
  const FD_HEIGHT = isArched ? ARCH_SPRING_Y + ARCH_RADIUS : 2.14;
  const FD_FRAME_W = 0.085;
  const FD_FRAME_D = 0.13;

  const frameMat = new THREE.MeshStandardMaterial({
    map: isArched ? opts.oakDoorTexture : undefined,
    color: isArched ? 0xe5d4bc : (opts.accentWoodTint ?? 0x1f120a),
    roughness: isArched ? 0.50 : 0.48,
    metalness: isArched ? 0.02 : 0.12,
    envMapIntensity: isArched ? 0.58 : 0.82,
  });
  const leafMat = new THREE.MeshStandardMaterial({
    map: isArched ? opts.oakDoorTexture : undefined,
    color: isArched ? 0xf6eee2 : 0x2c170d,
    roughness: isArched ? 0.46 : 0.42,
    metalness: isArched ? 0.02 : 0.08,
    envMapIntensity: isArched ? 0.62 : 0.85,
  });
  const recessMat = new THREE.MeshStandardMaterial({
    color: isArched ? 0xc4ad8f : 0x221008,
    roughness: 0.52,
    metalness: 0.03,
  });
  const doorBrassMat = new THREE.MeshStandardMaterial({
    color: isArched ? 0x3b332d : 0xdfb15b,
    roughness: isArched ? 0.36 : 0.22,
    metalness: isArched ? 0.76 : 0.90,
    envMapIntensity: 1.25,
  });
  const sillMat = new THREE.MeshStandardMaterial({
    color: 0x180d07,
    roughness: 0.55,
  });

  if (isArched) {
    const hwOut = FD_WIDTH / 2 + FD_FRAME_W;
    const hwIn = FD_WIDTH / 2;
    const archFrameShape = new THREE.Shape();
    archFrameShape.moveTo(-hwOut, 0);
    archFrameShape.lineTo(-hwOut, ARCH_SPRING_Y);
    archFrameShape.absarc(0, ARCH_SPRING_Y, ARCH_RADIUS + FD_FRAME_W, Math.PI, 0, true);
    archFrameShape.lineTo(hwOut, 0);
    archFrameShape.closePath();

    const archHole = new THREE.Path();
    archHole.moveTo(hwIn, 0);
    archHole.lineTo(hwIn, ARCH_SPRING_Y);
    archHole.absarc(0, ARCH_SPRING_Y, ARCH_RADIUS, 0, Math.PI, false);
    archHole.lineTo(-hwIn, 0);
    archHole.closePath();
    archFrameShape.holes.push(archHole);

    const archFrameGeo = new THREE.ExtrudeGeometry(archFrameShape, {
      depth: FD_FRAME_D,
      bevelEnabled: true,
      bevelThickness: 0.007,
      bevelSize: 0.006,
      bevelSegments: 2,
      curveSegments: 28,
    });
    const archFrameMesh = new THREE.Mesh(archFrameGeo, frameMat);
    archFrameMesh.position.set(0, 0, -0.02);
    archFrameMesh.castShadow = true;
    archFrameMesh.receiveShadow = true;
    doorContainer.add(archFrameMesh);

    const oakSill = new THREE.Mesh(
      new THREE.BoxGeometry(FD_WIDTH + FD_FRAME_W * 2, 0.022, FD_FRAME_D + 0.03),
      recessMat
    );
    oakSill.position.set(0, 0.011, FD_FRAME_D * 0.42);
    oakSill.receiveShadow = true;
    doorContainer.add(oakSill);
  } else {
    const leftJamb = new THREE.Mesh(
      new THREE.BoxGeometry(FD_FRAME_W, FD_HEIGHT + FD_FRAME_W, FD_FRAME_D),
      frameMat
    );
    leftJamb.position.set(-FD_WIDTH / 2 - FD_FRAME_W / 2, (FD_HEIGHT + FD_FRAME_W) / 2, FD_FRAME_D * 0.35);
    leftJamb.castShadow = true;
    leftJamb.receiveShadow = true;
    doorContainer.add(leftJamb);

    const rightJamb = new THREE.Mesh(
      new THREE.BoxGeometry(FD_FRAME_W, FD_HEIGHT + FD_FRAME_W, FD_FRAME_D),
      frameMat
    );
    rightJamb.position.set(FD_WIDTH / 2 + FD_FRAME_W / 2, (FD_HEIGHT + FD_FRAME_W) / 2, FD_FRAME_D * 0.35);
    rightJamb.castShadow = true;
    rightJamb.receiveShadow = true;
    doorContainer.add(rightJamb);

    const topLintel = new THREE.Mesh(
      new THREE.BoxGeometry(FD_WIDTH + FD_FRAME_W * 2 + 0.04, FD_FRAME_W + 0.015, FD_FRAME_D + 0.015),
      frameMat
    );
    topLintel.position.set(0, FD_HEIGHT + FD_FRAME_W / 2, FD_FRAME_D * 0.38);
    topLintel.castShadow = true;
    doorContainer.add(topLintel);

    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(FD_WIDTH + FD_FRAME_W * 2, 0.022, FD_FRAME_D + 0.03),
      sillMat
    );
    sill.position.set(0, 0.011, FD_FRAME_D * 0.42);
    doorContainer.add(sill);
  }

  let plaqueMat: THREE.MeshStandardMaterial | null = null;
  if (isArched && opts.cuteRoomPlaqueTexture) {
    const cuteSignGroup = new THREE.Group();
    cuteSignGroup.position.set(0, ARCH_SPRING_Y + ARCH_RADIUS + FD_FRAME_W + 0.195, 0.042);

    const plaqueOakMat = new THREE.MeshStandardMaterial({
      map: opts.oakDoorTexture,
      color: 0xf1e6d5,
      roughness: 0.45,
      metalness: 0.02,
    });
    const pinkEarInnerMat = new THREE.MeshStandardMaterial({
      color: 0xf9bfd1,
      roughness: 0.72,
      metalness: 0.01,
    });
    const ropeMat = new THREE.MeshStandardMaterial({
      color: 0xdccbb0,
      roughness: 0.85,
    });

    const pW = 0.56;
    const pH = 0.21;
    const pR = 0.045;
    const hw = pW / 2;
    const hh = pH / 2;
    const plaqueShape = new THREE.Shape();
    plaqueShape.moveTo(-hw + pR, -hh);
    plaqueShape.lineTo(hw - pR, -hh);
    plaqueShape.quadraticCurveTo(hw, -hh, hw, -hh + pR);
    plaqueShape.lineTo(hw, hh - pR);
    plaqueShape.quadraticCurveTo(hw, hh, hw - pR, hh);
    plaqueShape.lineTo(-hw + pR, hh);
    plaqueShape.quadraticCurveTo(-hw, hh, -hw, hh - pR);
    plaqueShape.lineTo(-hw, -hh + pR);
    plaqueShape.quadraticCurveTo(-hw, -hh, -hw + pR, -hh);

    const plaqueBackMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(plaqueShape, {
        depth: 0.022,
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.005,
        bevelSegments: 3,
        curveSegments: 14,
      }),
      plaqueOakMat
    );
    plaqueBackMesh.position.z = -0.011;
    plaqueBackMesh.castShadow = true;
    plaqueBackMesh.receiveShadow = true;
    cuteSignGroup.add(plaqueBackMesh);

    [-1, 1].forEach((side) => {
      const bEar = new THREE.Group();
      bEar.position.set(side * 0.044, hh + 0.036, 0);
      bEar.rotation.z = -side * 0.14;

      const earOuter = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.022, 0.056, 8, 14),
        plaqueOakMat
      );
      earOuter.scale.set(1.05, 1.0, 0.45);
      earOuter.castShadow = true;
      bEar.add(earOuter);

      const earInner = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.013, 0.040, 8, 12),
        pinkEarInnerMat
      );
      earInner.scale.set(1.0, 1.0, 0.30);
      earInner.position.set(0, -0.003, 0.008);
      bEar.add(earInner);

      cuteSignGroup.add(bEar);
    });

    const plaqueFront = new THREE.Mesh(
      new THREE.PlaneGeometry(0.515, 0.172),
      new THREE.MeshStandardMaterial({
        map: opts.cuteRoomPlaqueTexture,
        roughness: 0.56,
        metalness: 0.02,
      })
    );
    plaqueFront.position.z = 0.0165;
    cuteSignGroup.add(plaqueFront);

    const hangCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.20, hh - 0.005, -0.002),
      new THREE.Vector3(-0.10, hh + 0.088, -0.008),
      new THREE.Vector3(0, hh + 0.142, -0.012),
      new THREE.Vector3(0.10, hh + 0.088, -0.008),
      new THREE.Vector3(0.20, hh - 0.005, -0.002),
    ]);
    const hangRope = new THREE.Mesh(
      new THREE.TubeGeometry(hangCurve, 20, 0.0032, 8, false),
      ropeMat
    );
    cuteSignGroup.add(hangRope);

    const wallPeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.010, 0.010, 0.028, 12),
      plaqueOakMat
    );
    wallPeg.rotation.x = Math.PI / 2;
    wallPeg.position.set(0, hh + 0.144, -0.014);
    cuteSignGroup.add(wallPeg);

    doorContainer.add(cuteSignGroup);
  } else if (opts.showFloorLabel) {
    const signGroup = new THREE.Group();
    signGroup.position.set(0, FD_HEIGHT + FD_FRAME_W + 0.095, 0.042);

    const plaqueBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.145, 0.024),
      frameMat
    );
    plaqueBack.castShadow = true;
    signGroup.add(plaqueBack);

    plaqueMat = new THREE.MeshStandardMaterial({
      map: opts.floorLabelTexture,
      roughness: 0.45,
      metalness: 0.08,
    });
    const plaqueFront = new THREE.Mesh(
      new THREE.PlaneGeometry(0.53, 0.125),
      plaqueMat
    );
    plaqueFront.position.z = 0.013;
    signGroup.add(plaqueFront);

    doorContainer.add(signGroup);
  }

  const leafPivot = new THREE.Group();
  leafPivot.position.set(-FD_WIDTH / 2, 0, 0);
  doorContainer.add(leafPivot);

  const leafOffset = new THREE.Group();
  leafOffset.position.set(FD_WIDTH / 2, 0, 0);
  leafPivot.add(leafOffset);

  if (isArched) {
    const archLeafShape = new THREE.Shape();
    archLeafShape.moveTo(-FD_WIDTH / 2, 0.02);
    archLeafShape.lineTo(-FD_WIDTH / 2, ARCH_SPRING_Y);
    archLeafShape.absarc(0, ARCH_SPRING_Y, ARCH_RADIUS, Math.PI, 0, true);
    archLeafShape.lineTo(FD_WIDTH / 2, 0.02);
    archLeafShape.closePath();

    const archLeafGeo = new THREE.ExtrudeGeometry(archLeafShape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: 28,
    });
    const archLeaf = new THREE.Mesh(archLeafGeo, leafMat);
    archLeaf.position.set(0, 0, 0.0065);
    archLeaf.castShadow = true;
    archLeaf.receiveShadow = true;
    leafOffset.add(archLeaf);

    [-0.288, -0.096, 0.096, 0.288].forEach((vx) => {
      const archTopAtX = ARCH_SPRING_Y + Math.sqrt(Math.max(0, ARCH_RADIUS * ARCH_RADIUS - vx * vx));
      const grooveH = Math.max(0.2, archTopAtX - 0.04);
      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(0.007, grooveH, 0.006),
        recessMat
      );
      seam.position.set(vx, 0.025 + grooveH / 2, 0.064);
      leafOffset.add(seam);
    });

    [0.34, 1.66].forEach((by) => {
      const batten = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.105, 0.016),
        frameMat
      );
      batten.position.set(0, by, 0.068);
      batten.castShadow = true;
      batten.receiveShadow = true;
      leafOffset.add(batten);

      const strap = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.036, 0.008),
        doorBrassMat
      );
      strap.position.set(-FD_WIDTH / 2 + 0.22, by, 0.078);
      strap.castShadow = true;
      leafOffset.add(strap);

      const strapTip = new THREE.Mesh(
        new THREE.BoxGeometry(0.028, 0.028, 0.008),
        doorBrassMat
      );
      strapTip.rotation.z = Math.PI / 4;
      strapTip.position.set(-FD_WIDTH / 2 + 0.43, by, 0.078);
      leafOffset.add(strapTip);

      [-0.39, -0.27, -0.15].forEach((rx) => {
        const stud = new THREE.Mesh(
          new THREE.SphereGeometry(0.007, 10, 8),
          doorBrassMat
        );
        stud.scale.set(1, 1, 0.55);
        stud.position.set(rx, by, 0.083);
        leafOffset.add(stud);
      });

      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.085, 10),
        doorBrassMat
      );
      barrel.position.set(-FD_WIDTH / 2 + 0.010, by, 0.074);
      leafOffset.add(barrel);
    });

    for (let a = 32; a <= 148; a += 29) {
      const rad = (a * Math.PI) / 180;
      const clavo = new THREE.Mesh(
        new THREE.SphereGeometry(0.0075, 10, 8),
        doorBrassMat
      );
      clavo.scale.set(1, 1, 0.6);
      clavo.position.set(
        Math.cos(rad) * (ARCH_RADIUS - 0.045),
        ARCH_SPRING_Y + Math.sin(rad) * (ARCH_RADIUS - 0.045),
        0.066
      );
      leafOffset.add(clavo);
    }

    const rusticEsc = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.026, 0.125, 6, 12),
      doorBrassMat
    );
    rusticEsc.scale.set(1, 1, 0.25);
    rusticEsc.position.set(FD_WIDTH / 2 - 0.095, 1.02, 0.066);
    leafOffset.add(rusticEsc);
  } else {
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(FD_WIDTH, FD_HEIGHT, 0.055), leafMat);
    leaf.position.set(0, FD_HEIGHT / 2 + 0.01, 0.034);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    leafOffset.add(leaf);

    [
      [-0.20, 1.56, 0.30, 0.72],
      [0.20, 1.56, 0.30, 0.72],
      [-0.20, 0.62, 0.30, 0.64],
      [0.20, 0.62, 0.30, 0.64],
    ].forEach(([px, py, pw, ph]) => {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.04, ph + 0.04, 0.016), frameMat);
      trim.position.set(px, py, 0.062);
      leafOffset.add(trim);
      const inset = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, 0.012), recessMat);
      inset.position.set(px, py, 0.068);
      leafOffset.add(inset);
    });

    [0.36, 1.08, 1.80].forEach((hy) => {
      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.075, 10), doorBrassMat);
      hinge.position.set(-FD_WIDTH / 2 + 0.008, hy, 0.068);
      leafOffset.add(hinge);
    });

    const escutcheon = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.165, 0.012), doorBrassMat);
    escutcheon.position.set(FD_WIDTH / 2 - 0.095, 1.02, 0.064);
    leafOffset.add(escutcheon);
  }

  const knobNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.016, 0.036, 12), doorBrassMat);
  knobNeck.rotation.x = Math.PI / 2;
  knobNeck.position.set(FD_WIDTH / 2 - 0.095, 1.055, 0.082);
  leafOffset.add(knobNeck);

  const knobHead = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 14), doorBrassMat);
  knobHead.position.set(FD_WIDTH / 2 - 0.095, 1.055, 0.106);
  leafOffset.add(knobHead);

  const doorHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(FD_WIDTH + 0.06, FD_HEIGHT, 0.14),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  doorHitbox.name = 'portal_door_hitbox';
  doorHitbox.position.set(0, FD_HEIGHT / 2, 0.07);
  leafOffset.add(doorHitbox);

  const dialGroup = new THREE.Group();
  if (opts.dialParentIsContainer) {
    dialGroup.position.set(...(opts.dialOffset ?? [0.96 / 2 + 0.085 + 0.14, 1.45, 0.04]));
    doorContainer.add(dialGroup);
  } else {
    dialGroup.position.set(0, isArched ? 1.38 : 1.54, 0.075);
    leafOffset.add(dialGroup);
  }
  dialGroup.scale.setScalar(1.30);

  const dialIronMat = new THREE.MeshStandardMaterial({ color: 0x1c1714, roughness: 0.46, metalness: 0.78 });
  const dialBronzeMat = new THREE.MeshStandardMaterial({ color: 0x9c7435, roughness: 0.28, metalness: 0.88 });
  const dialCopperMat = new THREE.MeshStandardMaterial({ color: 0x7c4327, roughness: 0.34, metalness: 0.84 });
  const dialDarkBronzeMat = new THREE.MeshStandardMaterial({ color: 0x352717, roughness: 0.40, metalness: 0.80 });

  const circularBaseDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.126, 0.130, 0.014, 48), dialIronMat);
  circularBaseDisc.rotation.x = Math.PI / 2;
  circularBaseDisc.castShadow = true;
  circularBaseDisc.receiveShadow = true;
  dialGroup.add(circularBaseDisc);

  const outerBronzeRing = new THREE.Mesh(new THREE.TorusGeometry(0.118, 0.011, 16, 48), dialBronzeMat);
  outerBronzeRing.position.z = 0.008;
  dialGroup.add(outerBronzeRing);

  const innerCopperRing = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.0055, 12, 48), dialCopperMat);
  innerCopperRing.position.z = 0.011;
  dialGroup.add(innerCopperRing);

  for (let r = 0; r < 12; r++) {
    const ang = (r / 12) * Math.PI * 2 + Math.PI / 12;
    const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.0052, 0.0058, 0.008, 6), dialBronzeMat);
    rivet.rotation.x = Math.PI / 2;
    rivet.position.set(Math.cos(ang) * 0.116, Math.sin(ang) * 0.116, 0.016);
    dialGroup.add(rivet);
  }

  const clockworkFaceDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.094, 0.094, 0.006, 48), dialDarkBronzeMat);
  clockworkFaceDisc.rotation.x = Math.PI / 2;
  clockworkFaceDisc.position.z = 0.008;
  dialGroup.add(clockworkFaceDisc);

  const outerGearGroup = new THREE.Group();
  outerGearGroup.position.set(0, 0, 0.012);
  const gearTrackRing = new THREE.Mesh(new THREE.TorusGeometry(0.090, 0.0032, 8, 40), dialBronzeMat);
  outerGearGroup.add(gearTrackRing);
  for (let t = 0; t < 24; t++) {
    const ang = (t / 24) * Math.PI * 2;
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.009, 0.005), dialBronzeMat);
    tooth.position.set(Math.cos(ang) * 0.088, Math.sin(ang) * 0.088, 0);
    tooth.rotation.z = ang;
    outerGearGroup.add(tooth);
  }
  outerGearGroup.rotation.z = -0.5 * opts.currentAngle;
  dialGroup.add(outerGearGroup);

  const SECTOR_CENTER_ANGLES = [Math.PI / 2, 0, (Math.PI * 3) / 2, Math.PI];
  const sectorMats: THREE.MeshStandardMaterial[] = [];
  const rimGemMats: THREE.MeshStandardMaterial[] = [];
  const sectorGap = 0.08;

  opts.colors.forEach((hex, idx) => {
    const cAng = SECTOR_CENTER_ANGLES[idx];
    const startAngle = cAng - Math.PI / 4 + sectorGap / 2;
    const sweep = Math.PI / 2 - sectorGap;
    const sectorShape = new THREE.Shape();
    sectorShape.absarc(0, 0, 0.083, startAngle, startAngle + sweep, false);
    sectorShape.absarc(0, 0, 0.028, startAngle + sweep, startAngle, true);
    sectorShape.closePath();

    const sectorGeo = new THREE.ExtrudeGeometry(sectorShape, {
      depth: 0.005,
      bevelEnabled: true,
      bevelThickness: 0.0012,
      bevelSize: 0.0012,
      bevelSegments: 2,
      curveSegments: 16,
    });

    const isActive = idx === opts.initialIdx;
    const hasSlot = opts.hasColorSlot[idx];
    const sectorMat = new THREE.MeshStandardMaterial({
      color: hex,
      emissive: new THREE.Color(hasSlot ? hex : 0x050508),
      emissiveIntensity: hasSlot ? (isActive ? 0.90 : 0.09) : 0.01,
      roughness: hasSlot ? (isActive ? 0.16 : 0.36) : 0.78,
      metalness: hasSlot ? (hex === 0xe8eef5 ? 0.55 : 0.16) : 0.25,
    });
    sectorMats.push(sectorMat);

    const sectorMesh = new THREE.Mesh(sectorGeo, sectorMat);
    sectorMesh.position.z = 0.011;
    dialGroup.add(sectorMesh);

    const studSocket = new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.011, 0.007, 12), dialCopperMat);
    studSocket.rotation.x = Math.PI / 2;
    studSocket.position.set(Math.cos(cAng) * 0.104, Math.sin(cAng) * 0.104, 0.015);
    dialGroup.add(studSocket);

    const rimGemMat = new THREE.MeshStandardMaterial({
      color: hex,
      emissive: new THREE.Color(hasSlot ? hex : 0x050508),
      emissiveIntensity: hasSlot ? (isActive ? 1.0 : 0.12) : 0.01,
      roughness: hasSlot ? 0.15 : 0.72,
      metalness: hasSlot ? 0.18 : 0.25,
    });
    rimGemMats.push(rimGemMat);
    const rimGem = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 12, 10), rimGemMat);
    rimGem.scale.set(1, 1, 0.65);
    rimGem.position.set(Math.cos(cAng) * 0.104, Math.sin(cAng) * 0.104, 0.019);
    dialGroup.add(rimGem);
  });

  for (let s = 0; s < 2; s++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.172, 0.0055, 0.008), dialBronzeMat);
    spoke.rotation.z = Math.PI / 4 + (s * Math.PI) / 2;
    spoke.position.z = 0.016;
    dialGroup.add(spoke);
  }

  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(0, 0, 0.023);

  const innerCogDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.029, 0.031, 0.006, 24), dialBronzeMat);
  innerCogDisc.rotation.x = Math.PI / 2;
  wheelGroup.add(innerCogDisc);

  for (let gt = 0; gt < 14; gt++) {
    const ang = (gt / 14) * Math.PI * 2;
    const cTooth = new THREE.Mesh(new THREE.BoxGeometry(0.0055, 0.010, 0.005), dialCopperMat);
    cTooth.position.set(Math.cos(ang) * 0.032, Math.sin(ang) * 0.032, 0);
    cTooth.rotation.z = ang;
    wheelGroup.add(cTooth);
  }

  const handShape = new THREE.Shape();
  handShape.moveTo(0, 0.088);
  handShape.lineTo(0.0085, 0.062);
  handShape.lineTo(0.0050, 0.056);
  handShape.lineTo(0.0105, 0.032);
  handShape.lineTo(0.0065, 0.018);
  handShape.lineTo(0.0095, -0.024);
  handShape.lineTo(0.0165, -0.044);
  handShape.lineTo(0.0055, -0.037);
  handShape.lineTo(0, -0.048);
  handShape.lineTo(-0.0055, -0.037);
  handShape.lineTo(-0.0165, -0.044);
  handShape.lineTo(-0.0095, -0.024);
  handShape.lineTo(-0.0065, 0.018);
  handShape.lineTo(-0.0105, 0.032);
  handShape.lineTo(-0.0050, 0.056);
  handShape.lineTo(-0.0085, 0.062);
  handShape.closePath();

  const cutHole = new THREE.Path();
  cutHole.moveTo(0, 0.052);
  cutHole.lineTo(0.0042, 0.034);
  cutHole.lineTo(0, 0.022);
  cutHole.lineTo(-0.0042, 0.034);
  cutHole.closePath();
  handShape.holes.push(cutHole);

  const handGeo = new THREE.ExtrudeGeometry(handShape, {
    depth: 0.0055,
    bevelEnabled: true,
    bevelThickness: 0.0012,
    bevelSize: 0.0010,
    bevelSegments: 2,
  });
  const steampunkHandMat = new THREE.MeshStandardMaterial({
    color: 0xd9a84e,
    roughness: 0.22,
    metalness: 0.92,
  });
  const steampunkHandMesh = new THREE.Mesh(handGeo, steampunkHandMat);
  steampunkHandMesh.position.z = 0.005;
  steampunkHandMesh.castShadow = true;
  wheelGroup.add(steampunkHandMesh);

  const pointerTailRing = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0028, 10, 20), dialCopperMat);
  pointerTailRing.position.set(0, -0.030, 0.008);
  wheelGroup.add(pointerTailRing);

  const initActiveColor = opts.colors[opts.initialIdx];
  const initHasSlot = opts.hasColorSlot[opts.initialIdx];
  const tipGemMat = new THREE.MeshStandardMaterial({
    color: initActiveColor,
    emissive: new THREE.Color(initHasSlot ? initActiveColor : 0x050508),
    emissiveIntensity: initHasSlot ? 1.0 : 0.02,
    roughness: 0.14,
    metalness: 0.15,
  });
  const pointerTipGem = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 12, 10), tipGemMat);
  pointerTipGem.scale.set(1, 1.35, 0.65);
  pointerTipGem.position.set(0, 0.068, 0.011);
  wheelGroup.add(pointerTipGem);

  const centerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.014, 18), dialCopperMat);
  centerHub.rotation.x = Math.PI / 2;
  centerHub.position.z = 0.008;
  wheelGroup.add(centerHub);

  const centerHexScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0095, 0.020, 6), steampunkHandMat);
  centerHexScrew.rotation.x = Math.PI / 2;
  centerHexScrew.position.z = 0.011;
  wheelGroup.add(centerHexScrew);

  wheelGroup.rotation.z = opts.currentAngle;
  dialGroup.add(wheelGroup);

  const dialLight = new THREE.PointLight(
    initHasSlot ? initActiveColor : 0x22222c,
    initHasSlot ? 0.68 : 0.12,
    1.25,
    1.7
  );
  dialLight.position.set(0, 0, 0.15);
  dialGroup.add(dialLight);

  const dialHitbox = new THREE.Mesh(
    new THREE.CylinderGeometry(0.175, 0.175, 0.14, 24),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  dialHitbox.rotation.x = Math.PI / 2;
  dialHitbox.name = 'portal_dial_hitbox';
  dialHitbox.position.set(0, 0, 0.04);
  dialGroup.add(dialHitbox);

  if (!opts.dialParentIsContainer) {
    leafOffset.add(dialGroup);
  }

  return {
    doorGroup: doorContainer,
    leafPivot,
    leafOffset,
    doorHitbox,
    dialHitbox,
    wheelGroup,
    outerGearGroup,
    sectorMats,
    rimGemMats,
    tipGemMat,
    dialLight,
    plaqueMat,
  };
}
