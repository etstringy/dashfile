import { app, BrowserWindow } from "electron";
import path from "path";
import GJ_IPC from "./ipc";
import GJ_AutoUpdater from "./autoupdater";

let window: BrowserWindow;

function init() {
  window = new BrowserWindow({
    height: 600,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
    },
    resizable: false,
  });
  // and load the index.html of the app.
  window.loadFile(path.join(__dirname, "../frontend/index.html"));
}

app.on("ready", () => {
  init();
  GJ_AutoUpdater(window);
});

GJ_IPC();
