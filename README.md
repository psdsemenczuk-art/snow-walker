const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('engine', {
  getConfig:      ()       => ipcRenderer.invoke('get-config'),
  saveConfig:     (cfg)    => ipcRenderer.invoke('save-config', cfg),
  resetConfig:    ()       => ipcRenderer.invoke('reset-config'),
  pickAssetFile:  (slot)   => ipcRenderer.invoke('pick-asset-file', slot),
  getAssetUrl:    (p)      => ipcRenderer.invoke('get-asset-url', p),
  fileExists:     (p)      => ipcRenderer.invoke('file-exists', p),
  getFilename:    (p)      => ipcRenderer.invoke('get-filename', p),
});
