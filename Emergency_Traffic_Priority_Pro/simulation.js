import * as THREE from 'three';

const $ = id => document.getElementById(id);
const canvas = $('view');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'low-power'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = false;

const scene = new THREE.Scene();
const dayColor = new THREE.Color(0xa6cce2);
const nightColor = new THREE.Color(0x071321);
scene.background = nightColor.clone();
scene.fog = new THREE.Fog(nightColor, 90, 180);
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 220);
camera.position.set(33, 30, 39);

const ambient = new THREE.HemisphereLight(0xc5e2ff, 0x324331, 1.5);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffedcf, 1.35);
sun.position.set(-25, 45, 28);
scene.add(sun);

const materialCache = new Map();
function material(color, roughness = 0.78, metalness = 0) {
  const key = `${color}:${roughness}:${metalness}`;
  if (!materialCache.has(key)) {
    materialCache.set(key, new THREE.MeshStandardMaterial({
      color, roughness, metalness
    }));
  }
  return materialCache.get(key);
}
const materials = {
  asphalt: material(0x303943),
  sidewalk: material(0x88939b),
  curb: material(0xc1c7c7),
  concrete: material(0x747e83),
  lane: material(0xe4e8e9),
  median: material(0xe4b84b),
  grass: material(0x315e44),
  glass: material(0x79a9bd, 0.3, 0.24),
  darkGlass: material(0x253d50, 0.26, 0.32),
  window: material(0x9bc7d7, 0.34, 0.08),
  windowGlow: material(0xffd88b, 0.38, 0.02),
  tire: material(0x171b1f),
  rubber: material(0x303439),
  metal: material(0xaab5bb, 0.36, 0.62),
  red: material(0xee3346, 0.38),
  blue: material(0x258cff, 0.32),
  green: material(0x00d98a, 0.32),
  amber: material(0xffbf43, 0.34),
  white: material(0xf1f3f2, 0.45),
  headlight: material(0xffedbd, 0.3),
  brake: material(0xb51022, 0.35),
  trunk: material(0x744c32)
};
const boxGeometryCache = new Map();
function box(parent, x, y, z, width, height, depth, mat, cast = false) {
  const key = `${width}|${height}|${depth}`;
  if (!boxGeometryCache.has(key)) {
    boxGeometryCache.set(key, new THREE.BoxGeometry(width, height, depth));
  }
  const mesh = new THREE.Mesh(boxGeometryCache.get(key), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = false;
  parent.add(mesh);
  return mesh;
}

box(scene, 0, -0.5, 0, 150, 0.5, 150, materials.grass);
box(scene, 0, -0.2, 0, 18, 0.18, 150, materials.asphalt);
box(scene, 0, -0.2, 0, 150, 0.18, 18, materials.asphalt);
box(scene, 0, -0.08, 0, 0.18, 0.04, 150, materials.median);
box(scene, 0, -0.08, 0, 150, 0.04, 0.18, materials.median);

function roadMarkings() {
  for (const offset of [-4.5, 4.5]) {
    for (let step = -70; step < 70; step += 6) {
      box(scene, offset, -0.075, step, 0.11, 0.025, 3.1, materials.lane);
      box(scene, step, -0.075, offset, 3.1, 0.025, 0.11, materials.lane);
    }
  }
  for (const edge of [-8.8, 8.8]) {
    box(scene, edge, -0.065, 0, 0.12, 0.035, 150, materials.lane);
    box(scene, 0, -0.065, edge, 150, 0.035, 0.12, materials.lane);
  }
  for (const edge of [-9, 9]) {
    box(scene, edge, -0.07, 0, 0.16, 0.035, 150, materials.curb);
    box(scene, 0, -0.07, edge, 150, 0.035, 0.16, materials.curb);
  }
  for (const side of [-1, 1]) {
    for (let stripe = -4; stripe <= 4; stripe++) {
      box(scene, stripe * 1.9, -0.055, side * 12.2, 1.25, 0.035, 0.55, materials.lane);
      box(scene, side * 12.2, -0.055, stripe * 1.9, 0.55, 0.035, 1.25, materials.lane);
    }
    box(scene, 0, -0.05, side * 10.45, 18, 0.035, 0.25, materials.lane);
    box(scene, side * 10.45, -0.05, 0, 0.25, 0.035, 18, materials.lane);
  }
  for (const s of [-1, 1]) {
    for (const laneX of [-6.4, -2.2, 2.2, 6.4]) {
      const arrow = new THREE.Group();
      arrow.position.set(laneX, -0.035, s * 17);
      const direction = laneX < 0 ? -1 : 1;
      box(arrow, 0, 0, -direction * 0.3, 0.09, 0.025, 1.8, materials.lane);
      for (const side of [-1, 1]) {
        const head = box(arrow, side * 0.34, 0, direction * 0.32, 0.09, 0.025, 0.75, materials.lane);
        head.rotation.y = side * direction * 0.72;
      }
      scene.add(arrow);
    }
    for (const laneZ of [-6.4, -2.2, 2.2, 6.4]) {
      const arrow = new THREE.Group();
      arrow.position.set(s * 17, -0.035, laneZ);
      const direction = laneZ < 0 ? 1 : -1;
      box(arrow, -direction * 0.3, 0, 0, 1.8, 0.025, 0.09, materials.lane);
      for (const side of [-1, 1]) {
        const head = box(arrow, direction * 0.32, 0, side * 0.34, 0.75, 0.025, 0.09, materials.lane);
        head.rotation.y = side * direction * 0.72;
      }
      scene.add(arrow);
    }
  }
}
roadMarkings();

for (const x of [-10.1, 10.1]) {
  box(scene, x, 0.04, 0, 2.2, 0.13, 150, materials.sidewalk);
}
for (const z of [-10.1, 10.1]) {
  box(scene, 0, 0.04, z, 150, 0.13, 2.2, materials.sidewalk);
}

function makeSign(text, background, width = 3.8) {
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 768;
  signCanvas.height = 144;
  const ctx = signCanvas.getContext('2d');
  ctx.fillStyle = `#${background.toString(16).padStart(6, '0')}`;
  ctx.fillRect(0, 0, signCanvas.width, signCanvas.height);
  ctx.strokeStyle = '#e9f4ff';
  ctx.lineWidth = 9;
  ctx.strokeRect(5, 5, signCanvas.width - 10, signCanvas.height - 10);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 64px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, signCanvas.width / 2, signCanvas.height / 2 + 2, signCanvas.width - 36);
  const texture = new THREE.CanvasTexture(signCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: true }));
  sprite.scale.set(width, width * 0.19, 1);
  return sprite;
}

