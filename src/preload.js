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
const { CODECS } = require("./core/constnats");

// let outvid = fs.createWriteStream(`./out-stream/bbb.webm`);
const chunks = [];
let remoteConnection;
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

// Make this as a pure broadcaster
ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
  console.log("SET_SOURCE");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720,
        },
      },
    });
    const video = document.querySelector("video");
    const mediaSource = new MediaSource();
    video.src = URL.createObjectURL(mediaSource);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: CODECS,
    });

    const holePunchUtil = new HolePunchUtil();

    mediaSource.addEventListener(
      "sourceopen",
      async (e) => {
        console.log("mediaSource.sourceopen");

        const coreKey = await holePunchUtil.START_HYPER_CORE(() => {});

        const p = document.getElementById("hyperCoreId");
        console.log(p);
        p.innerHTML += coreKey;

        const videoBuffer = mediaSource.addSourceBuffer(CODECS);
        mediaRecorder.ondataavailable = async function (event) {
          if (event.data.size > 0) {
            let fileReader = new FileReader();
            let arrayBuffer;
            fileReader.onloadend = () => {
              arrayBuffer = fileReader.result;
              const encodedToBase64 =
                Buffer.from(arrayBuffer).toString("base64");
              // videoBuffer.appendBuffer(arrayBuffer);
              // handelDelayedStream(videoBuffer, encodedToBase64);
              console.log("Data In");
              holePunchUtil.SEND_DATA(encodedToBase64);
            };
            fileReader.readAsArrayBuffer(event.data);
          }
        };

        mediaRecorder.start();

        setInterval(() => {
          mediaRecorder.requestData();
        }, 100);

        await handelDelayedStream(coreKey, videoBuffer);
      },
      false
    );

    mediaRecorder.onerror = (err) => console.log("mediaRecorder.onerror", err);
    mediaRecorder.onstart = (s) => console.log("mediaRecorder.onstart", s);
    mediaRecorder.onstop = (ss) => console.log("mediaRecorder.onstop", ss);

    // video.crossOrigin = "anonymous";
    // video.src = URL.createObjectURL(mediaSource);
    // await video.play();
  } catch (e) {
    console.error(e);
  }
});

async function handelDelayedStream(hypercorekey, videoSource) {
  await new HolePunchUtil().CONNECT_TO_HYPER_CORE(
    hypercorekey,
    (base64encoding) => {
      // videoSource.appendBuffer(base64encoding)
      const buffer = Buffer.from(base64encoding, "base64");
      const blob = new Blob([buffer], { type: CODECS });
      const fileReader = new FileReader();
      fileReader.onloadend = () => videoSource.appendBuffer(fileReader.result);

      fileReader.readAsArrayBuffer(blob);
    }
  );
}
