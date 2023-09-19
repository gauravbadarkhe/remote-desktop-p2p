// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

const goodbye = require("graceful-goodbye");
const b4a = require("b4a");
const DHT = require("hyperdht");
const Hypercore = require("hypercore");
const Hyperswarm = require("hyperswarm");

let _conn;
const swarm = new Hyperswarm();
goodbye(() => swarm.destroy());

const core = new Hypercore("./writer-storage");

// core.key and core.discoveryKey will only be set after core.ready resolves
core.ready().then(() => {
  console.log("hypercore key:", b4a.toString(core.key, "hex"));

  // Append all stdin data as separate blocks to the core
  process.stdin.on("data", (data) => core.append(data));
  swarm.join(core.discoveryKey);
  swarm.on("connection", (conn) => {
    console.log("New Connection");
    _conn = conn;

    core.replicate(conn);

    // setInterval(() => {
    //   console.log("Neww");
    //   core.append("New Entry");
    // }, 5000);
  });
});

// core.discoveryKey is *not* a read capability for the core
// It's only used to discover other peers who *might* have the core

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"),
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

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.onerror = (err) => console.log("onerror", err);
    mediaRecorder.onstart = (s) => console.log("onstart", s);
    mediaRecorder.onstop = (ss) => console.log("onstop", ss);

    mediaRecorder.ondataavailable = async function (event) {
      if (event.data.size > 0) {
        if (_conn) {
          // let data = String.fromCharCode(
          //   ...new Uint8Array(await event.data.arrayBuffer())
          // );
          // _conn.write(data);
          core.append(await event.data.arrayBuffer());
          console.log("writign to conn", await event.data.arrayBuffer());
        }
      } else {
        console.log("Not enough data");
      }
    };

    video.srcObject = stream;
    video.play();
    mediaRecorder.start(2000);
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
