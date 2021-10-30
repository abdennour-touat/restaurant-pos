const { autoUpdater } = require("electron-updater");

const Store = require("electron-store");
Store.initRenderer();

const server = require("./server");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
require("@electron/remote/main").initialize();
const contextMenu = require("electron-context-menu");
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    // width: 1366,
    // height: 768,
    // minWidth: 100,
    // minHeight: 750,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: true,
      contextIsolation: false,
    },
  });
  mainWindow.removeMenu();
  mainWindow.maximize();
  mainWindow.show();
  require("@electron/remote/main").enable(mainWindow.webContents);
  mainWindow.webContents.openDevTools();

  mainWindow.loadURL(`file://${path.join(__dirname, "index.html")}`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  // autoUpdater.checkForUpdatesAndNotify();
  mainWindow.once("ready-to-show", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// mainWindow.once('ready-to-show', () => {
//     electron.protocol.interceptFileProtocol('file', (request, callback) => {
//         const filePath = request.url.replace('file://', '');
//         const url = request.url.includes('assets/') ? path.normalize(`${__dirname}/${filePath}`) : filePath;

//         callback({ path: url });
//         console.log(url)
//     }, err => {
//         if (err) console.error('Failed to register protocol');
//     });
// });

ipcMain.on("app-quit", (evt, arg) => {
  app.quit();
});

ipcMain.on("app-reload", (event, arg) => {
  mainWindow.reload();
});

ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
  console.log(app.getVersion());
});

contextMenu({
  prepend: (params, browserWindow) => [
    {
      label: "Reload",
      click() {
        mainWindow.reload();
      },
      // },
      // {  label: 'Quit',  click:  function(){
      //    mainWindow.destroy();
      //     mainWindow.quit();
      // }
    },
  ],
});

autoUpdater.on("update-available", () => {
  mainWindow.webContents.send("update_available");
});
autoUpdater.on("update-downloaded", () => {
  mainWindow.webContents.send("update_downloaded");
});
ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});
