const {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  Menu,
} = require("electron");
const path = require("path");
require("electron-reload")(path.join(__dirname, "ui/"));

// try {
//   require("electron-reloader")(module, {
//     debug: true,
//     watchRenderer: true,
//   });
// } catch (_) {
//   console.log("Error");
// }

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}
let mainWindow;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, "ui/index.html"));
  mainWindow.loadURL("http://localhost:3000/");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  handleIPCs();
  ipcMain.handle("connetToRemoteHost", (event, remoteId, videoElementId) => {
    console.log(remoteId, videoElementId);
    mainWindow.webContents.send("CONNECT_TO_HOST", remoteId, videoElementId);
  });

  ipcMain.handle("startHostDesktop", () => {
    mainWindow.webContents.send("START_HOST_DESKTOP");
    desktopCapturer.getSources({ types: ["screen"] }).then(async (sources) => {
      // buildSourcesMenu(sources);

      for (const source of sources) {
        console.log(source);
        if (source.name === "Entire screen" || "Screen 1") {
          mainWindow.webContents.send("SET_SOURCE", source.id);
          return;
        }
      }
    });
  });

  // ipcMain.handle("getSourceScreens", () => {
  //   return new Promise((resolve, reject) => {

  //   });
  // });
  createWindow();
});

const buildSourcesMenu = (sources) => {
  const template = [
    {
      label: "Sources",
      submenu: sources.map((source) => {
        return {
          label: source.name,
          id: source.id,
          click: () => mainWindow.webContents.send("SET_SOURCE", source.id),
        };
      }),
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function handleIPCs() {}
