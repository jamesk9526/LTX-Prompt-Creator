const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      const validChannels = ['app-version', 'window-minimize', 'window-maximize', 'window-close', 'get-window-state', 'open-chat-window', 'chat-actions', 'close-chat-window'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel, func) => {
      const validChannels = ['app-version', 'window-state', 'chat-actions'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
  },
  windowControl: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    getState: () => new Promise((resolve) => {
      ipcRenderer.once('window-state', resolve);
      ipcRenderer.send('get-window-state');
    }),
    openChatWindow: () => ipcRenderer.send('open-chat-window'),
  },
});
