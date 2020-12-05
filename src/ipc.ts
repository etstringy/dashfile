import { ipcMain, app, dialog } from "electron";
import fs from "fs";
import convert, { Element } from "xml-js";
import Crypto from "./decode";

const crypto: Crypto = new Crypto();

function GJ_IPC(): void {
  ipcMain.handle("GJ_AppVersion", async () => {
    console.log("[IPC] Recieved GJ_AppVersion");
    return "1.2.2";
  });

  ipcMain.handle("GJ_GetLevelFile", async () => {
    console.log("[IPC] Recieved GJ_GetLevelFile");

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

      const levelData: string = args.join();
      const savePath: string | undefined = dialog.showSaveDialogSync({
        title: "Save dash file as",
        filters: [{ name: "Dashfile", extensions: ["dash"] }],
      });

      if (savePath == undefined) return "Operation cancelled.";

      try {
        fs.writeFileSync(savePath, levelData);
      } catch (err) {
        return "Error writing file!";
      }

      return "OK";
    }
  );

  ipcMain.handle(
    "GJ_InjectDashFile",
    async (e: Electron.IpcMainInvokeEvent) => {
      console.log("[IPC] Recieved GJ_InjectDashFile");

      const openPath: string[] | undefined = dialog.showOpenDialogSync({
        title: "Open dash file",
        filters: [{ name: "Dashfile", extensions: ["dash"] }],
      });

      if (openPath == undefined) return "Operation cancelled.";

      let levelData: string | Buffer = fs.readFileSync(openPath[0], "utf8");
      let LocalLevels: string = fs.readFileSync(
        `${app.getPath("home")}/AppData/Local/GeometryDash/CCLocalLevels.dat`,
        "utf8"
      );
      LocalLevels = crypto.decode(LocalLevels);

      // Base64
      levelData = Buffer.from(levelData, "base64");
      levelData = levelData.toString("ascii");

      // Valid file check
      if (
        !levelData.startsWith(`{"declaration":{"attributes":{"version":"1.0"}}`)
      )
        return dialog.showMessageBox({
          message: "Invalid Dash file!",
          type: "error",
          buttons: ["OK"],
          title: "Error!",
        });

      // BACKUP LOCALLEVELS
      console.log("[SAVEFILE] Backing up CCLocalLevels.dat");
      if (!fs.existsSync(`${app.getPath("userData")}/Backups/`)) {
        fs.mkdirSync(`${app.getPath("userData")}/Backups/`);
      }
      fs.renameSync(
        `${app.getPath("home")}/AppData/Local/GeometryDash/CCLocalLevels.dat`,
        `${app.getPath("userData")}/Backups/CCLocalLevels.dat`
      );

      LocalLevels = convert.xml2json(LocalLevels);

      const LLJ: Element = JSON.parse(LocalLevels);
      const toInject: Element = JSON.parse(levelData).elements;

      // fuck you
      if (
        LLJ.elements &&
        LLJ.elements[0].elements &&
        LLJ.elements[0].elements[0].elements &&
        LLJ.elements[0].elements[0].elements[0].elements
      ) {
        // Add Levelchunk and level to Array
        LLJ.elements[0].elements[0].elements[1].elements?.splice(2, 0, {
          elements: [{ text: "k_0", type: "text" }],
          name: "k",
          type: "element",
        });
        LLJ.elements[0].elements[0].elements[1].elements?.splice(
          3,
          0,
          toInject
        );
      }

      const toSave: string = convert.json2xml(JSON.stringify(LLJ));

      try {
        console.log("[SAVEFILE] Writing CCLocalLevels.dat");
        fs.writeFileSync(
          `${app.getPath("home")}/AppData/Local/GeometryDash/CCLocalLevels.dat`,
          toSave,
          { encoding: "utf8", flag: "w" }
        );
      } catch {
        return dialog.showMessageBox({
          message: "Error writing save file!",
          type: "error",
          buttons: ["OK"],
          title: "Error!",
        });
      }

      return dialog.showMessageBox({
        message: "Level added to save file!",
        type: "none",
        buttons: ["OK"],
        title: "Great success!",
      });
    }
  );
}

export default GJ_IPC;
