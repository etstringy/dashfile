import { app } from "electron";

export default {
  CCLL: `${app.getPath("home")}/AppData/Local/GeometryDash/CCLocalLevels.dat`,
  GD: `${app.getPath("home")}/AppData/Local/GeometryDash`,
  BackupCCLL: `${app.getPath("userData")}/Backups/CCLocalLevels.dat`,
  Backup: `${app.getPath("userData")}/Backups`,
};
