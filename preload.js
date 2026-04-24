// ── game.js — Three.js engine core ───────────────────────────────────────────
'use strict';

(function() {

// ── Renderer ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputEncoding = THREE.sRGBEncoding;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, 1, 0.05, 600);
camera.position.set(0, 2, 0);

// ── GLTF Loader ───────────────────────────────────────────────────────────────
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');
const gltfLoader = new THREE.GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// ── Noise (for fallback terrain) ──────────────────────────────────────────────
function noiseH(x, z) {
  return Math.sin(x*0.04)*Math.cos(z*0.04)*2.8
       + Math.sin(x*0.13+1.2)*Math.cos(z*0.11)*0.7
       + Math.sin(x*0.31)*Math.cos(z*0.29)*0.18;
}

// ── Scene state ───────────────────────────────────────────────────────────────
let terrainObject = null;
let sceneObjects  = [];
let snowParticles = null, snowGeo = null, snowVel = null, snowCount = 0;
const raycaster   = new THREE.Raycaster();
const _down       = new THREE.Vector3(0,-1,0);

// ── Lighting ──────────────────────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xd5e8ff, 0.8);
scene.add(ambientLight);
const sun = new THREE.DirectionalLight(0xfff8e8, 1.2);
sun.position.set(80, 120, 60);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
const sc = sun.shadow.camera;
sc.left = sc.bottom = -180; sc.right = sc.top = 180;
sun.shadow.camera.far = 600; sun.shadow.bias = -0.0005;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xd0e8ff, 0x7090a8, 0.6));

// ── Helpers ───────────────────────────────────────────────────────────────────
function enableShadows(obj) {
  obj.traverse(c => {
    if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
  });
}

function getFloor(x, z) {
  raycaster.set(new THREE.Vector3(x, 200, z), _down);
  const hits = terrainObject ? raycaster.intersectObject(terrainObject, true) : [];
  return hits.length ? hits[0].point.y : noiseH(x, z);
}

function normaliseAndPlace(obj, x, z, targetHeight) {
  enableShadows(obj);
  const box = new THREE.Box3().setFromObject(obj);
  const sz  = new THREE.Vector3(); box.getSize(sz);
  const scl = sz.y > 0 ? targetHeight / sz.y : 1;
  obj.scale.setScalar(scl);
  const b2 = new THREE.Box3().setFromObject(obj);
  const floor = getFloor(x, z);
  obj.position.set(x, floor - b2.min.y, z);
  obj.rotation.y = Math.random() * Math.PI * 2;
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function scatter(count, minDist, maxDist, callback) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = minDist + Math.random() * (maxDist - minDist);
    callback(Math.cos(angle)*dist, Math.sin(angle)*dist);
  }
}

// ── Procedural fallbacks ──────────────────────────────────────────────────────
function makeProcTree(x, z) {
  const g = new THREE.Group();
  const bm = new THREE.MeshLambertMaterial({ color:0x3d2b1f });
  const nm = new THREE.MeshLambertMaterial({ color:0x2d4a2a });
  const sm = new THREE.MeshLambertMaterial({ color:0xddeeff, transparent:true, opacity:0.9 });
  const trunkH = 3 + Math.random()*2;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.22,trunkH,7), bm);
  trunk.position.y = trunkH/2; trunk.castShadow = true; g.add(trunk);
  const layers = 4 + Math.floor(Math.random()*3), canH = 5 + Math.random()*3;
  for (let i=0;i<layers;i++) {
    const t=i/(layers-1), r=(1.4-t*0.8)*(0.9+Math.random()*0.25), ch=canH/layers*1.4;
    const cy = trunkH*0.7 + t*canH;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r,ch,8), nm);
    cone.position.y=cy; cone.rotation.y=Math.random()*Math.PI; cone.castShadow=true; g.add(cone);
    if (Math.random()>0.35) {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(r*0.65,ch*0.22,8), sm);
      cap.position.y=cy+ch*0.38; g.add(cap);
    }
  }
  return g;
}

