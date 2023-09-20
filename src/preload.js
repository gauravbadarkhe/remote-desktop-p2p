// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

const fs = require("fs");
const { log, error } = require("console");

const b4a = require("b4a");
const DHT = require("hyperdht");
const Hypercore = require("hypercore");
const Hyperswarm = require("hyperswarm");
const StreamHandler = require("./core/streamHanderler");
const HolePunchUtil = require("./holepunchUtil");

// let outvid = fs.createWriteStream(`./out-stream/bbb.webm`);
const chunks = [];
const holePunchUtil = new HolePunchUtil(() => {});
let streamHandler;

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  getSourceScreens: async () => await ipcRenderer.invoke("getSourceScreens"),
  startHostDesktop: () => ipcRenderer.invoke("startHostDesktop"),
  startRemoteDesktop: (remoteId) =>
    ipcRenderer.invoke("startRemoteDesktop", remoteId),
  startRecording: () => ipcRenderer.invoke("startRecording"),
  stopRecording: () => ipcRenderer.invoke("stopRecording"),
});

ipcRenderer.on("startRecording", (event, id) => {
  streamHandler.START(100);
});
ipcRenderer.on("stopRecording", async () => {
  await streamHandler.DESTORY();
  streamHandler = null;
});

ipcRenderer.on("startHostDesktop", async () => {
  const hyperCOreKey = await holePunchUtil.START_HYPER_CODE();
  const p = document.getElementById("hyperCoreId");
  console.log(p);
  p.innerHTML += hyperCOreKey;
});

ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
  console.log("SET_SOURCE");
  try {
    if (streamHandler) {
      await streamHandler.DESTORY();
    }
    const video = document.querySelector("video");
    streamHandler = new StreamHandler(sourceId);

    const stream = await streamHandler.CREATE_STREAM(sourceId);

    const mediaSource = await streamHandler.CREATE_MEDIA_SOURCE(
      async (sourceBuffer, blob) => {
        let arrBuff = await blob.arrayBuffer();
        const encodedToBase64 = Buffer.from(arrBuff).toString("base64");
        chunks.push(encodedToBase64);
        core.append(encodedToBase64);
        sourceBuffer.appendBuffer(arrBuff);
      }
    );

    video.crossOrigin = "anonymous";
    video.src = URL.createObjectURL(mediaSource);
    await video.play();
  } catch (e) {
    console.error(e);
  }
});
