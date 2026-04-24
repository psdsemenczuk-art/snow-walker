<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' asset: blob: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; connect-src *;">
<title>Snow Walker Engine</title>
<style>
:root {
  --bg0: #0d1520;
  --bg1: #111c2e;
  --bg2: #172236;
  --bg3: #1e2d45;
  --border: #243450;
  --accent: #3d7fd4;
  --accent2: #5fa0f0;
  --text: #c8d8f0;
  --text2: #7090b8;
  --text3: #405878;
  --green: #4caf7a;
  --red: #e05a5a;
  --amber: #d4943a;
  --panel: 300px;
  --radius: 6px;
}
* { margin:0; padding:0; box-sizing:border-box; }
body { background:var(--bg0); color:var(--text); font-family:'Segoe UI',system-ui,sans-serif; font-size:13px; display:flex; flex-direction:column; height:100vh; overflow:hidden; user-select:none; }

/* ── Top bar ── */
#topbar {
  height:42px; background:var(--bg1); border-bottom:1px solid var(--border);
  display:flex; align-items:center; padding:0 16px; gap:12px; flex-shrink:0; z-index:100;
}
#topbar .logo { font-size:15px; font-weight:600; color:#e8f4ff; letter-spacing:0.05em; flex:1; }
#topbar .logo span { color:var(--accent2); }
.tab-btn {
  padding:5px 14px; border-radius:var(--radius); border:1px solid transparent;
  background:transparent; color:var(--text2); cursor:pointer; font-size:12px;
  letter-spacing:0.06em; text-transform:uppercase; transition:all 0.15s;
}
.tab-btn:hover { color:var(--text); background:var(--bg3); }
.tab-btn.active { background:var(--accent); color:#fff; border-color:var(--accent); }

/* ── Main area ── */
#main { display:flex; flex:1; overflow:hidden; }

/* ── Sidebar ── */
#sidebar {
  width:var(--panel); background:var(--bg1); border-right:1px solid var(--border);
  display:flex; flex-direction:column; overflow:hidden; flex-shrink:0;
}
#sidebar-scroll { flex:1; overflow-y:auto; padding:12px; }
#sidebar-scroll::-webkit-scrollbar { width:4px; }
#sidebar-scroll::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }

