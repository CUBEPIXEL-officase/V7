import * as THREE from 'three';
import {
  ExtraRoomDoorState,
  EXTRA_ROOM_THEMES,
  LOBBY_2F_THEMES,
  PR_SIZE,
  PR_HEIGHT,
  PR_CENTER_X,
  CY_WIDTH,
  CY_DEPTH,
  CY_HEIGHT,
  CY_CENTER_X,
  CY_CENTER_Z,
  ROOM_WIDTH,
  ROOM_DEPTH,
  ROOM_HEIGHT,
} from './roomConfig';
import { RoomTextureManager } from './textureCache';
import { createPortalDoorAndDial } from './portalDoorBuilder';

export function buildSimpleColoredRoom(
  roomId: 'purple' | 'green' | 'gold',
  roomState: ExtraRoomDoorState,
  texMgr: RoomTextureManager
): THREE.Group {
  const theme = EXTRA_ROOM_THEMES[roomId];
  const coloredRoomGroup = new THREE.Group();
  roomState.roomGroup = coloredRoomGroup;

  const floorTex = texMgr.cloneTexture(texMgr.getFloorTexture(), 3.5, 3.5);
  const cFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(PR_SIZE, PR_SIZE),
    new THREE.MeshStandardMaterial({
      map: floorTex,
      color: theme.floorColor,
      roughness: 0.58,
      metalness: 0.04,
      envMapIntensity: 0.34,
    })
  );
  cFloor.rotation.x = -Math.PI / 2;
  cFloor.position.set(PR_CENTER_X, 0, 0);
  cFloor.receiveShadow = true;
  coloredRoomGroup.add(cFloor);

  const cCeilingTex = texMgr.cloneTexture(texMgr.getCeilingTexture(), 3, 3);
  const cCeilingMat = new THREE.MeshStandardMaterial({
    map: cCeilingTex,
    color: theme.ceilingColor,
    roughness: 0.9,
    metalness: 0.02,
    envMapIntensity: 0.25,
  });
  const cCeiling = new THREE.Mesh(new THREE.PlaneGeometry(PR_SIZE, PR_SIZE), cCeilingMat);
  cCeiling.position.set(PR_CENTER_X, PR_HEIGHT, 0);
  cCeiling.rotation.x = Math.PI / 2;
  coloredRoomGroup.add(cCeiling);

  const makeColoredWallMat = () => {
    const tex = texMgr.cloneTexture(texMgr.getWallTexture(), PR_SIZE * 2.2, 1);
    return new THREE.MeshStandardMaterial({
      map: tex,
      color: theme.wallColor,
      roughness: 0.68,
      metalness: 0.04,
      envMapIntensity: 0.3,
    });
  };

  const cFrontWall = new THREE.Mesh(new THREE.PlaneGeometry(PR_SIZE, PR_HEIGHT), makeColoredWallMat());
  cFrontWall.position.set(PR_CENTER_X, PR_HEIGHT / 2, -PR_SIZE / 2);
  cFrontWall.receiveShadow = true;
  coloredRoomGroup.add(cFrontWall);

  const cBackWall = new THREE.Mesh(new THREE.PlaneGeometry(PR_SIZE, PR_HEIGHT), makeColoredWallMat());
  cBackWall.position.set(PR_CENTER_X, PR_HEIGHT / 2, PR_SIZE / 2);
  cBackWall.rotation.y = Math.PI;
  cBackWall.receiveShadow = true;
  coloredRoomGroup.add(cBackWall);

  const cLeftWall = new THREE.Mesh(new THREE.PlaneGeometry(PR_SIZE, PR_HEIGHT), makeColoredWallMat());
  cLeftWall.position.set(-5.0, PR_HEIGHT / 2, 0);
  cLeftWall.rotation.y = Math.PI / 2;
  cLeftWall.receiveShadow = true;
  coloredRoomGroup.add(cLeftWall);

  const cRightWall = new THREE.Mesh(new THREE.PlaneGeometry(PR_SIZE, PR_HEIGHT), makeColoredWallMat());
  cRightWall.position.set(2.0, PR_HEIGHT / 2, 0);
  cRightWall.rotation.y = -Math.PI / 2;
  cRightWall.receiveShadow = true;
  coloredRoomGroup.add(cRightWall);

  const cBaseboardMat = new THREE.MeshStandardMaterial({ color: theme.baseboardColor, roughness: 0.55 });
  [
    [PR_SIZE, 0.1, 0.04, PR_CENTER_X, 0.05, PR_SIZE / 2 - 0.02],
    [0.04, 0.1, PR_SIZE, -5.0 + 0.02, 0.05, 0],
    [0.04, 0.1, PR_SIZE, 2.0 - 0.02, 0.05, 0],
    [PR_SIZE, 0.1, 0.04, PR_CENTER_X, 0.05, -PR_SIZE / 2 + 0.02],
  ].forEach(([bw, bh, bd, bx, by, bz]) => {
    const bb = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), cBaseboardMat);
    bb.position.set(bx, by, bz);
    coloredRoomGroup.add(bb);
  });

  const cPortalDoor = createPortalDoorAndDial({
    colors: roomState.colors,
    hasColorSlot: roomState.hasColorSlot,
    initialIdx: roomState.colorIdx,
    currentAngle: roomState.currentAngle,
    showFloorLabel: false,
    accentWoodTint: theme.accentWoodTint,
  });
  cPortalDoor.doorGroup.position.set(-3.65, 0, -PR_SIZE / 2);
  coloredRoomGroup.add(cPortalDoor.doorGroup);

  roomState.doorHitbox = cPortalDoor.doorHitbox;
  roomState.doorLeafPivot = cPortalDoor.leafPivot;
  roomState.wheelGroup = cPortalDoor.wheelGroup;
  roomState.outerGearGroup = cPortalDoor.outerGearGroup;
  roomState.dialHitbox = cPortalDoor.dialHitbox;
  roomState.dialLight = cPortalDoor.dialLight;
  roomState.tipGemMat = cPortalDoor.tipGemMat;
  roomState.sectorMats = cPortalDoor.sectorMats;
  roomState.rimGemMats = cPortalDoor.rimGemMats;

  const cCeilingRose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.16, 0.04, 24),
    new THREE.MeshStandardMaterial({ color: theme.ceilingRoseColor, roughness: 0.45, metalness: 0.5 })
  );
  cCeilingRose.position.set(PR_CENTER_X, PR_HEIGHT - 0.02, 0);
  coloredRoomGroup.add(cCeilingRose);

  const cLightRod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.36, 12),
    new THREE.MeshStandardMaterial({ color: 0x8f6b32, roughness: 0.32, metalness: 0.85 })
  );
  cLightRod.position.set(PR_CENTER_X, PR_HEIGHT - 0.2, 0);
  coloredRoomGroup.add(cLightRod);

  const cLampCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.15, 0.07, 24),
    new THREE.MeshStandardMaterial({ color: theme.lampCapColor, roughness: 0.38, metalness: 0.65 })
  );
  cLampCap.position.set(PR_CENTER_X, PR_HEIGHT - 0.38, 0);
  coloredRoomGroup.add(cLampCap);

  const cOverheadBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.115, 24, 18),
    new THREE.MeshStandardMaterial({
      color: theme.bulbColor,
      emissive: theme.bulbColor,
      emissiveIntensity: 0.18,
      roughness: 0.4,
      metalness: 0.05,
    })
  );
  cOverheadBulb.scale.set(1.15, 0.85, 1.15);
  cOverheadBulb.position.set(PR_CENTER_X, PR_HEIGHT - 0.46, 0);
  coloredRoomGroup.add(cOverheadBulb);

  const cMainLight = new THREE.PointLight(theme.mainLightColor, 2.55, 25, 1.05);
  cMainLight.position.set(PR_CENTER_X, PR_HEIGHT - 0.52, 0);
  cMainLight.castShadow = true;
  cMainLight.shadow.mapSize.width = 1024;
  cMainLight.shadow.mapSize.height = 1024;
  cMainLight.shadow.bias = -0.001;
  coloredRoomGroup.add(cMainLight);

  const cUpGlow = new THREE.PointLight(theme.upGlowColor, 0.85, 10, 1.15);
  cUpGlow.position.set(PR_CENTER_X, PR_HEIGHT - 0.28, 0);
  coloredRoomGroup.add(cUpGlow);

  const cDoorAccentLight = new THREE.PointLight(theme.doorAccentColor, 1.15, 9.5, 1.12);
  cDoorAccentLight.position.set(-3.65, 2.25, -2.05);
  coloredRoomGroup.add(cDoorAccentLight);

  return coloredRoomGroup;
}

