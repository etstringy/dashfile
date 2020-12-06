import { BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import { ipcMain } from "electron";

function GJ_AutoUpdater(window: BrowserWindow): void {
  window.once("ready-to-show", () => {
    autoUpdater.checkForUpdatesAndNotify;
  });

  autoUpdater.on("update-available", () => {
    ipcMain.emit("update_notification");
  });
  autoUpdater.on("update-downloaded", () => {
    ipcMain.emit("update_notification");
  });
}

export default GJ_AutoUpdater;