function makeProcBush(x, z) {
  const g = new THREE.Group();
  const bm = new THREE.MeshLambertMaterial({ color:0x2a4020 });
  const sm = new THREE.MeshLambertMaterial({ color:0xe8f0f8, transparent:true, opacity:0.88 });
  const n = 3+Math.floor(Math.random()*3);
  for (let i=0;i<n;i++) {
    const a=(i/n)*Math.PI*2+Math.random()*0.5, r=Math.random()*0.3, rad=0.2+Math.random()*0.25;
    const m = new THREE.Mesh(new THREE.SphereGeometry(rad,7,6), bm);
    m.position.set(Math.cos(a)*r, rad*0.7, Math.sin(a)*r); m.scale.y=0.75; m.castShadow=true; g.add(m);
    const sc2 = new THREE.Mesh(new THREE.SphereGeometry(rad*0.6,6,5), sm);
    sc2.position.set(Math.cos(a)*r, rad*1.25, Math.sin(a)*r); sc2.scale.y=0.4; g.add(sc2);
  }
  return g;
}

function makeProcStump(x, z) {
  const g = new THREE.Group();
  const bm = new THREE.MeshLambertMaterial({ color:0x3d2b1f });
  const sm = new THREE.MeshLambertMaterial({ color:0xddeeff });
  const h = 0.35+Math.random()*0.35;
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.28,h,8), bm);
  s.position.y=h/2; s.castShadow=true; g.add(s);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,0.07,8), sm);
  cap.position.y=h+0.035; g.add(cap);
  return g;
}

// ── Asset cache (avoid redundant re-loads) ────────────────────────────────────
const assetCache = {};

async function loadGLB(filePath) {
  if (assetCache[filePath]) return assetCache[filePath].clone();
  return new Promise((resolve, reject) => {
    // Convert local path to asset:// URL for Electron
    const url = window.engine
      ? 'asset://' + encodeURIComponent(filePath)
      : filePath;
    gltfLoader.load(url, gltf => {
      assetCache[filePath] = gltf.scene;
      resolve(gltf.scene.clone());
    }, undefined, reject);
  });
}

