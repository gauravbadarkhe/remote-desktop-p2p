// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

const P2PUtils = require("./core/p2pUtils");
const { CODECS } = require("./core/constnats");
const RoomUtils = require("./core/RoomUtils");
const StreamHandler = require("./core/streamHanderler");
const VideoRenderer = require("./core/videoRenderer");

// let outvid = fs.createWriteStream(`./out-stream/bbb.webm`);
const currectPeers = {};
const chunks = [];
let Room = new RoomUtils();

contextBridge.exposeInMainWorld("bridge", {
  // InitRoom

  leaveRoom: () => leaveRoom(),
  sendData: (data) => sendData(data),
  // newData: (callback) => listenToData(callback),
  // newPeerConnection: (callback) => listenToConnection(callback),
  Room_Init: (roomId, newPeerConnection, newData) =>
    initRoom(roomId, newPeerConnection, newData),
});

// contextBridge.exposeInMainWorld("versions", {
//   node: () => process.versions.node,
//   chrome: () => process.versions.chrome,
//   electron: () => process.versions.electron,
//   getSourceScreens: async () => await ipcRenderer.invoke("getSourceScreens"),
//   startHostDesktop: () => ipcRenderer.invoke("startHostDesktop"),

//   startRecording: () => ipcRenderer.invoke("startRecording"),
//   stopRecording: () => ipcRenderer.invoke("stopRecording"),
//   connetToRemoteHost: (remoteHostId, videoElementId) => {
//     console.log(remoteHostId, videoElementId);
//     ipcRenderer.invoke("connetToRemoteHost", remoteHostId, videoElementId);
//   },
// });

ipcRenderer.on("CONNECT_TO_HOST", async (event, remoteId) => {
  connectToHost(remoteId);
});

function sendData(data) {
  if (Room.conns?.length > 0) {
    Room.sendDataToAllConnections(data);
  }
}

function leaveRoom() {
  Room.closeRoom();
  Room = new RoomUtils();
}

function listenToConnection(callback) {
  Room.on("newconnection", async (remoteId, conn) => {
    console.log("New Connection");

    callback(remoteId);
  });
}

function listenToData(callback) {
  Room.on("data", ({ remoteId, data }) => {
    // console.log("Data", data.toString());
    callback({ remoteId: remoteId, data: data });
  });
}
async function initRoom(roomId, newPeerCallback, newDataCallback) {
  try {
    if (Room) leaveRoom();
    Room = new RoomUtils();
    listenToConnection(newPeerCallback);
    listenToData(newDataCallback);
    Room.initEvents();
    const _roomId = await Room.initRoom(roomId);
    return _roomId;
  } catch (error) {
    console.error(error);
    return;
  }
}

async function connectToHost(remoteId) {
  const video = document.querySelector("video");
  const videRenderer = await new VideoRenderer("gallery");

  const reciver = new RoomUtils();
  reciver.initEvents();
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
  sednderRoomUtils.initEvents();
  const roomId = await sednderRoomUtils.initRoom();

  console.log(`Joined Room ${roomId}`);
  const streamHandeler = new StreamHandler();
  const videoRenderer = await new VideoRenderer("gallery");
  sednderRoomUtils.on("newconnection", async (remoteId) => {
    console.log("New Connection");

    await videoRenderer.addNewVideoStream(remoteId);

    sednderRoomUtils.on("data", ({ remoteId, data }) => {
      console.log("Data", data.toString());
      videoRenderer.onPeerVideoUpdate(remoteId, data);
    });
  });

  // const video = document.getElementById("remoteVideo");

  // const videoBuffer = await new VideoRenderer(video).getSourceBuffer();

  // const reciver = new RoomUtils();
  // reciver.initEvents();
  // await reciver.initRoom(roomId);

  // reciver.on("data", ({ name, data }) => {
  //   if (!videoBuffer.updating) {
  //     // handelDelayedStream(data.toString(), videoBuffer);
  //     videoBuffer.appendBuffer(data);
  //   }
  // });

  await videoRenderer.addNewVideoStream("local_stream", true);
  const stream = await streamHandeler.CREATE_STREAM(async (newData) => {
    // console.log("New Data", newData);
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      // videoRenderer.onPeerVideoUpdate("local_stream", fileReader.result);
      sednderRoomUtils.sendDataToAllConnections(Buffer.from(fileReader.result));
    };
    fileReader.readAsArrayBuffer(newData);
  });
  videoRenderer.attachLocalStream("local_stream", stream);

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
