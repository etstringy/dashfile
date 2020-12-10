import { app, BrowserWindow, dialog } from "electron";
import path from "path";
import GJ_IPC from "./ipc";
import { Inject, InjectStatus } from "./inject";
import { SuccessBox, ErrorBox } from "./boxes";

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

  if (app.isPackaged) window.setMenu(null);
  window.loadFile(path.join(__dirname, "../frontend/index.html"));
}

app.on("ready", async () => {
  if (app.isPackaged) process.argv.unshift(null);

  const params: string[] = process.argv.slice(2);
  const inject = new Inject();

  if (params[0]) {
    const injection: InjectStatus = await inject.injectFile(params[0]);

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
  } else {
    init();
    GJ_IPC();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

export { window };
