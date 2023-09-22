const information = document.getElementById("info");
const btn_share = document.getElementById("btn_share");
const stop_btn = document.getElementById("stop");
const hyperCoreId = document.getElementById("hyperCoreId");
const remoteHostKey = document.getElementById("remoteHostKey");
const startRemoteViewer = document.getElementById("redirectToViwer");
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;

const redirectToViwer = () => {
  startRemoteHostConnection(remoteHostKey.value);
};

btn_share.addEventListener("click", async () =>
  window.versions.startHostDesktop()
);

startRemoteViewer.addEventListener("click", () => redirectToViwer());

const startRemoteHostConnection = (remoteId) => {
  console.log("remoteId", remoteId);
  window.versions.connetToRemoteHost(`${remoteId}`, "remoteVideoPlayer");
};
