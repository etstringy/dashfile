import { ipcMain, app, dialog } from "electron";
import fs from "fs";
import convert from "xml-js";

import Crypto from "./decode";

function GJ_IPC(): void {
  ipcMain.handle("GJ_AppVersion", async (e: Electron.IpcMainInvokeEvent) => {
    console.log("[IPC] Recieved GJ_AppVersion");
    return "1.2.2";
  });

  ipcMain.handle("GJ_GetLevelFile", async (e: Electron.IpcMainInvokeEvent) => {
    console.log("[IPC] Recieved GJ_GetLevelFile");

    const crypto: Crypto = new Crypto();
    let LocalLevels: string = fs.readFileSync(
      `${app.getPath("home")}/AppData/Local/GeometryDash/CCLocalLevels.dat`,
      "utf8"
    );

    LocalLevels = crypto.decode(LocalLevels);
    LocalLevels = convert.xml2json(LocalLevels);
    return LocalLevels;
  });

  ipcMain.handle(
    "GJ_MakeDashFile",
    async (e: Electron.IpcMainInvokeEvent, ...args) => {
      console.log("[IPC] Recieved GJ_MakeDashFile");

      const levelDataJSON: JSON = args[0];
      const levelDataXML: string = convert.json2xml(
        JSON.stringify(levelDataJSON)
      );

      const savePath: string | undefined = dialog.showSaveDialogSync({
        title: "Save dash file as",
      });

      if (savePath == undefined) return "Operation cancelled.";

      try {
        fs.writeFileSync(savePath, levelDataXML);
      } catch (err) {
        return "Error writing file!";
      }

      return "OK";
    }
  );
}

export default GJ_IPC;