.section { margin-bottom:18px; }
.section-title {
  font-size:10px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase;
  color:var(--text3); margin-bottom:8px; padding-bottom:5px;
  border-bottom:1px solid var(--border);
}
.field { margin-bottom:10px; }
.field label { display:block; font-size:11px; color:var(--text2); margin-bottom:4px; }
.field-row { display:flex; align-items:center; gap:8px; }
.field-row input[type=range] { flex:1; accent-color:var(--accent); }
.field-row .val {
  min-width:38px; text-align:right; font-size:12px; color:var(--accent2); font-variant-numeric:tabular-nums;
}
input[type=color] {
  width:36px; height:24px; border:1px solid var(--border); border-radius:3px;
  background:none; cursor:pointer; padding:1px;
}
.btn {
  padding:6px 12px; border-radius:var(--radius); border:1px solid var(--border);
  background:var(--bg3); color:var(--text); cursor:pointer; font-size:12px;
  transition:all 0.15s; width:100%;
}
.btn:hover { background:var(--accent); border-color:var(--accent); color:#fff; }
.btn.danger:hover { background:var(--red); border-color:var(--red); }
.btn.launch { background:var(--green); border-color:var(--green); color:#fff; font-weight:600; font-size:13px; padding:8px; }
.btn.launch:hover { filter:brightness(1.1); }

/* ── Asset slots ── */
.asset-slot {
  background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius);
  padding:8px 10px; margin-bottom:6px; cursor:pointer; transition:all 0.15s;
  position:relative;
}
.asset-slot:hover { border-color:var(--accent); }
.asset-slot.dragover { border-color:var(--accent2); background:var(--bg3); }
.asset-slot .slot-header { display:flex; align-items:center; justify-content:space-between; }
.asset-slot .slot-label { font-size:11px; color:var(--text2); text-transform:uppercase; letter-spacing:0.06em; }
.asset-slot .slot-badge {
  font-size:10px; padding:2px 7px; border-radius:10px;
  background:var(--bg3); color:var(--text3);
}
.asset-slot .slot-badge.loaded { background:rgba(76,175,122,0.15); color:var(--green); }
.asset-slot .slot-files { margin-top:5px; }
.slot-file-item {
  display:flex; align-items:center; justify-content:space-between;
  padding:3px 0; border-bottom:1px solid var(--border); font-size:11px; color:var(--text);
}
.slot-file-item:last-child { border:none; }
.slot-file-item .fname { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.slot-file-item .remove-btn {
  width:16px; height:16px; border-radius:3px; border:none; background:transparent;
  color:var(--text3); cursor:pointer; font-size:13px; line-height:1; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.slot-file-item .remove-btn:hover { color:var(--red); }
.drop-hint { font-size:10px; color:var(--text3); margin-top:4px; font-style:italic; }
.asset-count { font-size:10px; color:var(--text3); margin-top:2px; }

/* ── Scatter controls ── */
.scatter-row { display:flex; gap:6px; align-items:center; margin-bottom:6px; }
.scatter-row label { font-size:11px; color:var(--text2); flex:1; }
.scatter-row input[type=number] {
  width:58px; background:var(--bg2); border:1px solid var(--border); border-radius:3px;
  color:var(--text); padding:3px 6px; font-size:12px; text-align:right;
}

/* ── Viewport ── */
#viewport { flex:1; position:relative; overflow:hidden; background:#000; }
#game-canvas { display:block; width:100%; height:100%; }

/* ── Overlay (start screen inside viewport) ── */
#game-overlay {
  position:absolute; inset:0; background:rgba(13,21,32,0.92);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  z-index:50;
}
#game-overlay h2 { font-size:2rem; font-weight:200; letter-spacing:0.2em; text-transform:uppercase; color:#e8f4ff; margin-bottom:0.4rem; }
#game-overlay p { color:var(--text2); margin-bottom:1.5rem; font-size:0.85rem; }
#play-btn {
  padding:10px 36px; font-size:14px; letter-spacing:0.1em; text-transform:uppercase;
  background:var(--accent); border:none; border-radius:var(--radius); color:#fff; cursor:pointer;
  transition:filter 0.15s;
}
#play-btn:hover { filter:brightness(1.15); }

/* ── HUD ── */
#hud {
  position:absolute; bottom:14px; left:50%; transform:translateX(-50%);
  color:rgba(200,220,255,0.4); font-size:11px; letter-spacing:0.1em; text-transform:uppercase;
  pointer-events:none; z-index:10;
}
#crosshair {
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  pointer-events:none; display:none; z-index:10;
}
#crosshair::before,#crosshair::after { content:''; position:absolute; background:rgba(255,255,255,0.5); }
#crosshair::before { width:14px; height:1px; top:0; left:-7px; }
#crosshair::after  { width:1px; height:14px; top:-7px; left:0; }

/* ── Status bar ── */
#statusbar {
  height:24px; background:var(--bg1); border-top:1px solid var(--border);
  display:flex; align-items:center; padding:0 12px; gap:16px;
  font-size:11px; color:var(--text3); flex-shrink:0;
}
#statusbar .dot { width:6px; height:6px; border-radius:50%; background:var(--green); display:inline-block; margin-right:5px; }
#statusbar .dot.inactive { background:var(--text3); }
</style>
</head>
<body>

<!-- Top bar -->
<div id="topbar">
  <div class="logo">Snow<span>Walker</span> Engine</div>
  <button class="tab-btn active" data-tab="settings">Settings</button>
  <button class="tab-btn" data-tab="assets">Assets</button>
  <button class="tab-btn" data-tab="scatter">Scatter</button>
</div>

