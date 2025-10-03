const { contextBridge, ipcRenderer } = require('electron');

// Exponemos métodos protegidos que permiten al proceso renderer usar
// el ipcRenderer sin exponer todo el objeto
contextBridge.exposeInMainWorld('electronAPI', {
  getWindowsEditions: () => ipcRenderer.invoke('get-windows-editions'),
  detectWindowsInfo: () => ipcRenderer.invoke('detect-windows-info'),
  activateWindows: (data) => ipcRenderer.invoke('activate-windows', data),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window')
});