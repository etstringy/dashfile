import { BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import { ipcMain } from "electron";

function GJ_AutoUpdater(): void {
  autoUpdater.logger = console;
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("update-available", () => {
    ipcMain.emit("update_notification", { available: true });
  });

  autoUpdater.on("update-not-available", () => {
    ipcMain.emit("update_notification", { available: false });
  });

  autoUpdater.on("update-downloaded", () => {
    ipcMain.emit("update_notification", { downloaded: true });
  });

  autoUpdater.on("error", () => {
    ipcMain.emit("update_notification", { error: true });
  });
}

export default GJ_AutoUpdater;