// ── Build / rebuild scene ─────────────────────────────────────────────────────
async function buildScene() {
  setStatus('Building scene…', true);

  // Clear previous scene objects
  sceneObjects.forEach(o => scene.remove(o));
  sceneObjects = [];
  if (snowParticles) { scene.remove(snowParticles); snowParticles = null; }
  terrainObject = null;

  const c = window.cfg;
  const sc2 = c.scatter || {};

  // Apply env settings
  const skyCol = new THREE.Color(c.skyColor || '#c8ddf0');
  scene.background = skyCol;
  scene.fog = new THREE.FogExp2(skyCol, c.fogDensity ?? 0.02);
  camera.fov = c.fov || 72;
  camera.updateProjectionMatrix();

  // ── Terrain ────────────────────────────────────────────────────────────────
  if (c.assets.terrain) {
    try {
      const obj = await loadGLB(c.assets.terrain);
      enableShadows(obj);
      const box = new THREE.Box3().setFromObject(obj);
      const sz  = new THREE.Vector3(); box.getSize(sz);
      const targetW = 220;
      const scl = Math.max(sz.x,sz.z) > 0 ? targetW/Math.max(sz.x,sz.z) : 1;
      obj.scale.setScalar(scl);
      const b2 = new THREE.Box3().setFromObject(obj);
      obj.position.x = -(b2.min.x+b2.max.x)/2;
      obj.position.z = -(b2.min.z+b2.max.z)/2;
      obj.position.y = -b2.min.y;
      scene.add(obj); sceneObjects.push(obj); terrainObject = obj;
    } catch(e) { console.warn('Terrain load failed:', e); }
  }

  // Fallback terrain
  if (!terrainObject) {
    const geo = new THREE.PlaneGeometry(300,300,100,100);
    geo.rotateX(-Math.PI/2);
    const pa = geo.attributes.position;
    for (let i=0;i<pa.count;i++) pa.setY(i, noiseH(pa.getX(i),pa.getZ(i)));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({color:0xeef4ff}));
    m.receiveShadow=true; scene.add(m); sceneObjects.push(m); terrainObject=m;
  }

  // ── Trees ──────────────────────────────────────────────────────────────────
  const treeFiles  = c.assets.trees  || [];
  const bushFiles  = c.assets.bushes || [];
  const stumpFiles = c.assets.stumps || [];
  const miscFiles  = c.assets.misc   || [];

  const tCount  = sc2.treeCount  ?? 110;
  const bCount  = sc2.bushCount  ?? 80;
  const sCount  = sc2.stumpCount ?? 40;
  const mCount  = sc2.miscCount  ?? 20;

  await scatter(tCount, sc2.treeMinDist??12, sc2.treeMaxDist??130, async (x,z) => {
    let obj;
    if (treeFiles.length) {
      try { obj = await loadGLB(pickRandom(treeFiles)); }
      catch(e) { obj = makeProcTree(x,z); }
    } else { obj = makeProcTree(x,z); }
    const h = (sc2.treeMinScale??6) + Math.random()*((sc2.treeMaxScale??10)-(sc2.treeMinScale??6));
    normaliseAndPlace(obj, x, z, h);
    scene.add(obj); sceneObjects.push(obj);
  });

  await scatter(bCount, sc2.bushMinDist??8, sc2.bushMaxDist??120, async (x,z) => {
    let obj;
    if (bushFiles.length) {
      try { obj = await loadGLB(pickRandom(bushFiles)); }
      catch(e) { obj = makeProcBush(x,z); }
    } else { obj = makeProcBush(x,z); }
    const h = (sc2.bushMinScale??0.5) + Math.random()*((sc2.bushMaxScale??1.5)-(sc2.bushMinScale??0.5));
    normaliseAndPlace(obj, x, z, h);
    scene.add(obj); sceneObjects.push(obj);
  });

  await scatter(sCount, sc2.stumpMinDist??10, sc2.stumpMaxDist??100, async (x,z) => {
    let obj;
    if (stumpFiles.length) {
      try { obj = await loadGLB(pickRandom(stumpFiles)); }
      catch(e) { obj = makeProcStump(x,z); }
    } else { obj = makeProcStump(x,z); }
    const h = sc2.stumpScale ?? 0.6;
    normaliseAndPlace(obj, x, z, h);
    scene.add(obj); sceneObjects.push(obj);
  });

  if (miscFiles.length) {
    await scatter(mCount, 8, sc2.miscMaxDist??100, async (x,z) => {
      try {
        const obj = await loadGLB(pickRandom(miscFiles));
        const box = new THREE.Box3().setFromObject(obj);
        const sz  = new THREE.Vector3(); box.getSize(sz);
        normaliseAndPlace(obj, x, z, Math.max(sz.y, 1));
        scene.add(obj); sceneObjects.push(obj);
      } catch(e) {}
    });
  }

  // ── Snow particles ─────────────────────────────────────────────────────────
  const count = Math.round(c.snowIntensity ?? 3500);
  if (count > 0) {
    const spos = new Float32Array(count*3);
    const svel2 = new Float32Array(count);
    for (let i=0;i<count;i++) {
      spos[i*3]   = (Math.random()-0.5)*100;
      spos[i*3+1] = Math.random()*20;
      spos[i*3+2] = (Math.random()-0.5)*100;
      svel2[i] = 0.008 + Math.random()*0.018;
    }
    snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.BufferAttribute(spos,3));
    snowVel = svel2; snowCount = count;
    snowParticles = new THREE.Points(snowGeo,
      new THREE.PointsMaterial({color:0xffffff,size:0.07,transparent:true,opacity:0.75,depthWrite:false}));
    scene.add(snowParticles);
  }

  // Reset camera
  const startY = getFloor(0,0)+1.75;
  camera.position.set(0, startY, 0);
  targetCamY = startY;

  setStatus('Ready', false);
}

// ── Apply live config changes ─────────────────────────────────────────────────
window.gameApplyConfig = function() {
  const c = window.cfg;
  const skyCol = new THREE.Color(c.skyColor || '#c8ddf0');
  scene.background = skyCol;
  if (scene.fog) { scene.fog.color = skyCol; scene.fog.density = c.fogDensity ?? 0.02; }
  camera.fov = c.fov || 72;
  camera.updateProjectionMatrix();
};

window.gameRebuildScene = buildScene;

// ── Resize handling ───────────────────────────────────────────────────────────
function resizeRenderer() {
  const vp = document.getElementById('viewport');
  const w = vp.clientWidth, h = vp.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
const resizeObserver = new ResizeObserver(resizeRenderer);
resizeObserver.observe(document.getElementById('viewport'));
resizeRenderer();

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Escape' && gameActive) pauseGame();
});
document.addEventListener('keyup', e => keys[e.code] = false);

let yaw=0, pitch=0, locked=false, gameActive=false, bobT=0, targetCamY=1.75;

document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  if (!locked && gameActive) pauseGame();
  document.getElementById('crosshair').style.display = locked ? 'block' : 'none';
});

