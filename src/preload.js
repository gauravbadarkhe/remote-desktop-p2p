// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

const fs = require("fs");
const { log } = require("console");

// let outvid = fs.createWriteStream(`./out-stream/bbb.webm`);
const chunks = [];
let mediaRecorder;

// core.discoveryKey is *not* a read capability for the core
// It's only used to discover other peers who *might* have the core
let videoCallback;
contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"),
  startRecording: () => ipcRenderer.invoke("startRecording"),
  stopRecording: () => ipcRenderer.invoke("stopRecording"),
});

const convertBlobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

const saveRenderVideo = async () => {
  log("saveRenderVideo");
  const blob = new Blob(chunks, {
    type: "video/webm; codecs=vp9",
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  fs.writeFile(`./out-stream/${Date.now()}.webm`, buffer, () =>
    console.log("video saved successfully!")
  );
};

ipcRenderer.on("startRecording", (event, id) => {
  log("startRecording");
  mediaRecorder.start(3000);
});
ipcRenderer.on("stopRecording", () => {
  mediaRecorder.stop();
  saveRenderVideo();
});

ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
  console.log("SET_SOURCE");
  try {
    const video = document.querySelector("video");
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
    // handleStream(stream);

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    mediaRecorder.onerror = (err) => console.log("onerror", err);
    mediaRecorder.onstart = (s) => console.log("onstart", s);
    mediaRecorder.onstop = (ss) => console.log("onstop", ss);

    mediaRecorder.ondataavailable = async function (event) {
      if (event.data.size > 0) {
        chunks.push(event.data);
      } else {
        console.log("Not enough data");
      }
    };

    video.srcObject = stream;
    video.play();
  } catch (e) {
    handleError(e);
  }
});

function handleStream(stream) {
  video.srcObject = stream;
  video.onloadedmetadata = (e) => video.play();
}

function handleError(e) {
  console.log(e);
}