const windowMeshes = [];
function makeBuilding({ name, x, z, width, depth, height, wall, style }) {
  const group = new THREE.Group();
  group.position.set(x, 0.12, z);
  scene.add(group);
  box(group, 0, height / 2, 0, width, height, depth, material(wall, 0.76, 0.04));
  box(group, 0, height + 0.18, 0, width + 0.55, 0.36, depth + 0.55, material(0x505c63));
  box(group, 0, 0.2, depth / 2 + 0.3, width + 1.1, 0.4, 0.8, materials.curb);

  const floors = Math.max(2, Math.floor(height / 2.4));
  for (let floor = 0; floor < floors; floor++) {
    const y = 1.4 + floor * (height - 1.5) / floors;
    for (let col = 0; col < Math.max(2, Math.floor(width / 1.7)); col++) {
      const xPos = -width / 2 + 0.9 + col * (width - 1.8) / Math.max(1, Math.floor(width / 1.7) - 1);
      const pane = box(group, xPos, y, depth / 2 + 0.025, 0.83, 0.94, 0.06, materials.window);
      windowMeshes.push(pane);
      if (style === 'apartment') {
        box(group, xPos, y - 0.57, depth / 2 + 0.24, 1.05, 0.08, 0.45, materials.metal);
        box(group, xPos, y - 0.29, depth / 2 + 0.45, 0.08, 0.52, 0.06, materials.metal);
      }
    }
    for (const side of [-1, 1]) {
      const pane = box(group, side * (width / 2 + 0.03), y, 0, 0.06, 0.94, depth * 0.7, materials.window);
      windowMeshes.push(pane);
    }
  }

  const doorMaterial = style === 'hospital' || style === 'mall' || style === 'pharmacy' ?
    materials.glass : materials.darkGlass;
  box(group, 0, 1.15, depth / 2 + 0.08, 1.5, 2.25, 0.12, doorMaterial);
  box(group, 0, 2.32, depth / 2 + 0.25, Math.min(width - 1, 5), 0.2, 0.5, materials.metal);
  const sign = makeSign(name, style === 'hospital' ? 0xb42435 :
    style === 'police' ? 0x16385f : style === 'fire' ? 0xb12c27 :
    style === 'school' ? 0x24583e : style === 'pharmacy' ? 0x13805e :
    style === 'mall' ? 0x275a79 : 0x233d55, Math.min(width, 7.5));
  sign.position.set(0, height - 0.75, depth / 2 + 0.12);
  group.add(sign);

  if (style === 'hospital') {
    box(group, width / 2 - 1.35, height - 2.3, depth / 2 + 0.12, 0.48, 2.2, 0.16, materials.red);
    box(group, width / 2 - 1.35, height - 2.3, depth / 2 + 0.12, 2.1, 0.48, 0.16, materials.red);
    box(group, 0, 0.3, depth / 2 + 0.8, 6.5, 0.16, 1.25, materials.blue);
    box(group, 0, 1.25, depth / 2 + 0.15, 2.8, 2.35, 0.1, materials.glass);
  } else if (style === 'police') {
    const badge = new THREE.Mesh(new THREE.CircleGeometry(0.65, 12), materials.amber);
    badge.position.set(-width / 2 + 1.3, height - 2.4, depth / 2 + 0.09);
    group.add(badge);
  } else if (style === 'fire') {
    for (const bay of [-1.9, 1.9]) {
      box(group, bay, 1.6, depth / 2 + 0.08, 3, 2.8, 0.14, materials.darkGlass);
      box(group, bay, 3.08, depth / 2 + 0.17, 3.1, 0.13, 0.18, materials.red);
    }
  } else if (style === 'mall') {
    box(group, 0, 0.9, depth / 2 + 0.09, width - 1, 1.5, 0.13, materials.glass);
  } else if (style === 'office') {
    for (let floor = 0; floor < floors; floor++) {
      box(group, 0, 1.0 + floor * 2.2, depth / 2 + 0.06, width - 0.45, 0.14, 0.12, materials.metal);
    }
  } else if (style === 'school') {
    box(group, width / 2 - 1.2, height + 0.53, 0, 0.15, 0.75, 0.15, materials.red);
    box(group, width / 2 - 1.2, height + 0.53, 0, 0.75, 0.15, 0.15, materials.red);
  }
  return group;
}