document.addEventListener('mousemove', e => {
  if (!locked || !gameActive) return;
  const sens = (window.cfg.mouseSensitivity ?? 2.2) * 0.001;
  yaw   -= e.movementX * sens;
  pitch -= e.movementY * sens;
  pitch  = Math.max(-1.15, Math.min(0.5, pitch));
});

canvas.addEventListener('click', () => {
  if (gameActive) canvas.requestPointerLock();
});

// ── Play / Pause ──────────────────────────────────────────────────────────────
function startGame() {
  gameActive = true;
  document.getElementById('game-overlay').style.display = 'none';
  document.getElementById('hud').style.display = 'block';
  canvas.requestPointerLock();
  if (!loopRunning) { loopRunning=true; clock.start(); renderLoop(); }
}

function pauseGame() {
  gameActive = false;
  document.exitPointerLock();
  document.getElementById('hud').style.display = 'none';
  const ol = document.getElementById('game-overlay');
  ol.style.display = 'flex';
  ol.querySelector('h2').textContent = 'Paused';
  ol.querySelector('p').textContent = 'Click "Resume" to continue';
  document.getElementById('play-btn').textContent = 'Resume';
}

document.getElementById('play-btn').addEventListener('click', startGame);
document.getElementById('btn-launch').addEventListener('click', startGame);

// ── Game loop ─────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let loopRunning = false;

function renderLoop() {
  requestAnimationFrame(renderLoop);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (gameActive) {
    const c = window.cfg;
    const walk = c.walkSpeed ?? 4.5;
    const run  = c.runSpeed  ?? 9.0;
    const speed = (keys['ShiftLeft']||keys['ShiftRight']) ? run : walk;

    const fwd   = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right  = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const dir    = new THREE.Vector3();

    if (keys['KeyW']||keys['ArrowUp'])    dir.add(fwd);
    if (keys['KeyS']||keys['ArrowDown'])  dir.sub(fwd);
    if (keys['KeyA']||keys['ArrowLeft'])  dir.sub(right);
    if (keys['KeyD']||keys['ArrowRight']) dir.add(right);

    const moving = dir.lengthSq() > 0.01;
    if (moving) {
      dir.normalize();
      camera.position.x = Math.max(-145, Math.min(145, camera.position.x + dir.x*speed*dt));
      camera.position.z = Math.max(-145, Math.min(145, camera.position.z + dir.z*speed*dt));
      bobT += dt * (speed > walk ? 10 : 6);
    }

    // Terrain follow
    const floor = getFloor(camera.position.x, camera.position.z);
    targetCamY += ((floor + 1.75) - targetCamY) * Math.min(1, dt*8);
    camera.position.y = targetCamY;

    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch + (moving ? Math.sin(bobT)*0.032 : 0);
    camera.rotation.z = moving ? Math.sin(bobT*0.5)*0.007 : 0;

    // Snow
    if (snowGeo && snowCount > 0) {
      const sp = snowGeo.attributes.position.array;
      const cx=camera.position.x, cy=camera.position.y, cz=camera.position.z;
      const t = Date.now()*0.001;
      for (let i=0;i<snowCount;i++) {
        sp[i*3+1] -= snowVel[i]*18*dt;
        sp[i*3]   += Math.sin(t*0.7+i*0.31)*0.004;
        const dx=sp[i*3]-cx, dz=sp[i*3+2]-cz;
        if (sp[i*3+1] < noiseH(sp[i*3],sp[i*3+2])-1 || dx*dx+dz*dz > 3000) {
          sp[i*3]   = cx+(Math.random()-0.5)*100;
          sp[i*3+2] = cz+(Math.random()-0.5)*100;
          sp[i*3+1] = cy+14+Math.random()*8;
        }
      }
      snowGeo.attributes.position.needsUpdate = true;
    }

    // Update position in status bar
    document.getElementById('status-pos').textContent =
      `X:${camera.position.x.toFixed(1)}  Y:${camera.position.y.toFixed(1)}  Z:${camera.position.z.toFixed(1)}`;
  }

  renderer.render(scene, camera);
}

// ── Status ────────────────────────────────────────────────────────────────────
function setStatus(msg, active) {
  document.getElementById('status-text').textContent = msg;
  const dot = document.getElementById('dot-status');
  dot.className = 'dot' + (active ? '' : ' inactive');
}

// ── Init: build scene immediately ─────────────────────────────────────────────
buildScene();
// Start render loop (so scene is visible before play)
loopRunning = true; clock.start(); renderLoop();

})();
