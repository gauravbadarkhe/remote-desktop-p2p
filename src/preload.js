// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

const P2PUtils = require("./core/p2pUtils");
const { CODECS } = require("./core/constnats");
const RoomUtils = require("./core/RoomUtils");
const StreamHandler = require("./core/streamHanderler");
const VideoRenderer = require("./core/videoRenderer");

// let outvid = fs.createWriteStream(`./out-stream/bbb.webm`);
const chunks = [];
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

ipcRenderer.on("CONNECT_TO_HOST", async (event, remoteId) => {
  connectToHost(remoteId);
});

async function connectToHost(remoteId) {
  const video = document.querySelector("video");
  const videoBuffer = await new VideoRenderer(video).getSourceBuffer();

  const reciver = new RoomUtils();
  reciver.start();
  await reciver.initRoom(remoteId);

  reciver.on("data", ({ name, data }) => {
    if (!videoBuffer.updating) {
      // handelDelayedStream(data.toString(), videoBuffer);
      videoBuffer.appendBuffer(data);
    }
  });
}

// // Make this as a pure broadcaster
ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
  console.log("Set Source");

  const sednderRoomUtils = new RoomUtils();
  const roomId = await sednderRoomUtils.initRoom();
  sednderRoomUtils.start();
  console.log(`Joined Room ${roomId}`);
  const streamHandeler = new StreamHandler(sourceId);
  const video = document.getElementById("remoteVideo");

  const videoBuffer = await new VideoRenderer(video).getSourceBuffer();

  const reciver = new RoomUtils();
  reciver.start();
  await reciver.initRoom(roomId);

  reciver.on("data", ({ name, data }) => {
    if (!videoBuffer.updating) {
      // handelDelayedStream(data.toString(), videoBuffer);
      videoBuffer.appendBuffer(data);
    }
  });

  const stream = await streamHandeler.CREATE_STREAM(async (newData) => {
    // console.log("New Data", newData);
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      sednderRoomUtils.sendDataToAllConnections(Buffer.from(fileReader.result));
    };
    fileReader.readAsArrayBuffer(newData);
  });

  const localVideo = document.getElementById("localVideo");
  localVideo.srcObject = stream;

  streamHandeler.START(500);
});

async function handelDelayedStream(base64encoding, videoSource) {
  // videoSource.appendBuffer(base64encoding);
  const buffer = Buffer.from(base64encoding, "base64");
  const blob = new Blob([buffer], { type: CODECS });
  const fileReader = new FileReader();
  fileReader.onloadend = () => videoSource.appendBuffer(fileReader.result);

  fileReader.readAsArrayBuffer(blob);
}
