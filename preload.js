const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('ghostype', {
  askText: prompt => ipcRenderer.invoke('ask-text', prompt),
  askScreen: prompt => ipcRenderer.invoke('ask-screen', prompt),
  hide: () => ipcRenderer.invoke('hide-window'),
  show: () => ipcRenderer.invoke('show-window')
});
