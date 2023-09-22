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
const HolePunchUtil = require("./core/holepunchUtil");
const RemoteHostRenderer = require("./core/remoteHostRenderer");

// let outvid = fs.createWriteStream(`./out-stream/bbb.webm`);
const chunks = [];
let remoteConnection;
const holePunchUtil = new HolePunchUtil();
let streamHandler;
let remoteHostRenderer;
contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  getSourceScreens: async () => await ipcRenderer.invoke("getSourceScreens"),
  startHostDesktop: () => ipcRenderer.invoke("startHostDesktop"),

  startRecording: () => ipcRenderer.invoke("startRecording"),
  stopRecording: () => ipcRenderer.invoke("stopRecording"),
  connetToRemoteHost: (remoteHostId, videoElementId) => {
    console.log(remoteHostId, videoElementId);
    ipcRenderer.invoke("connetToRemoteHost", remoteHostId, videoElementId);
  },
});

ipcRenderer.on("startRecording", (event, id) => {
  streamHandler.START(100);
});
ipcRenderer.on("stopRecording", async () => {
  await streamHandler.DESTORY();
  streamHandler = null;
});

ipcRenderer.on("START_HOST_DESKTOP", async () => {
  const hyperCoreKey = await holePunchUtil.START_HYPER_CORE((conn) => {
    remoteConnection = conn;
  });
  const p = document.getElementById("hyperCoreId");
  console.log(p);
  p.innerHTML += hyperCoreKey;
});

// Make this as a reciver
ipcRenderer.on(
  "CONNECT_TO_HOST",
  async (event, remoteHostKey, videoElementId) => {
    console.log("CONNECT_TO_HOST", remoteHostKey, videoElementId);
    remoteHostRenderer = new RemoteHostRenderer(
      videoElementId,
      async (sourceBuffer) => {
        await new HolePunchUtil().CONNECT_TO_HYPER_CORE(
          remoteHostKey,
          (block, position) => {
            console.log("New Block", position);
            // remoteHostRenderer.append(sourceBuffer, block);
          }
        );
      }
    );
  }
);

// Make this as a pure broadcaster
ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
  console.log("SET_SOURCE");
  try {
    if (streamHandler) {
      await streamHandler.DESTORY();
    }
    // const video = document.querySelector("video");
    streamHandler = new StreamHandler(sourceId);

    const stream = await streamHandler.CREATE_STREAM(sourceId);

    const mediaSource = await streamHandler.CREATE_MEDIA_RECORDER(
      async (blob) => {
        if (remoteConnection) {
          let arrBuff = await blob.arrayBuffer();
          const encodedToBase64 = Buffer.from(arrBuff).toString("base64");
          // chunks.push(encodedToBase64);

          if (remoteHostRenderer)
            remoteHostRenderer.sourceBuffer.appendBuffer(arrBuff);

          holePunchUtil.hyperCore.append(encodedToBase64);
        } else {
          // console.log("WATING FOR REMOTE CONNECTION.");
        }
      }
    );
    streamHandler.START();

    // video.crossOrigin = "anonymous";
    // video.src = URL.createObjectURL(mediaSource);
    // await video.play();
  } catch (e) {
    console.error(e);
  }
});
