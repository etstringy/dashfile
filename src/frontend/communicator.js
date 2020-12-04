/* eslint-disable */
const { ipcRenderer, remote } = require("electron");
window.$ = window.jQuery = require("jquery");

function showPage() {
  $(".gj_main").show();
  $(".gj_spinner").hide();
}

window.onload = async () => {
  console.log("Dashfile");
  setTimeout(showPage, 2500);

  // App Version
  let AppVersion = await ipcRenderer.invoke("GJ_AppVersion");
  $(".gj_main_title_text").html(`v${AppVersion} by etstringy`);

  // [TEST] Get File
  let LocalLevels = await ipcRenderer.invoke("GJ_GetLevelFile");
  LocalLevels = JSON.parse(LocalLevels);
  console.log(LocalLevels);

  let rawLevels = LocalLevels.elements[0].elements[0].elements[1].elements;
  let levels = [];

  for (var i = 2; i < rawLevels.length; i++) {
    if (i % 2 != 0) levels.push(rawLevels[i]);
  }

  levels.forEach((levelobject, levelIndex) => {
    let level = {
      name: "",
    };

    let subkeyi = 0;
    let namei = 0;

    levelobject.elements.forEach((subkey) => {
      if (subkey.elements) {
        if (subkey.elements[0].text == "k2") {
          level.name = levelobject.elements[subkeyi + 1].elements[0].text;
        }
      }
      subkeyi++;
    });

    $("#createFileTable").append(`
        <tr>
        <td>${level.name}</td>
        <td><button onclick="createFile(${levelIndex})">Create file</button></td>
        </tr>
    `);
  });
  console.log(levels[0]);

  window.LocalLevels = LocalLevels;
};

async function createFile(i) {
  await ipcRenderer.invoke("GJ_MakeDashFile", {
    declaration: {
      attributes: {
        version: "1.0",
      },
    },
    elements: window.LocalLevels[i],
  });
}
