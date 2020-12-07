import fs from "fs";
import convert, { Element } from "xml-js";
import Crypto from "./decode";
import paths from "./paths";

const crypto: Crypto = new Crypto();

interface InjectStatus {
  status: string;
}

class Inject {
  injectFile(path: string): InjectStatus {
    let levelData: string | Buffer = fs.readFileSync(path, "utf8");
    levelData = Buffer.from(levelData, "base64");
    levelData = levelData.toString("ascii");

    let LocalLevels: string = fs.readFileSync(paths.CCLL, "utf8");
    LocalLevels = crypto.decode(LocalLevels);

    // Valid file check
    if (
      !levelData.startsWith(`{"declaration":{"attributes":{"version":"1.0"}}`)
    )
      return { status: "InvalidFile" };

    // BACKUP LOCALLEVELS
    console.log("[SAVEFILE] Backing up CCLocalLevels.dat");
    if (!fs.existsSync(paths.Backup)) {
      fs.mkdirSync(paths.Backup);
    }
    fs.renameSync(paths.CCLL, paths.BackupCCLL);

    LocalLevels = convert.xml2json(LocalLevels);

    const LLJ: Element = JSON.parse(LocalLevels);
    const toInject: Element = JSON.parse(levelData).elements;

    const LevelsArray = LLJ.elements[0].elements[0].elements[1].elements;

    for (let i = 2; i < LevelsArray.length; i++) {
      if (i % 2 == 0) {
        const levelid: string | number | boolean =
          LevelsArray[i].elements[0].text;
        LevelsArray[i].elements[0].text =
          parseInt(levelid.toString().split("_")[1]) + 1;
      }
    }

    // Add Levelchunk and level to Array
    LevelsArray.splice(2, 0, {
      type: "element",
      name: "k",
      elements: [{ text: "k_0", type: "text" }],
    });
    LevelsArray.splice(3, 0, toInject);

    const toSave: string = convert.json2xml(JSON.stringify(LLJ));

    try {
      console.log("[SAVEFILE] Writing CCLocalLevels.dat");
      fs.writeFileSync(paths.CCLL, toSave, { encoding: "utf8", flag: "w" });
    } catch {
      return { status: "WriteError" };
    }
    return { status: "success" };
  }
}

export { Inject, InjectStatus };
