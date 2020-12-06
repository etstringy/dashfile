/* eslint-disable */
const { ipcRenderer } = require("electron");
const shell = require("electron").shell;
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
      songid: "",
      songtext: "",
      time: false,
    };

    let subkeyi = 0;
    let namei = 0;

    levelobject.elements.forEach((subkey) => {
      if (subkey.elements) {
        if (subkey.elements[0].text == "k2") {
          level.name = levelobject.elements[subkeyi + 1].elements[0].text;
        }
        if (subkey.elements[0].text == "k45") {
          level.songid = levelobject.elements[subkeyi + 1].elements[0].text;
        }
        if (subkey.elements[0].text == "k80") {
          level.time = levelobject.elements[subkeyi + 1].elements[0].text;
        }
      }
      subkeyi++;
    });

    if (!level.songid) {
      level.songid = "Unknown";
      level.songtext = "Unknown";
    } else {
      level.songtext = `<a href="javascript:openLink('https://newgrounds.com/audio/listen/${level.songid}')">${level.songid}</a>`;
    }

    $("#createFileTable").append(`
        <tr>
        <td>${level.name}</td>
        <td>${level.time ? level.time.toHHMMSS() : "00:00:00"}</td>
        <td>${level.songtext}</td>
        <td><button class="btn-gren" onclick="createFile(${levelIndex})">Create file</button></td>
        </tr>
    `);
  });
  console.log(levels[0]);

  window.LocalLevels = LocalLevels;
  window.levels = levels;
};

async function createFile(i) {
  await ipcRenderer.invoke(
    "GJ_MakeDashFile",
    btoa(
      JSON.stringify({
        declaration: {
          attributes: {
            version: "1.0",
          },
        },
        elements: window.levels[i],
      })
    )
  );
}

async function injectFile() {
  await ipcRenderer.invoke("GJ_InjectDashFile");
}

async function showCreator() {
  $(".gj_container_main").hide();
  $(".gj_container_createFile").show();
}

async function hideCreator() {
  $(".gj_container_main").show();
  $(".gj_container_createFile").hide();
}

async function openLink(url) {
  shell.openExternal(url);
}

String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
};