export function buildFoyerRoom(
  roomId: 'cyan' | 'cyan_b1',
  foyerState: ExtraRoomDoorState,
  farDoorState: ExtraRoomDoorState,
  texMgr: RoomTextureManager
): THREE.Group {
  const foyerGroup = new THREE.Group();
  foyerState.roomGroup = foyerGroup;

  const cyFloorTex = texMgr.cloneTexture(texMgr.getFloorTexture(), 6, 2);
  const cyFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(CY_WIDTH, CY_DEPTH),
    new THREE.MeshStandardMaterial({
      map: cyFloorTex,
      color: 0x3b8c9e,
      roughness: 0.45,
      metalness: 0.07,
    })
  );
  cyFloor.rotation.x = -Math.PI / 2;
  cyFloor.position.set(CY_CENTER_X, 0, CY_CENTER_Z);
  cyFloor.receiveShadow = true;
  foyerGroup.add(cyFloor);

  const cyCeilingTex = texMgr.cloneTexture(texMgr.getCeilingTexture(), 5, 2);
  const cyCeiling = new THREE.Mesh(
    new THREE.PlaneGeometry(CY_WIDTH, CY_DEPTH),
    new THREE.MeshStandardMaterial({
      map: cyCeilingTex,
      color: 0x1a4d5c,
      roughness: 0.88,
      metalness: 0.03,
    })
  );
  cyCeiling.position.set(CY_CENTER_X, CY_HEIGHT, CY_CENTER_Z);
  cyCeiling.rotation.x = Math.PI / 2;
  foyerGroup.add(cyCeiling);

  const makeCyanWallMat = (wallSpan: number) => {
    const tex = texMgr.cloneTexture(texMgr.getWallTexture(), wallSpan * 2.2, 1);
    return new THREE.MeshStandardMaterial({
      map: tex,
      color: 0x38bdf8,
      roughness: 0.6,
      metalness: 0.06,
    });
  };

  const cyFrontWall = new THREE.Mesh(new THREE.PlaneGeometry(CY_WIDTH, CY_HEIGHT), makeCyanWallMat(CY_WIDTH));
  cyFrontWall.position.set(CY_CENTER_X, CY_HEIGHT / 2, -3.5);
  cyFrontWall.receiveShadow = true;
  foyerGroup.add(cyFrontWall);

  const cyBackWall = new THREE.Mesh(new THREE.PlaneGeometry(CY_WIDTH, CY_HEIGHT), makeCyanWallMat(CY_WIDTH));
  cyBackWall.position.set(CY_CENTER_X, CY_HEIGHT / 2, 0.5);
  cyBackWall.rotation.y = Math.PI;
  cyBackWall.receiveShadow = true;
  foyerGroup.add(cyBackWall);

  const cyLeftWall = new THREE.Mesh(new THREE.PlaneGeometry(CY_DEPTH, CY_HEIGHT), makeCyanWallMat(CY_DEPTH));
  cyLeftWall.position.set(-5.0, CY_HEIGHT / 2, CY_CENTER_Z);
  cyLeftWall.rotation.y = Math.PI / 2;
  cyLeftWall.receiveShadow = true;
  foyerGroup.add(cyLeftWall);

  const cyRightWall = new THREE.Mesh(new THREE.PlaneGeometry(CY_DEPTH, CY_HEIGHT), makeCyanWallMat(CY_DEPTH));
  cyRightWall.position.set(7.0, CY_HEIGHT / 2, CY_CENTER_Z);
  cyRightWall.rotation.y = -Math.PI / 2;
  cyRightWall.receiveShadow = true;
  foyerGroup.add(cyRightWall);

  const cyBaseboardMat = new THREE.MeshStandardMaterial({ color: 0x0b2229, roughness: 0.55 });
  [
    [CY_WIDTH, 0.1, 0.04, CY_CENTER_X, 0.05, 0.5 - 0.02],
    [0.04, 0.1, CY_DEPTH, -5.0 + 0.02, 0.05, CY_CENTER_Z],
    [0.04, 0.1, CY_DEPTH, 7.0 - 0.02, 0.05, CY_CENTER_Z],
    [CY_WIDTH, 0.1, 0.04, CY_CENTER_X, 0.05, -3.5 + 0.02],
  ].forEach(([bw, bh, bd, bx, by, bz]) => {
    const bb = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), cyBaseboardMat);
    bb.position.set(bx, by, bz);
    foyerGroup.add(bb);
  });

  const isB1Foyer = roomId === 'cyan_b1';
  const defaultFloorLabel = isB1Foyer ? 'B1' : '2F';
  foyerState.defaultPlaqueTitle = defaultFloorLabel;
  foyerState.plaqueTitles = isB1Foyer ? { 0: '有的沒的雜物間', 3: '樓梯' } : { 3: '樓梯' };
  farDoorState.defaultPlaqueTitle = defaultFloorLabel;
  farDoorState.plaqueTitles = isB1Foyer
    ? { 0: '啊璃的模型屋', 3: '啊璃的宿舍' }
    : { 0: '紡塊像素交誼廳', 1: '蕷蒔泡沫交誼廳' };

  const foyerDoor1 = createPortalDoorAndDial({
    colors: foyerState.colors,
    hasColorSlot: foyerState.hasColorSlot,
    initialIdx: foyerState.colorIdx,
    currentAngle: foyerState.currentAngle,
    showFloorLabel: true,
    floorLabelTexture: texMgr.getCarvedPlaqueTexture(
      foyerState.plaqueTitles[foyerState.colorIdx] ?? defaultFloorLabel
    ),
    accentWoodTint: 0x0d2129,
  });
  foyerDoor1.doorGroup.position.set(-3.65, 0, -3.5);
  foyerGroup.add(foyerDoor1.doorGroup);

  foyerState.doorHitbox = foyerDoor1.doorHitbox;
  foyerState.doorLeafPivot = foyerDoor1.leafPivot;
  foyerState.wheelGroup = foyerDoor1.wheelGroup;
  foyerState.outerGearGroup = foyerDoor1.outerGearGroup;
  foyerState.dialHitbox = foyerDoor1.dialHitbox;
  foyerState.dialLight = foyerDoor1.dialLight;
  foyerState.tipGemMat = foyerDoor1.tipGemMat;
  foyerState.plaqueMat = foyerDoor1.plaqueMat;
  foyerState.sectorMats = foyerDoor1.sectorMats;
  foyerState.rimGemMats = foyerDoor1.rimGemMats;

  const foyerDoor2 = createPortalDoorAndDial({
    colors: farDoorState.colors,
    hasColorSlot: farDoorState.hasColorSlot,
    initialIdx: farDoorState.colorIdx,
    currentAngle: farDoorState.currentAngle,
    showFloorLabel: true,
    floorLabelTexture: texMgr.getCarvedPlaqueTexture(
      farDoorState.plaqueTitles[farDoorState.colorIdx] ?? defaultFloorLabel
    ),
    accentWoodTint: 0x0d2129,
  });
  foyerDoor2.doorGroup.position.set(7.0, 0, CY_CENTER_Z);
  foyerDoor2.doorGroup.rotation.y = -Math.PI / 2;
  foyerGroup.add(foyerDoor2.doorGroup);

  farDoorState.doorHitbox = foyerDoor2.doorHitbox;
  farDoorState.doorLeafPivot = foyerDoor2.leafPivot;
  farDoorState.wheelGroup = foyerDoor2.wheelGroup;
  farDoorState.outerGearGroup = foyerDoor2.outerGearGroup;
  farDoorState.dialHitbox = foyerDoor2.dialHitbox;
  farDoorState.dialLight = foyerDoor2.dialLight;
  farDoorState.tipGemMat = foyerDoor2.tipGemMat;
  farDoorState.plaqueMat = foyerDoor2.plaqueMat;
  farDoorState.sectorMats = foyerDoor2.sectorMats;
  farDoorState.rimGemMats = foyerDoor2.rimGemMats;

  const cyCeilingDownlight = new THREE.PointLight(0xffebd2, 2.35, 26, 1.05);
  cyCeilingDownlight.position.set(CY_CENTER_X, CY_HEIGHT - 0.25, CY_CENTER_Z);
  cyCeilingDownlight.castShadow = true;
  cyCeilingDownlight.shadow.mapSize.width = 1024;
  cyCeilingDownlight.shadow.mapSize.height = 1024;
  cyCeilingDownlight.shadow.bias = -0.001;
  foyerGroup.add(cyCeilingDownlight);

  const cyFixture = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.05, 24),
    new THREE.MeshStandardMaterial({ color: 0x22130a, roughness: 0.5 })
  );
  cyFixture.position.set(CY_CENTER_X, CY_HEIGHT - 0.025, CY_CENTER_Z);
  foyerGroup.add(cyFixture);

  const cyDiffuser = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.02, 24),
    new THREE.MeshBasicMaterial({ color: 0xefe6cc })
  );
  cyDiffuser.position.set(CY_CENTER_X, CY_HEIGHT - 0.055, CY_CENTER_Z);
  foyerGroup.add(cyDiffuser);

  const cyPendantGroup = new THREE.Group();
  cyPendantGroup.position.set(CY_CENTER_X, CY_HEIGHT, CY_CENTER_Z);
  const cyCord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 1.1, 8),
    new THREE.MeshBasicMaterial({ color: 0x111111 })
  );
  cyCord.position.y = -0.55;
  cyPendantGroup.add(cyCord);
  const cyShade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.34, 0.32, 16),
    new THREE.MeshStandardMaterial({ color: 0x28180c, roughness: 0.6 })
  );
  cyShade.position.y = -1.2;
  cyPendantGroup.add(cyShade);
  const cyPendantLight = new THREE.PointLight(0xffdfa4, 1.8, 10, 1.15);
  cyPendantLight.position.set(0, -1.25, 0);
  cyPendantGroup.add(cyPendantLight);
  foyerGroup.add(cyPendantGroup);

  const cyWallWashLight = new THREE.DirectionalLight(0xffe8cf, 0.65);
  cyWallWashLight.position.set(CY_CENTER_X, 3.5, -1.2);
  cyWallWashLight.target = cyFrontWall;
  foyerGroup.add(cyWallWashLight);

  const cyDoor1SpillLight = new THREE.PointLight(0xffcf88, 1.38, 12);
  cyDoor1SpillLight.position.set(-3.65, 2.0, -1.85);
  foyerGroup.add(cyDoor1SpillLight);

  const cyDoor2SpillLight = new THREE.PointLight(0xffcf88, 1.38, 12);
  cyDoor2SpillLight.position.set(5.35, 2.0, CY_CENTER_Z);
  foyerGroup.add(cyDoor2SpillLight);

  return foyerGroup;
}