<!-- Main -->
<div id="main">

  <!-- Sidebar -->
  <div id="sidebar">
    <div id="sidebar-scroll">

      <!-- SETTINGS TAB -->
      <div id="tab-settings">
        <div class="section">
          <div class="section-title">Movement</div>
          <div class="field">
            <label>Walk Speed</label>
            <div class="field-row">
              <input type="range" id="s-walkSpeed" min="1" max="20" step="0.1" value="4.5">
              <span class="val" id="v-walkSpeed">4.5</span>
            </div>
          </div>
          <div class="field">
            <label>Run Speed</label>
            <div class="field-row">
              <input type="range" id="s-runSpeed" min="2" max="40" step="0.5" value="9">
              <span class="val" id="v-runSpeed">9.0</span>
            </div>
          </div>
          <div class="field">
            <label>Mouse Sensitivity</label>
            <div class="field-row">
              <input type="range" id="s-mouseSensitivity" min="0.5" max="8" step="0.1" value="2.2">
              <span class="val" id="v-mouseSensitivity">2.2</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Camera</div>
          <div class="field">
            <label>Field of View</label>
            <div class="field-row">
              <input type="range" id="s-fov" min="40" max="120" step="1" value="72">
              <span class="val" id="v-fov">72°</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Environment</div>
          <div class="field">
            <label>Fog Density</label>
            <div class="field-row">
              <input type="range" id="s-fogDensity" min="0" max="0.08" step="0.001" value="0.020">
              <span class="val" id="v-fogDensity">0.020</span>
            </div>
          </div>
          <div class="field">
            <label>Snow Intensity</label>
            <div class="field-row">
              <input type="range" id="s-snowIntensity" min="0" max="8000" step="100" value="3500">
              <span class="val" id="v-snowIntensity">3500</span>
            </div>
          </div>
          <div class="field">
            <label>Sky / Fog Color</label>
            <div class="field-row">
              <input type="color" id="s-skyColor" value="#c8ddf0">
              <span style="font-size:11px;color:var(--text2);">Sky &amp; fog tint</span>
            </div>
          </div>
        </div>

        <button class="btn" id="btn-save">Save Settings</button>
        <div style="height:6px"></div>
        <button class="btn danger" id="btn-reset">Reset to Defaults</button>
      </div>

      <!-- ASSETS TAB -->
      <div id="tab-assets" style="display:none">
        <div class="section">
          <div class="section-title">Terrain / Ground</div>
          <div class="asset-slot" id="slot-terrain" data-slot="terrain">
            <div class="slot-header">
              <span class="slot-label">Ground Scene</span>
              <span class="slot-badge" id="badge-terrain">Empty</span>
            </div>
            <div class="slot-files" id="files-terrain"></div>
            <div class="drop-hint">Click or drag a .glb file here</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Trees</div>
          <div class="asset-slot" id="slot-trees" data-slot="trees">
            <div class="slot-header">
              <span class="slot-label">Tree Models</span>
              <span class="slot-badge" id="badge-trees">Empty</span>
            </div>
            <div class="slot-files" id="files-trees"></div>
            <div class="drop-hint">Click or drag .glb files (multiple ok)</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Bushes</div>
          <div class="asset-slot" id="slot-bushes" data-slot="bushes">
            <div class="slot-header">
              <span class="slot-label">Bush Models</span>
              <span class="slot-badge" id="badge-bushes">Empty</span>
            </div>
            <div class="slot-files" id="files-bushes"></div>
            <div class="drop-hint">Click or drag .glb files (multiple ok)</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Stumps</div>
          <div class="asset-slot" id="slot-stumps" data-slot="stumps">
            <div class="slot-header">
              <span class="slot-label">Stump Models</span>
              <span class="slot-badge" id="badge-stumps">Empty</span>
            </div>
            <div class="slot-files" id="files-stumps"></div>
            <div class="drop-hint">Click or drag .glb files (multiple ok)</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Misc Objects</div>
          <div class="asset-slot" id="slot-misc" data-slot="misc">
            <div class="slot-header">
              <span class="slot-label">Other Props</span>
              <span class="slot-badge" id="badge-misc">Empty</span>
            </div>
            <div class="slot-files" id="files-misc"></div>
            <div class="drop-hint">Click or drag .glb files (multiple ok)</div>
          </div>
        </div>

        <button class="btn" id="btn-reload">Reload Scene</button>
      </div>

      <!-- SCATTER TAB -->
      <div id="tab-scatter" style="display:none">
        <div class="section">
          <div class="section-title">Tree Scatter</div>
          <div class="scatter-row">
            <label>Count</label>
            <input type="number" id="sc-treeCount" value="110" min="0" max="500">
          </div>
          <div class="scatter-row">
            <label>Min Distance</label>
            <input type="number" id="sc-treeMinDist" value="12" min="0" max="100">
          </div>
          <div class="scatter-row">
            <label>Max Distance</label>
            <input type="number" id="sc-treeMaxDist" value="130" min="10" max="300">
          </div>
          <div class="scatter-row">
            <label>Min Scale</label>
            <input type="number" id="sc-treeMinScale" value="6" min="0.1" max="50" step="0.1">
          </div>
          <div class="scatter-row">
            <label>Max Scale</label>
            <input type="number" id="sc-treeMaxScale" value="10" min="0.1" max="50" step="0.1">
          </div>
        </div>

        <div class="section">
          <div class="section-title">Bush Scatter</div>
          <div class="scatter-row">
            <label>Count</label>
            <input type="number" id="sc-bushCount" value="80" min="0" max="500">
          </div>
          <div class="scatter-row">
            <label>Min Distance</label>
            <input type="number" id="sc-bushMinDist" value="8" min="0" max="100">
          </div>
          <div class="scatter-row">
            <label>Max Distance</label>
            <input type="number" id="sc-bushMaxDist" value="120" min="10" max="300">
          </div>
          <div class="scatter-row">
            <label>Min Scale</label>
            <input type="number" id="sc-bushMinScale" value="0.5" min="0.1" max="20" step="0.1">
          </div>
          <div class="scatter-row">
            <label>Max Scale</label>
            <input type="number" id="sc-bushMaxScale" value="1.5" min="0.1" max="20" step="0.1">
          </div>
        </div>

        <div class="section">
          <div class="section-title">Stump Scatter</div>
          <div class="scatter-row">
            <label>Count</label>
            <input type="number" id="sc-stumpCount" value="40" min="0" max="300">
          </div>
          <div class="scatter-row">
            <label>Min Distance</label>
            <input type="number" id="sc-stumpMinDist" value="10" min="0" max="100">
          </div>
          <div class="scatter-row">
            <label>Max Distance</label>
            <input type="number" id="sc-stumpMaxDist" value="100" min="10" max="300">
          </div>
          <div class="scatter-row">
            <label>Scale (height)</label>
            <input type="number" id="sc-stumpScale" value="0.6" min="0.1" max="5" step="0.1">
          </div>
        </div>

        <div class="section">
          <div class="section-title">Misc Scatter</div>
          <div class="scatter-row">
            <label>Count</label>
            <input type="number" id="sc-miscCount" value="20" min="0" max="300">
          </div>
          <div class="scatter-row">
            <label>Max Distance</label>
            <input type="number" id="sc-miscMaxDist" value="100" min="10" max="300">
          </div>
        </div>

        <button class="btn" id="btn-scatter-apply">Apply &amp; Reload Scene</button>
      </div>

    </div>

    <!-- Launch button always at bottom -->
    <div style="padding:10px 12px; border-top:1px solid var(--border); flex-shrink:0;">
      <button class="btn launch" id="btn-launch">▶ Play</button>
    </div>
  </div>

  <!-- Viewport -->
  <div id="viewport">
    <canvas id="game-canvas"></canvas>
    <div id="game-overlay">
      <h2>Snow Walker</h2>
      <p>Configure settings and assets in the panel, then press Play</p>
      <button id="play-btn">Enter Scene</button>
    </div>
    <div id="crosshair"></div>
    <div id="hud" style="display:none">WASD · Move &nbsp;|&nbsp; Mouse · Look &nbsp;|&nbsp; Shift · Run &nbsp;|&nbsp; ESC · Pause</div>
  </div>

</div>

<div id="statusbar">
  <span><span class="dot inactive" id="dot-status"></span><span id="status-text">Ready</span></span>
  <span id="status-assets">No assets loaded</span>
  <span style="margin-left:auto" id="status-pos">–</span>
</div>

<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/DRACOLoader.js"></script>
<script src="editor.js"></script>
<script src="game.js"></script>
</body>
</html>