makeBuilding({ name: 'HOSPITAL', x: 23, z: -24, width: 14, depth: 10, height: 12, wall: 0xe7e9e7, style: 'hospital' });
makeBuilding({ name: 'POLICE STATION', x: -24, z: 24, width: 12, depth: 9, height: 9, wall: 0x879baa, style: 'police' });
makeBuilding({ name: 'FIRE STATION', x: 24, z: -24, width: 13, depth: 10, height: 8, wall: 0xd7d0c8, style: 'fire' });
makeBuilding({ name: 'SHOPPING MALL', x: -24, z: -24, width: 16, depth: 11, height: 11, wall: 0x849ca8, style: 'mall' });
makeBuilding({ name: 'SCHOOL', x: 24, z: 47, width: 13, depth: 9, height: 7, wall: 0xc3b88a, style: 'school' });
makeBuilding({ name: 'APARTMENTS', x: -25, z: 47, width: 11, depth: 10, height: 19, wall: 0x8c8178, style: 'apartment' });
makeBuilding({ name: 'OFFICES', x: 47, z: 23, width: 12, depth: 11, height: 25, wall: 0x54758b, style: 'office' });
makeBuilding({ name: 'PHARMACY', x: 47, z: -24, width: 9, depth: 8, height: 6, wall: 0xf0f0e9, style: 'pharmacy' });

const treeGeometry = new THREE.SphereGeometry(1, 9, 7);
function addTree(x, z) {
  box(scene, x, 0.9, z, 0.32, 1.8, 0.32, materials.trunk);
  const crown = new THREE.Mesh(treeGeometry, material(0x347a4d));
  crown.position.set(x, 2.5, z);
  crown.scale.set(1.05, 1.25, 1.05);
  scene.add(crown);
}
for (const point of [-40, -30, -20, 20, 30, 40]) {
  addTree(-11.4, point);
  addTree(11.4, point);
  addTree(point, -11.4);
  addTree(point, 11.4);
}

const streetLights = [];
const poleGeometry = new THREE.CylinderGeometry(0.07, 0.09, 6, 8);
for (const [x, z] of [[-13, -17], [-13, 17], [13, -17], [13, 17], [-38, 0], [38, 0]]) {
  const pole = new THREE.Mesh(poleGeometry, materials.metal);
  pole.position.set(x, 3, z);
  scene.add(pole);
  box(scene, x + Math.sign(-x) * 0.6, 5.85, z, 1.2, 0.15, 0.24, materials.headlight);
  const light = new THREE.PointLight(0xffdca2, 0, 18, 2);
  light.position.set(x + Math.sign(-x) * 0.6, 5.7, z);
  scene.add(light);
  streetLights.push(light);
}

const signalMeshes = {};
const signalMaterials = {
  red: material(0xff3048, 0.4),
  yellow: material(0xffbd3f, 0.4),
  green: material(0x00e58b, 0.4),
  off: material(0x252f37)
};
function makeSignal(name, x, z, rotation) {
  const group = new THREE.Group();
  group.position.set(x, 0.1, z);
  group.rotation.y = rotation;
  scene.add(group);
  const pole = new THREE.Mesh(poleGeometry, material(0x303a42));
  pole.position.y = 2.6;
  group.add(pole);
  box(group, 0, 5.25, 0, 0.72, 1.65, 0.6, material(0x12191e));
  const lamps = [];
  [4.73, 5.25, 5.77].forEach((y, index) => {
    const colors = [0xff3048, 0xffbd3f, 0x00e58b];
    const mat = new THREE.MeshStandardMaterial({
      color: colors[index],
      emissive: 0x000000,
      emissiveIntensity: 1.1
    });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 8), mat);
    lamp.position.set(0, y, 0.32);
    group.add(lamp);
    lamps.push(lamp);
  });
  signalMeshes[name] = { lamps, group };
}
makeSignal('n', -8.1, 8.1, 0);
makeSignal('s', 8.1, -8.1, Math.PI);
makeSignal('e', 8.1, 8.1, Math.PI / 2);
makeSignal('w', -8.1, -8.1, -Math.PI / 2);

