import { ipcMain, dialog } from "electron";
import fs from "fs";
import convert from "xml-js";
import GJ_AutoUpdater from "./autoupdater";
import Crypto from "./decode";
import { Inject, InjectStatus } from "./inject";
import paths from "./paths";
import { OpenDialog, SuccessBox, ErrorBox } from "./boxes";
import { window } from "./index";

const crypto: Crypto = new Crypto();
const inject: Inject = new Inject();

function GJ_IPC(): void {
  ipcMain.handle("GJ_AppVersion", async () => {
    console.log("[IPC] Recieved GJ_AppVersion");

    GJ_AutoUpdater();
    return { version: "1.7.0", paths };
  });

  ipcMain.handle("GJ_GetLevelFile", async () => {
    console.log("[IPC] Recieved GJ_GetLevelFile");

    try {
      let LocalLevels: string = fs.readFileSync(paths.CCLL, "utf8");
      LocalLevels = crypto.decode(LocalLevels);
      LocalLevels = convert.xml2json(LocalLevels);
      return LocalLevels;
    } catch {
      return "FileError";
    }
  });

  ipcMain.handle(
    "GJ_MakeDashFile",
    async (e: Electron.IpcMainInvokeEvent, ...args) => {
      console.log("[IPC] Recieved GJ_MakeDashFile");

      window.webContents.send("show_modal", "Creating level file..");

      const levelData: string = args.join();
      const savePath: string | undefined = dialog.showSaveDialogSync({
        title: "Save dash file as",
        filters: [{ name: "Dashfile", extensions: ["dash"] }],
      });

      if (savePath == undefined) return window.webContents.send("hide_modal");

      try {
        fs.writeFileSync(savePath, levelData);
      } catch (err) {
        return "Error writing file!";
      }

      window.webContents.send("hide_modal");
      return "OK";
    }
  );

  // prettier-ignore
  ipcMain.handle("GJ_InjectDashFile", async () => {
    console.log("[IPC] Recieved GJ_InjectDashFile");

    const openPath: string[] | undefined = dialog.showOpenDialogSync(OpenDialog);
    if (openPath == undefined) return window.webContents.send("hide_modal");

    window.webContents.send("show_modal", "Injecting level into game save..");
    const injection: InjectStatus = await inject.injectFile(openPath[0])
    window.webContents.send("hide_modal");

    switch (injection.status) {
      case "success":
        dialog.showMessageBox(SuccessBox);
        break;
      case "WriteError":
        dialog.showMessageBox(ErrorBox("Error writing dash file"));
        break;
      case "InvalidFile":
        dialog.showMessageBox(ErrorBox("Invalid/Corrupt dash file"));
        break;
      case "ReadError_Dash":
        dialog.showMessageBox(ErrorBox("Error reading dash file"));
        break;
      case "ReadError_CCLL":
        dialog.showMessageBox(ErrorBox("Error reading GD save file"));
        break;
      case "BackupError":
        dialog.showMessageBox(ErrorBox("Error backing up GD save file"));
        break;
    }
  });
  // prettier-ignore-end
}

export default GJ_IPC;
