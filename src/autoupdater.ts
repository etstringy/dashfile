import { BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import { ipcMain } from "electron";

import { window } from "./index";

function GJ_AutoUpdater(): void {
  autoUpdater.logger = console;
  try {
    autoUpdater.checkForUpdatesAndNotify();
  } catch (err) {
    console.log(err);
    window.webContents.send("update_notification", { error: true });
  }

  autoUpdater.on("update-available", () => {
    window.webContents.send("update_notification", { available: true });
  });

  autoUpdater.on("update-not-available", () => {
    window.webContents.send("update_notification", { available: false });
  });

  autoUpdater.on("update-downloaded", () => {
    window.webContents.send("update_notification", { downloaded: true });
  });

  autoUpdater.on("error", () => {
    window.webContents.send("update_notification", { error: true });
  });
}

export default GJ_AutoUpdater;