const approaches = [
  { axis: 'z', dir: -1, lane: -2.25, heading: Math.PI, name: 'North' },
  { axis: 'z', dir: 1, lane: 2.25, heading: 0, name: 'South' },
  { axis: 'x', dir: -1, lane: 2.25, heading: -Math.PI / 2, name: 'East' },
  { axis: 'x', dir: 1, lane: -2.25, heading: Math.PI / 2, name: 'West' }
];
let vehicleSerial = 0;
const vehicles = [];
const vehicleMaterials = new Map();
function vehicleMaterial(color) {
  if (!vehicleMaterials.has(color)) vehicleMaterials.set(color, material(color, 0.42, 0.12));
  return vehicleMaterials.get(color);
}
function createVehicle(type, route, startDistance = 35, primaryEmergency = false) {
  const group = new THREE.Group();
  const bodyLength = type === 'bus' ? 4.5 : type === 'truck' || type === 'fire' ? 3.7 : 2.85;
  const bodyWidth = type === 'bus' ? 1.85 : type === 'truck' || type === 'fire' ? 1.65 : 1.45;
  const color = {
    ambulance: 0xf2f4f3,
    police: 0x24496e,
    fire: 0xb92832,
    car: [0x367fac, 0xb84d43, 0x424e59, 0xc79a44, 0x52856b][vehicleSerial % 5],
    bus: 0xe0a941,
    truck: 0x8d9ca5
  }[type] || 0x367fac;
  box(group, 0, 0.54, 0, bodyWidth, 0.76, bodyLength, vehicleMaterial(color));
  box(group, 0, 1.04, -0.18, bodyWidth * 0.82, 0.48, bodyLength * (type === 'bus' ? 0.57 : 0.45), materials.darkGlass);
  box(group, 0, 1.06, bodyLength * 0.08, bodyWidth * 0.78, 0.39, 0.09, materials.glass);
  box(group, 0, 0.94, -bodyLength * 0.32, bodyWidth * 0.75, 0.34, 0.08, materials.glass);
  for (const side of [-1, 1]) {
    for (const axle of [-bodyLength * 0.31, bodyLength * 0.31]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12), materials.tire);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * (bodyWidth / 2 - 0.04), 0.32, axle);
      group.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.205, 10), materials.metal);
      hub.rotation.z = Math.PI / 2;
      hub.position.copy(wheel.position);
      group.add(hub);
    }
  }
  for (const side of [-1, 1]) {
    box(group, side * (bodyWidth * 0.31), 0.65, bodyLength / 2 + 0.02, 0.25, 0.19, 0.05, materials.headlight);
    box(group, side * (bodyWidth * 0.31), 0.65, -bodyLength / 2 - 0.02, 0.25, 0.19, 0.05, materials.brake);
  }
  let beacons = [];
  let beaconLights = [];
  if (['ambulance', 'police', 'fire'].includes(type)) {
    const beaconRed = box(group, -0.29, 1.39, 0, 0.38, 0.15, 0.34, materials.red);
    const beaconBlue = box(group, 0.29, 1.39, 0, 0.38, 0.15, 0.34, materials.blue);
    beacons = [beaconRed, beaconBlue];
    beaconLights = [0xff3048, 0x258cff].map((color, index) => {
      const light = new THREE.PointLight(color, 0, 8, 2);
      light.position.set(index === 0 ? -0.3 : 0.3, 1.45, 0);
      group.add(light);
      return light;
    });
  }
  if (type === 'ambulance') {
    box(group, 0, 0.56, bodyLength / 2 + 0.035, 0.76, 0.64, 0.06, materials.red);
    box(group, 0, 0.56, bodyLength / 2 + 0.07, 0.2, 0.53, 0.035, materials.white);
    box(group, 0, 0.56, bodyLength / 2 + 0.09, 0.55, 0.19, 0.035, materials.white);
  }
  if (type === 'police') box(group, 0, 0.93, 0, 0.38, 0.18, 0.28, materials.amber);
  group.position.set(
    route.axis === 'x' ? -route.dir * startDistance : route.lane,
    0.03,
    route.axis === 'z' ? -route.dir * startDistance : route.lane
  );
  group.rotation.y = route.heading;
  scene.add(group);
  const labels = makeSign(type === 'ambulance' ? 'AMBULANCE' : type.toUpperCase(), 0x10243a, 2.35);
  labels.position.set(0, 2, 0);
  group.add(labels);
  vehicleSerial++;
  return {
    id: `V${vehicleSerial}`,
    type,
    group,
    route,
    speed: 0,
    wait: 0,
    totalWait: 0,
    beacons,
    beaconLights,
    label: labels,
    bodyLength,
    emergency: primaryEmergency,
    initialDistance: startDistance,
    stopped: false
  };
}

function addVehicle(type, routeIndex) {
  const route = approaches[routeIndex % approaches.length];
  const startDistance = safeSpawnDistance(route, null, 35);
  const vehicle = createVehicle(type, route, startDistance);
  vehicle.label.visible = $('showlabels').checked;
  vehicles.push(vehicle);
  return vehicle;
}

const emergency = createVehicle('ambulance', approaches[0], 42, true);
vehicles.push(emergency);
for (let i = 1; i < 8; i++) addVehicle(i === 6 ? 'bus' : i === 7 ? 'truck' : 'car', i % 4);

let running = false;
let paused = false;
let elapsed = 0;
let emergencyWait = 0;
let activations = 0;
let emergencyPassed = 0;
let priority = false;
let priorityReady = false;
let normalAxis = 'ew';
let phaseElapsed = 0;
let clearanceRemaining = 0;
let cameraMode = 'main';
let nightMode = true;
let sirenEnabled = false;
let audioContext = null;
let sirenOscillators = [];
let flowHistory = [];
let sampleElapsed = 0;
let lastEmergencySpeed = 0;
let journeys = 0;
let journeyCleared = false;

const priorityPath = new THREE.Group();
scene.add(priorityPath);
for (let z = 37; z > -24; z -= 4) {
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.15, 3), materials.green);
  arrow.rotation.x = Math.PI / 2;
  arrow.position.set(emergency.route.lane, 0.06, z);
  priorityPath.add(arrow);
}
const detectionRing = new THREE.Mesh(
  new THREE.RingGeometry(1, 1, 48),
  new THREE.MeshBasicMaterial({ color: 0x258cff, side: THREE.DoubleSide, transparent: true, opacity: 0.18 })
);
detectionRing.rotation.x = -Math.PI / 2;
detectionRing.position.set(0, -0.015, 0);
scene.add(detectionRing);

