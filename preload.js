const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getWindowsEditions: () => ipcRenderer.invoke('get-windows-editions'),
  detectWindowsInfo: () => ipcRenderer.invoke('detect-windows-info'),
  activateWindows: (data) => ipcRenderer.invoke('activate-windows', data),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window')
});