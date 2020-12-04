import { app, BrowserWindow } from 'electron';
import path from 'path';
import GJ_IPC from './ipc';

function init() {
  const window = new BrowserWindow({
    height: 800,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
    },
    resizable: false,
  });
  // and load the index.html of the app.
  window.loadFile(path.join(__dirname, './frontend/index.html'));
}

app.on('ready', () => {
  init();
});

GJ_IPC();