function log(message) {
  const line = document.createElement('div');
  line.textContent = `${new Date().toLocaleTimeString()} · ${message}`;
  $('log').prepend(line);
  while ($('log').children.length > 12) $('log').lastChild.remove();
}
function alertBox(title, message) {
  $('toasttitle').textContent = title;
  $('toastmsg').textContent = message;
}
function setSignals(axis) {
  for (const [name, signal] of Object.entries(signalMeshes)) {
    const ns = name === 'n' || name === 's';
    const active = axis !== 'all-red' && axis === (ns ? 'ns' : 'ew');
    signal.lamps.forEach((lamp, index) => {
      const on = active ? index === 2 : index === 0;
      lamp.material.emissive.setHex(on ? (index === 2 ? 0x00b45e : 0xc30c25) : 0x000000);
      lamp.material.emissiveIntensity = on ? 1.5 : 0;
    });
    const prefix = name;
    ['R', 'Y', 'G'].forEach((letter, index) => {
      const activeLamp = active ? index === 2 : index === 0;
      $(`${prefix}${letter}`).classList.toggle('on', activeLamp);
    });
  }
  $('signalcaption').textContent = clearanceRemaining > 0 ?
    'All-red safety clearance · conflicting movements held.' : priority ?
    'North–South emergency corridor has priority green; cross traffic is held.' :
    `${axis === 'ns' ? 'North–South' : 'East–West'} traffic currently has green.`;
}
function setPriority(active) {
  priority = active;
  if (active) {
    activations++;
    priorityReady = false;
    clearanceRemaining = 1.4;
    setSignals('all-red');
    alertBox('AMBULANCE DETECTED · PRIORITY ACTIVE', 'Safety clearance in progress · conflicting traffic held');
    log(`Ambulance detected within ${$('detect').value} m · North/South priority granted`);
  } else {
    priorityReady = false;
    clearanceRemaining = 1.4;
    setSignals('all-red');
    alertBox('EMERGENCY VEHICLE CLEARED', 'Normal signal operation restored');
    log('Ambulance cleared the junction · normal traffic resumed');
  }
}
function updateDetectionRing() {
  const radius = Math.max(3, +$('detect').value / 3);
  detectionRing.geometry.dispose();
  detectionRing.geometry = new THREE.RingGeometry(radius - 0.16, radius, 48);
}
function signalAllows(route) {
  if (clearanceRemaining > 0) return false;
  return priority ? priorityReady && route.axis === 'z' :
    (route.axis === 'z' ? normalAxis === 'ns' : normalAxis === 'ew');
}
function coordinate(vehicle) {
  return vehicle.route.axis === 'z' ? vehicle.group.position.z : vehicle.group.position.x;
}
function setCoordinate(vehicle, value) {
  if (vehicle.route.axis === 'z') vehicle.group.position.z = value;
  else vehicle.group.position.x = value;
}
function progress(vehicle) {
  return coordinate(vehicle) * vehicle.route.dir;
}
function positionVehicle(vehicle, distance) {
  setCoordinate(vehicle, -vehicle.route.dir * distance);
  vehicle.speed = 0;
  vehicle.stopped = false;
}
function safeSpawnDistance(route, movingVehicle, preferred) {
  for (let distance = preferred; distance <= 75; distance += 7) {
    const candidate = -route.dir * distance;
    if (route === emergency.route && movingVehicle !== emergency &&
        distance < Math.abs(coordinate(emergency)) + 6) continue;
    const clear = vehicles.filter(vehicle => vehicle !== movingVehicle && vehicle.route === route)
      .every(vehicle => Math.abs(coordinate(vehicle) - candidate) >= Math.max(5.8, (vehicle.bodyLength + 2.85) * 0.5));
    if (clear) return distance;
  }
  return 75;
}

function updateVehicles(dt, speedScale) {
  const normalVehicles = vehicles.filter(vehicle => !vehicle.emergency);
  const routes = new Map();
  normalVehicles.forEach(vehicle => {
    if (!routes.has(vehicle.route)) routes.set(vehicle.route, []);
    routes.get(vehicle.route).push(vehicle);
  });
  const acceleration = 7.5 * speedScale;
  for (const [route, list] of routes) {
    list.sort((a, b) => progress(b) - progress(a));
    for (let index = 0; index < list.length; index++) {
      const vehicle = list[index];
      const position = progress(vehicle);
      let targetSpeed = (vehicle.type === 'bus' || vehicle.type === 'truck' ? 3.2 : 4.4) * speedScale;
      const stopAt = -10.6;
      const toLine = stopAt - position;
      const proceed = signalAllows(route);
      if (!proceed && toLine >= 0) {
        targetSpeed = Math.min(targetSpeed, Math.sqrt(Math.max(0, 2 * acceleration * Math.max(0, toLine - 0.45))));
      } else if (proceed && toLine > 0 && toLine < 8) {
        targetSpeed = Math.min(targetSpeed, (vehicle.type === 'bus' ? 3 : 3.6) * speedScale);
      }
      const ahead = vehicles
        .filter(other => other !== vehicle && other.route === route && progress(other) > position)
        .sort((a, b) => progress(b) - progress(a))[0];
      if (ahead) {
        const gap = progress(ahead) - position - (ahead.bodyLength + vehicle.bodyLength) * 0.5;
        const safeSpeed = Math.max(0, ahead.speed + Math.max(0, gap - 1.7) * 1.5);
        targetSpeed = Math.min(targetSpeed, safeSpeed);
      }
      vehicle.speed += THREE.MathUtils.clamp(targetSpeed - vehicle.speed, -acceleration * dt, acceleration * dt);
      const wasStopped = vehicle.speed < 0.12;
      const distance = vehicle.speed * dt;
      setCoordinate(vehicle, coordinate(vehicle) + vehicle.route.dir * distance);
      vehicle.stopped = wasStopped && (toLine >= 0 || (ahead && progress(ahead) - progress(vehicle) < 6));
      if (vehicle.stopped) {
        vehicle.wait += dt;
        vehicle.totalWait += dt;
      }
      if (progress(vehicle) > 59) positionVehicle(vehicle, safeSpawnDistance(route, vehicle, 35));
    }
  }

  const emergencyProgress = progress(emergency);
  const distanceToJunction = Math.max(0, Math.abs(coordinate(emergency)));
  const detectionDistance = +$('detect').value / 3;
  if (!priority && emergencyProgress <= -11.2 &&
      (distanceToJunction <= detectionDistance || distanceToJunction <= 11.2)) {
    setPriority(true);
  }
  const emergencyTarget = priority && priorityReady ? 6.7 * speedScale : 4.8 * speedScale;
  const emergencyStopAt = -10.6;
  const distanceToStop = emergencyStopAt - emergencyProgress;
  let target = emergencyTarget;
  const emergencyAhead = vehicles
    .filter(vehicle => vehicle !== emergency && vehicle.route === emergency.route && progress(vehicle) > emergencyProgress)
    .sort((a, b) => progress(a) - progress(b))[0];
  if (emergencyAhead) {
    const gap = progress(emergencyAhead) - emergencyProgress - (emergencyAhead.bodyLength + emergency.bodyLength) * 0.5;
    target = Math.min(target, Math.max(0, emergencyAhead.speed + Math.max(0, gap - 1.7) * 1.5));
  }
  if ((!priority || !priorityReady) && distanceToStop >= 0) {
    target = Math.min(target, Math.sqrt(Math.max(0, 2 * 8 * Math.max(0, distanceToStop - 0.4))));
  }
  emergency.speed += THREE.MathUtils.clamp(target - emergency.speed, -8 * dt, 8 * dt);
  const waitingNow = emergency.speed < 0.14 && distanceToStop >= 0;
  if (waitingNow) emergencyWait += dt;
  emergency.stopped = waitingNow;
  setCoordinate(emergency, coordinate(emergency) + emergency.route.dir * emergency.speed * dt);

  const passedLine = progress(emergency) > 12;
  if (priority && passedLine) {
    setPriority(false);
    emergencyPassed++;
    journeys++;
    journeyCleared = true;
    log(`Ambulance journey ${journeys} completed through the junction`);
  }
  if (progress(emergency) > 58) {
    positionVehicle(emergency, safeSpawnDistance(emergency.route, emergency, 66));
    emergency.speed = 0;
    journeyCleared = false;
    log('Ambulance returned to its designated north entry for another run');
  }
  lastEmergencySpeed = emergency.speed * 10.8;
}

