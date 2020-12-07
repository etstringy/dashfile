import { ipcMain, app, dialog } from "electron";
import fs from "fs";
import convert, { Element } from "xml-js";
import Crypto from "./decode";
import { SuccessBox, WriteErrorBox, InvalidDFBox, OpenDialog } from "./boxes";

const crypto: Crypto = new Crypto();
const paths = {
  CCLL: `${app.getPath("home")}/AppData/Local/GeometryDash/CCLocalLevels.dat`,
  BackupCCLL: `${app.getPath("userData")}/Backups/CCLocalLevels.dat`,
  Backup: `${app.getPath("userData")}/Backups`,
};

function GJ_IPC(): void {
  ipcMain.handle("GJ_AppVersion", async () => {
    console.log("[IPC] Recieved GJ_AppVersion");
    return "1.2.2";
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

  // prettier-ignore
  ipcMain.handle("GJ_InjectDashFile", async () => {
    console.log("[IPC] Recieved GJ_InjectDashFile");

    const openPath: string[] | undefined = dialog.showOpenDialogSync(OpenDialog);
    if (openPath == undefined) return "Operation cancelled.";

    let levelData: string | Buffer = fs.readFileSync(openPath[0], "utf8");
    levelData = Buffer.from(levelData, "base64");
    levelData = levelData.toString("ascii");

    let LocalLevels: string = fs.readFileSync(paths.CCLL, "utf8");
    LocalLevels = crypto.decode(LocalLevels);

    // Valid file check
    if (!levelData.startsWith(`{"declaration":{"attributes":{"version":"1.0"}}`)) return dialog.showMessageBox(InvalidDFBox);

    // BACKUP LOCALLEVELS
    console.log("[SAVEFILE] Backing up CCLocalLevels.dat");
    if (!fs.existsSync(paths.Backup)) { fs.mkdirSync(paths.Backup); }
    fs.renameSync(paths.CCLL, paths.BackupCCLL);

    LocalLevels = convert.xml2json(LocalLevels);

    const LLJ: Element = JSON.parse(LocalLevels);
    const toInject: Element = JSON.parse(levelData).elements;

    const LevelsArray = LLJ.elements[0].elements[0].elements[1].elements


    for (let i = 2; i < LevelsArray.length; i++) {
      if (i % 2 == 0) {
        const levelid: string | number | boolean = LevelsArray[i].elements[0].text;
        LevelsArray[i].elements[0].text = parseInt(levelid.toString().split("_")[1]) + 1
      }
    }

    // Add Levelchunk and level to Array
    LevelsArray.splice(2, 0, { type: "element", name: "k", elements: [{ text: "k_0", type: "text" }]});
    LevelsArray.splice(3, 0, toInject);

    const toSave: string = convert.json2xml(JSON.stringify(LLJ));

    try {
      console.log("[SAVEFILE] Writing CCLocalLevels.dat");
      fs.writeFileSync(paths.CCLL, toSave, { encoding: "utf8", flag: "w" });
    } catch { return dialog.showMessageBox(WriteErrorBox); }
    return dialog.showMessageBox(SuccessBox);
  });
  // prettier-ignore-end
}

export default GJ_IPC;