export function buildLobbyLogic2FRoom(
  roomId: 'royalblue' | 'brown',
  roomState: ExtraRoomDoorState,
  texMgr: RoomTextureManager
): THREE.Group {
  const theme = LOBBY_2F_THEMES[roomId];
  const hallGroup = new THREE.Group();
  roomState.roomGroup = hallGroup;

  const hFloorTex = texMgr.cloneTexture(texMgr.getFloorTexture(), 4, 5);
  const hFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH),
    new THREE.MeshStandardMaterial({
      map: hFloorTex,
      color: theme.floorColor,
      roughness: 0.42,
      metalness: 0.05,
    })
  );
  hFloor.rotation.x = -Math.PI / 2;
  hFloor.receiveShadow = true;
  hallGroup.add(hFloor);

  const hCeilingTex = texMgr.cloneTexture(texMgr.getCeilingTexture(), 4, 4);
  const hCeiling = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH),
    new THREE.MeshStandardMaterial({
      map: hCeilingTex,
      color: theme.ceilingColor,
      roughness: 0.9,
      metalness: 0.02,
    })
  );
  hCeiling.position.y = ROOM_HEIGHT;
  hCeiling.rotation.x = Math.PI / 2;
  hallGroup.add(hCeiling);

  const makeHallWallMat = (repeatX: number) => {
    const tex = texMgr.cloneTexture(texMgr.getWallTexture(), repeatX, 1);
    return new THREE.MeshStandardMaterial({
      map: tex,
      color: theme.wallColor,
      roughness: 0.58,
      metalness: 0.08,
    });
  };

  const hFrontWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT),
    makeHallWallMat(ROOM_WIDTH * 2.2)
  );
  hFrontWall.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2);
  hFrontWall.receiveShadow = true;
  hallGroup.add(hFrontWall);

  const hLeftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT),
    makeHallWallMat(ROOM_DEPTH * 2.2)
  );
  hLeftWall.position.set(-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
  hLeftWall.rotation.y = Math.PI / 2;
  hLeftWall.receiveShadow = true;
  hallGroup.add(hLeftWall);

  const hRightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT),
    makeHallWallMat(ROOM_DEPTH * 2.2)
  );
  hRightWall.position.set(ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
  hRightWall.rotation.y = -Math.PI / 2;
  hRightWall.receiveShadow = true;
  hallGroup.add(hRightWall);

  const doorwayWidth = 1.6;
  const doorwayHeight = 2.3;
  const backWallSideWidth = (ROOM_WIDTH - doorwayWidth) / 2;

  const hBackWallMat = makeHallWallMat(backWallSideWidth * 2.2);
  const hBwLeft = new THREE.Mesh(new THREE.PlaneGeometry(backWallSideWidth, ROOM_HEIGHT), hBackWallMat);
  hBwLeft.position.set(-ROOM_WIDTH / 2 + backWallSideWidth / 2, ROOM_HEIGHT / 2, ROOM_DEPTH / 2);
  hBwLeft.rotation.y = Math.PI;
  hallGroup.add(hBwLeft);

  const hBwRight = new THREE.Mesh(new THREE.PlaneGeometry(backWallSideWidth, ROOM_HEIGHT), hBackWallMat);
  hBwRight.position.set(ROOM_WIDTH / 2 - backWallSideWidth / 2, ROOM_HEIGHT / 2, ROOM_DEPTH / 2);
  hBwRight.rotation.y = Math.PI;
  hallGroup.add(hBwRight);

  const hBwHeader = new THREE.Mesh(
    new THREE.PlaneGeometry(doorwayWidth, ROOM_HEIGHT - doorwayHeight),
    hBackWallMat
  );
  hBwHeader.position.set(0, ROOM_HEIGHT - (ROOM_HEIGHT - doorwayHeight) / 2, ROOM_DEPTH / 2);
  hBwHeader.rotation.y = Math.PI;
  hallGroup.add(hBwHeader);

  const doorFrameMat = new THREE.MeshStandardMaterial({
    color: 0x1f120a,
    roughness: 0.5,
    metalness: 0.1,
  });
  const framePillarGeo = new THREE.BoxGeometry(0.12, doorwayHeight, 0.16);
  const frameTopGeo = new THREE.BoxGeometry(doorwayWidth, 0.1, 0.16);

  const hFrameL = new THREE.Mesh(framePillarGeo, doorFrameMat);
  hFrameL.position.set(-doorwayWidth / 2 + 0.05, doorwayHeight / 2, ROOM_DEPTH / 2);
  hallGroup.add(hFrameL);
  const hFrameR = new THREE.Mesh(framePillarGeo, doorFrameMat);
  hFrameR.position.set(doorwayWidth / 2 - 0.05, doorwayHeight / 2, ROOM_DEPTH / 2);
  hallGroup.add(hFrameR);
  const hFrameT = new THREE.Mesh(frameTopGeo, doorFrameMat);
  hFrameT.position.set(0, doorwayHeight, ROOM_DEPTH / 2);
  hallGroup.add(hFrameT);

  const hBaseboardMat = new THREE.MeshStandardMaterial({ color: theme.baseboardColor, roughness: 0.55 });
  const hBbL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, ROOM_DEPTH), hBaseboardMat);
  hBbL.position.set(-ROOM_WIDTH / 2 + 0.02, 0.05, 0);
  hallGroup.add(hBbL);
  const hBbR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, ROOM_DEPTH), hBaseboardMat);
  hBbR.position.set(ROOM_WIDTH / 2 - 0.02, 0.05, 0);
  hallGroup.add(hBbR);
  const hBbB1 = new THREE.Mesh(new THREE.BoxGeometry(backWallSideWidth, 0.1, 0.04), hBaseboardMat);
  hBbB1.position.set(-ROOM_WIDTH / 2 + backWallSideWidth / 2, 0.05, ROOM_DEPTH / 2 - 0.02);
  hallGroup.add(hBbB1);
  const hBbB2 = new THREE.Mesh(new THREE.BoxGeometry(backWallSideWidth, 0.1, 0.04), hBaseboardMat);
  hBbB2.position.set(ROOM_WIDTH / 2 - backWallSideWidth / 2, 0.05, ROOM_DEPTH / 2 - 0.02);
  hallGroup.add(hBbB2);

  const TEA_TABLE_RADIUS = 0.85;
  const TEA_TABLE_HEIGHT = 0.36;
  const TEA_TABLE_TOP_THICK = 0.045;
  const legRadius = TEA_TABLE_RADIUS - 0.2;
  const roundLegHeight = TEA_TABLE_HEIGHT - TEA_TABLE_TOP_THICK;

  const tableMat = new THREE.MeshStandardMaterial({
    map: texMgr.getTabletopTexture(),
    roughness: 0.35,
    metalness: 0.05,
  });
  const tableDarkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x22120a,
    roughness: 0.48,
    metalness: 0.05,
  });

  const hRoundTableGroup = new THREE.Group();
  hRoundTableGroup.position.set(0, 0, 0);

  const teaTopGeo = new THREE.CylinderGeometry(TEA_TABLE_RADIUS, TEA_TABLE_RADIUS, TEA_TABLE_TOP_THICK, 48);
  const hTeaTop = new THREE.Mesh(teaTopGeo, tableMat);
  hTeaTop.position.set(0, TEA_TABLE_HEIGHT - TEA_TABLE_TOP_THICK / 2, 0);
  hTeaTop.castShadow = true;
  hTeaTop.receiveShadow = true;
  hRoundTableGroup.add(hTeaTop);

  const roundRimGeo = new THREE.TorusGeometry(TEA_TABLE_RADIUS, 0.018, 16, 48);
  const hRoundRim = new THREE.Mesh(roundRimGeo, tableDarkWoodMat);
  hRoundRim.position.set(0, TEA_TABLE_HEIGHT - TEA_TABLE_TOP_THICK / 2, 0);
  hRoundRim.rotation.x = Math.PI / 2;
  hRoundTableGroup.add(hRoundRim);

  const roundLegGeo = new THREE.BoxGeometry(0.065, roundLegHeight, 0.065);
  [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75].forEach((angle) => {
    const lx = Math.cos(angle) * legRadius;
    const lz = Math.sin(angle) * legRadius;
    const hLeg = new THREE.Mesh(roundLegGeo, tableDarkWoodMat);
    hLeg.position.set(lx, roundLegHeight / 2, lz);
    hLeg.rotation.y = -angle;
    hLeg.castShadow = true;
    hRoundTableGroup.add(hLeg);
  });

  const braceGeo = new THREE.BoxGeometry(legRadius * 2, 0.035, 0.035);
  const hBrace1 = new THREE.Mesh(braceGeo, tableDarkWoodMat);
  hBrace1.position.set(0, 0.12, 0);
  hBrace1.rotation.y = Math.PI * 0.25;
  hRoundTableGroup.add(hBrace1);
  const hBrace2 = new THREE.Mesh(braceGeo, tableDarkWoodMat);
  hBrace2.position.set(0, 0.12, 0);
  hBrace2.rotation.y = Math.PI * 0.75;
  hRoundTableGroup.add(hBrace2);

  const cushionGeo = new THREE.CylinderGeometry(0.22, 0.23, 0.065, 24);
  const CUSHION_DISTANCE = TEA_TABLE_RADIUS + 0.3;
  const cushionMatCharcoal = new THREE.MeshStandardMaterial({ color: 0x2d2823, roughness: 0.85 });
  const cushionMatEarth = new THREE.MeshStandardMaterial({ color: 0x3a3229, roughness: 0.85 });
  const cushionPositions = [
    { x: 0, z: CUSHION_DISTANCE, mat: cushionMatEarth },
    { x: 0, z: -CUSHION_DISTANCE, mat: cushionMatCharcoal },
    { x: CUSHION_DISTANCE, z: 0, mat: cushionMatEarth },
    { x: -CUSHION_DISTANCE, z: 0, mat: cushionMatCharcoal },
  ];

  cushionPositions.forEach((pos) => {
    const cGroup = new THREE.Group();
    cGroup.position.set(pos.x, 0.0325, pos.z);
    const cushion = new THREE.Mesh(cushionGeo, pos.mat);
    cushion.castShadow = true;
    cushion.receiveShadow = true;
    cGroup.add(cushion);
    const btn = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x16120e, roughness: 0.6 })
    );
    btn.position.y = 0.033;
    btn.scale.set(1, 0.4, 1);
    cGroup.add(btn);
    hRoundTableGroup.add(cGroup);
  });

  hallGroup.add(hRoundTableGroup);

  const hPortalDoor = createPortalDoorAndDial({
    colors: roomState.colors,
    hasColorSlot: roomState.hasColorSlot,
    initialIdx: roomState.colorIdx,
    currentAngle: roomState.currentAngle,
    showFloorLabel: true,
    floorLabelTexture: texMgr.getDoorEngraving2F(),
    accentWoodTint: theme.accentWoodTint,
  });
  hPortalDoor.doorGroup.position.set(-3.65, 0, -ROOM_DEPTH / 2);
  hallGroup.add(hPortalDoor.doorGroup);

  roomState.doorHitbox = hPortalDoor.doorHitbox;
  roomState.doorLeafPivot = hPortalDoor.leafPivot;
  roomState.wheelGroup = hPortalDoor.wheelGroup;
  roomState.outerGearGroup = hPortalDoor.outerGearGroup;
  roomState.dialHitbox = hPortalDoor.dialHitbox;
  roomState.dialLight = hPortalDoor.dialLight;
  roomState.tipGemMat = hPortalDoor.tipGemMat;
  roomState.sectorMats = hPortalDoor.sectorMats;
  roomState.rimGemMats = hPortalDoor.rimGemMats;

  const hCeilingDownlight = new THREE.PointLight(0xffebd2, 2.35, 25, 1.1);
  hCeilingDownlight.position.set(0, ROOM_HEIGHT - 0.25, 0);
  hCeilingDownlight.castShadow = true;
  hCeilingDownlight.shadow.mapSize.width = 1024;
  hCeilingDownlight.shadow.mapSize.height = 1024;
  hCeilingDownlight.shadow.bias = -0.001;
  hallGroup.add(hCeilingDownlight);

  const fixGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.05, 24);
  const fixMat = new THREE.MeshStandardMaterial({ color: 0x22130a, roughness: 0.5 });
  const hFixture = new THREE.Mesh(fixGeo, fixMat);
  hFixture.position.set(0, ROOM_HEIGHT - 0.025, 0);
  hallGroup.add(hFixture);

  const diffGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.02, 24);
  const diffMat = new THREE.MeshBasicMaterial({ color: 0xefe6cc });
  const hDiffuser = new THREE.Mesh(diffGeo, diffMat);
  hDiffuser.position.set(0, ROOM_HEIGHT - 0.055, 0);
  hallGroup.add(hDiffuser);

  const hPendantGroup = new THREE.Group();
  hPendantGroup.position.set(0, ROOM_HEIGHT, 0);
  const cordGeo = new THREE.CylinderGeometry(0.005, 0.005, 1.4, 8);
  const cordMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const hCord = new THREE.Mesh(cordGeo, cordMat);
  hCord.position.y = -0.7;
  hPendantGroup.add(hCord);
  const shadeGeo = new THREE.CylinderGeometry(0.24, 0.34, 0.32, 16);
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0x28180c, roughness: 0.6 });
  const hShade = new THREE.Mesh(shadeGeo, shadeMat);
  hShade.position.y = -1.5;
  hPendantGroup.add(hShade);
  const hTeaLight = new THREE.PointLight(0xffdfa4, 1.8, 8.0, 1.15);
  hTeaLight.position.set(0, -1.55, 0);
  hTeaLight.castShadow = true;
  hPendantGroup.add(hTeaLight);
  hallGroup.add(hPendantGroup);

  const hWallWashLight = new THREE.DirectionalLight(0xffe8cf, 0.65);
  hWallWashLight.position.set(0, 3.5, -2.0);
  hWallWashLight.target = hFrontWall;
  hallGroup.add(hWallWashLight);

  const hDoorLight = new THREE.PointLight(0xffcf88, 1.3, 12);
  hDoorLight.position.set(0, 2.0, ROOM_DEPTH / 2 - 0.4);
  hallGroup.add(hDoorLight);

  return hallGroup;
}