function updateStats() {
  const distance = Math.max(0, Math.round(Math.abs(coordinate(emergency)) * 3));
  const averageWait = vehicles.length > 1 ?
    vehicles.filter(vehicle => !vehicle.emergency).reduce((sum, vehicle) => sum + vehicle.totalWait, 0) / (vehicles.length - 1) : 0;
  $('distance').textContent = `${distance} m`;
  $('threshold').textContent = `${$('detect').value} m`;
  $('status').textContent = priority ? 'Detected · priority active' :
    journeyCleared ? 'Passed junction · returning' :
    emergency.stopped ? 'Waiting at signal' : running ? 'Approaching' : 'Standby';
  $('status').className = priority || journeyCleared ? 'green' : emergency.stopped ? 'red' : 'amber';
  $('priority').textContent = priority ? 'ACTIVE' : 'Inactive';
  $('priority').className = priority ? 'green' : 'muted';
  $('currentspeed').textContent = `${Math.round(lastEmergencySpeed)} km/h${emergency.stopped ? ' (stopped)' : ' (simulated)'}`;
  $('ambwait').textContent = `${emergencyWait.toFixed(1)} s`;
  $('normalwait').textContent = `${averageWait.toFixed(1)} s`;
  $('saved').textContent = `${Math.max(0, averageWait - emergencyWait).toFixed(1)} s`;
  $('total').textContent = String(vehicles.length);
  $('activations').textContent = String(activations);
  $('passed').textContent = String(emergencyPassed);
  $('elapsed').textContent = `${elapsed.toFixed(1)} s`;
  $('normalbar').style.width = `${Math.min(100, averageWait * 2)}%`;
  $('ambbar').style.width = `${Math.min(100, emergencyWait * 5)}%`;
}

