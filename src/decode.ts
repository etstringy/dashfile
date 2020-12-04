import zlib from "zlib";

//  -------------------------------------------------------------------
//  STOLEN AND MODIFIED
//  FROM
//  https://github.com/GDColon/GD-Save-Decoder/blob/master/crypto.js
//
//  dont kill me pls colon
//  -------------------------------------------------------------------

export default class Crypto {
  xor(str: string, key: number): string {
    console.log(`[CRYPTO] Running XOR operation with key ${key.toString()}`);
    const strArr = str.split("").map((letter) => letter.charCodeAt(0));
    let res = "";
    for (let i = 0; i < str.length; i++)
      res += String.fromCodePoint(strArr[i] ^ key);
    return res;
  }

  decode(data: string): string {
    console.log("[CRYPTO] Decoding Game File");
    if (data.startsWith('<?xml version="1.0"?>')) return data;
    const decoded = this.xor(data, 11);
    const decodedBuf = Buffer.from(decoded, "base64");
    try {
      return zlib.unzipSync(decodedBuf).toString();
    } catch (e) {
      throw "Error! GD save file seems to be corrupt!";
    }
  }
}
