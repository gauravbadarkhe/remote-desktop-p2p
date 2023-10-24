const {
  app,
  session,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  Menu,
} = require("electron");
if (require("electron-squirrel-startup")) app.quit();
const path = require("path");
const isDev = require("electron-is-dev");
const installExtensions = async () => {
  const options = {
    loadExtensionOptions: { allowFileAccess: true },
  };
  installExtension(REACT_DEVELOPER_TOOLS, {
    loadExtensionOptions: {
      allowFileAccess: true,
    },
  });
};

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
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../react-frontend/build/index.html")}`
  );

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// app.whenReady().then(() => {
//   installExtension(
//     [
//       REACT_DEVELOPER_TOOLS,
//       installer.APOLLO_DEVELOPER_TOOLS,
//       installer.REDUX_DEVTOOLS,
//     ],
//     {
//       loadExtensionOptions: { allowFileAccess: true },
//     }
//   )
//     .then((name) => console.log(`Added Extension:  ${name}`))
//     .catch((err) => console.log("An error occurred: ", err));
// });

app.on("ready", async () => {
  handleIPCs(mainWindow);

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
  // await installExtensions();

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

function handleIPCs(mainWindow) {
  ipcMain.handle("newPeerConnection", (event, remoteId) => {
    mainWindow.webContents.send("newPeerConnection", remoteId);
  });

  ipcMain.handle("newData", (event, { remoteId, data }) => {
    mainWindow.webContents.send("newData", { remoteId, data });
  });
}