function updateFlow() {
  const chart = $('flow');
  const ctx = chart.getContext('2d');
  const { width, height } = chart;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = '#1c3a55';
  ctx.lineWidth = 1;
  for (let y = 30; y < height; y += 35) {
    ctx.beginPath();
    ctx.moveTo(38, y);
    ctx.lineTo(width - 10, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#91a8c0';
  ctx.font = '12px Arial';
  ctx.fillText('average waiting time (seconds)', 8, 17);
  for (const [key, color] of [['normal', '#258cff'], ['emergency', '#00e58b']]) {
    const values = flowHistory.map(entry => entry[key]);
    if (!values.length) continue;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    values.forEach((value, index) => {
      const x = 40 + index * (width - 55) / Math.max(1, values.length - 1);
      const y = height - 15 - Math.min(60, value) * (height - 42) / 60;
      if (index) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.stroke();
  }
}

function updateDayNight() {
  nightMode = $('night').checked;
  scene.background.copy(nightMode ? nightColor : dayColor);
  scene.fog.color.copy(nightMode ? nightColor : dayColor);
  ambient.intensity = nightMode ? 0.72 : 1.75;
  sun.intensity = nightMode ? 0.12 : 1.6;
  windowMeshes.forEach(mesh => { mesh.material = nightMode ? materials.windowGlow : materials.window; });
  streetLights.forEach(light => { light.intensity = nightMode ? 1.5 : 0; });
  for (const vehicle of vehicles) {
    vehicle.group.children.forEach(child => {
      if (child.material === materials.headlight) {
        child.material.emissive.setHex(nightMode ? 0xffdb8a : 0x000000);
        child.material.emissiveIntensity = nightMode ? 1.1 : 0;
      }
    });
  }
}

function setCamera(mode) {
  cameraMode = mode;
  log(`Camera changed to ${mode} view`);
}
window.cameraMode = setCamera;
window.showAbout = () => window.alert('Emergency Vehicle Priority Traffic Simulation\nA local 3D computer-graphics demonstration. Detection, distances and signal actions are simulated and are not connected to real-world traffic infrastructure.');

const cameraTarget = new THREE.Vector3();
const cameraPosition = new THREE.Vector3();
const cameraForward = new THREE.Vector3();
const cameraOffset = new THREE.Vector3();
function updateCamera() {
  if (cameraMode === 'follow') {
    cameraForward.set(
      emergency.route.axis === 'x' ? emergency.route.dir : 0,
      0,
      emergency.route.axis === 'z' ? emergency.route.dir : 0
    );
    cameraTarget.set(emergency.group.position.x, 0.7, emergency.group.position.z);
    cameraPosition.copy(cameraTarget).addScaledVector(cameraForward, -12);
    cameraPosition.y += 7;
  } else if (cameraMode === 'top') {
    cameraTarget.set(0, 0, 0);
    cameraPosition.set(0, 69, 0.2);
  } else if (cameraMode === 'side') {
    cameraTarget.set(0, 1, 0);
    cameraPosition.set(42, 13, 0);
  } else {
    cameraTarget.set(0, 1, 0);
    cameraPosition.set(34, 31, 39);
  }
  camera.position.lerp(cameraPosition, cameraMode === 'follow' ? 0.12 : 0.075);
  const currentTarget = camera.userData.target || new THREE.Vector3(0, 0, 0);
  currentTarget.lerp(cameraTarget, 0.16);
  camera.userData.target = currentTarget;
  camera.lookAt(currentTarget);
}

function conflictingTrafficInJunction(axis) {
  const allowedRouteAxis = axis === 'ns' ? 'z' : 'x';
  return vehicles.some(vehicle => vehicle.route.axis !== allowedRouteAxis &&
    progress(vehicle) > -10.4 && progress(vehicle) < 12.8);
}

function simulate(dt) {
  if (!running || (paused && dt !== 0.2)) return;
  const speedScale = +$('speed').value;
  dt *= speedScale;
  elapsed += dt;
  if (clearanceRemaining > 0) {
    clearanceRemaining = Math.max(0, clearanceRemaining - dt);
    if (clearanceRemaining === 0) {
      const nextAxis = priority ? 'ns' : normalAxis;
      if (conflictingTrafficInJunction(nextAxis)) {
        clearanceRemaining = 0.1;
      } else {
        priorityReady = priority;
        setSignals(nextAxis);
      }
    }
  }
  if (!priority) {
    phaseElapsed += dt;
    if (phaseElapsed >= 12 && clearanceRemaining === 0) {
      phaseElapsed = 0;
      normalAxis = normalAxis === 'ns' ? 'ew' : 'ns';
      clearanceRemaining = 1.4;
      setSignals('all-red');
      log(`${normalAxis === 'ns' ? 'North/South' : 'East/West'} signal phase active`);
    }
  }
  updateVehicles(dt, speedScale);
  sampleElapsed += dt;
  if (sampleElapsed >= 0.5) {
    sampleElapsed %= 0.5;
    const waiting = vehicles.filter(vehicle => !vehicle.emergency)
      .reduce((sum, vehicle) => sum + vehicle.totalWait, 0) / Math.max(1, vehicles.length - 1);
    flowHistory.push({ normal: waiting, emergency: emergencyWait });
    if (flowHistory.length > 90) flowHistory.shift();
    updateFlow();
  }
  updateStats();
}

function reset() {
  running = false;
  paused = false;
  $('pause').textContent = 'Ⅱ Pause';
  elapsed = emergencyWait = phaseElapsed = sampleElapsed = 0;
  clearanceRemaining = 0;
  activations = emergencyPassed = journeys = 0;
  priority = false;
  priorityReady = false;
  journeyCleared = false;
  normalAxis = 'ew';
  vehicles.forEach(vehicle => {
    positionVehicle(vehicle, vehicle.initialDistance);
    vehicle.wait = vehicle.totalWait = 0;
    vehicle.stopped = false;
  });
  lastEmergencySpeed = 0;
  flowHistory = [];
  setSignals(normalAxis);
  alertBox('SYSTEM READY · NORMAL TRAFFIC', 'Start the simulation to activate emergency detection');
  log('Simulation reset · vehicles returned to designated entry lanes');
  updateStats();
  updateFlow();
}

function addSiren() {
  if (sirenEnabled) {
    sirenOscillators.forEach(oscillator => {
      try { oscillator.stop(); } catch (error) { console.warn('Siren oscillator was already stopped.', error); }
    });
    sirenOscillators = [];
    sirenEnabled = false;
    $('siren').textContent = 'Enable siren · muted';
    $('siren').setAttribute('aria-pressed', 'false');
    return;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    log('Siren unavailable · this browser does not support Web Audio');
    return;
  }
  audioContext ||= new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const modulator = audioContext.createOscillator();
  const modulationDepth = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 850;
  gain.gain.value = 0.035;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  modulator.type = 'sine';
  modulator.frequency.value = 0.72;
  modulationDepth.gain.value = 130;
  modulator.connect(modulationDepth);
  modulationDepth.connect(oscillator.frequency);
  oscillator.start();
  modulator.start();
  sirenOscillators = [oscillator, modulator];
  sirenEnabled = true;
  $('siren').textContent = 'Mute siren · enabled';
  $('siren').setAttribute('aria-pressed', 'true');
}

function resize() {
  const width = Math.max(1, canvas.clientWidth);
  const height = Math.max(1, canvas.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  const flow = $('flow');
  const rect = flow.getBoundingClientRect();
  if (rect.width > 0) {
    flow.width = Math.round(rect.width * Math.min(window.devicePixelRatio || 1, 1.5));
    flow.height = Math.round(125 * Math.min(window.devicePixelRatio || 1, 1.5));
    updateFlow();
  }
}
new ResizeObserver(resize).observe(canvas);
window.addEventListener('resize', resize);

$('start').onclick = () => {
  running = true;
  paused = false;
  $('pause').textContent = 'Ⅱ Pause';
  alertBox('SIMULATION RUNNING', 'Traffic flow and emergency detection are active');
  log('Simulation started');
};
$('pause').onclick = () => {
  paused = !paused;
  $('pause').textContent = paused ? '▶ Resume' : 'Ⅱ Pause';
  log(paused ? 'Simulation paused' : 'Simulation resumed');
};
$('reset').onclick = reset;
$('step').onclick = () => {
  if (!running) running = true;
  const wasPaused = paused;
  paused = false;
  simulate(0.2);
  paused = wasPaused;
  log('Single simulation step executed');
};
$('addvehicle').onclick = () => {
  if (vehicles.length >= 16) {
    log('Vehicle capacity reached · reduce traffic density before adding more');
    return;
  }
  const selected = document.querySelector('.vehicle.sel')?.dataset.type || 'car';
  addVehicle(selected, (vehicles.length - 1) % approaches.length);
  log(`${selected} added to an entry lane`);
  updateDayNight();
  updateStats();
};
document.querySelectorAll('.vehicle').forEach(element => {
  element.onclick = () => {
    document.querySelectorAll('.vehicle').forEach(vehicle => vehicle.classList.remove('sel'));
    element.classList.add('sel');
  };
});
$('speed').oninput = event => {
  $('speedtxt').textContent = `${(+event.target.value).toFixed(1)}×`;
};
$('density').oninput = event => {
  const targetCount = +event.target.value;
  $('densitytxt').textContent = `${targetCount} vehicles`;
  while (vehicles.length > targetCount) {
    const index = vehicles.length - 1;
    const [removed] = vehicles.splice(index, 1);
    if (removed !== emergency) scene.remove(removed.group);
  }
  while (vehicles.length < targetCount) addVehicle('car', (vehicles.length - 1) % approaches.length);
  updateDayNight();
  updateStats();
};
$('detect').oninput = event => {
  $('detecttxt').textContent = `${event.target.value} m`;
  updateDetectionRing();
};
$('night').onchange = () => {
  updateDayNight();
  log(nightMode ? 'Night mode enabled' : 'Day mode enabled');
};
$('siren').onclick = addSiren;
$('showpath').onchange = event => { priorityPath.visible = event.target.checked; };
$('showradius').onchange = event => { detectionRing.visible = event.target.checked; };
$('showlabels').onchange = event => {
  vehicles.forEach(vehicle => { vehicle.label.visible = event.target.checked; });
};
$('export').onclick = () => {
  const averageWait = vehicles.length > 1 ?
    vehicles.filter(vehicle => !vehicle.emergency).reduce((sum, vehicle) => sum + vehicle.totalWait, 0) / (vehicles.length - 1) : 0;
  const rows = [
    ['Metric', 'Value'],
    ['Elapsed simulation seconds', elapsed.toFixed(1)],
    ['Vehicles currently in simulation', vehicles.length],
    ['Emergency vehicles passed', emergencyPassed],
    ['Priority activations', activations],
    ['Detection distance (m)', $('detect').value],
    ['Simulation speed multiplier', $('speed').value],
    ['Emergency vehicle waiting seconds', emergencyWait.toFixed(1)],
    ['Average normal vehicle waiting seconds', averageWait.toFixed(1)],
    ['Estimated time saved seconds', Math.max(0, averageWait - emergencyWait).toFixed(1)],
    ['Night mode', nightMode ? 'enabled' : 'disabled']
  ];
  const escape = value => `"${String(value).replaceAll('"', '""')}"`;
  const csv = rows.map(row => row.map(escape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'traffic-simulation-report.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  log('CSV simulation report exported');
};

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, Math.max(0, (now - (animate.last || now)) / 1000));
  animate.last = now;
  simulate(dt);
  const flash = Math.floor(now / 220) % 2 === 0;
  vehicles.forEach(vehicle => {
    vehicle.beacons.forEach((beacon, index) => {
      const on = index === (flash ? 0 : 1);
      beacon.material.emissive.setHex(on ? (index === 0 ? 0x8c0814 : 0x075ac0) : 0x000000);
      beacon.material.emissiveIntensity = on ? 1.8 : 0;
      vehicle.beaconLights[index].intensity = on ? (nightMode ? 1.8 : 0.75) : 0;
    });
  });
  updateCamera();
  renderer.render(scene, camera);
}

updateDetectionRing();
priorityPath.visible = $('showpath').checked;
detectionRing.visible = $('showradius').checked;
setSignals(normalAxis);
updateDayNight();
updateStats();
resize();
log('3D city loaded · lane-aware controller ready');
requestAnimationFrame(animate);
