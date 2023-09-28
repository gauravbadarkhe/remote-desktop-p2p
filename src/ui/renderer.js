const information = document.getElementById("info");
const btn_share = document.getElementById("btn_share");
const stop_btn = document.getElementById("stop");
const hyperCoreId = document.getElementById("hyperCoreId");
const remoteHostKey = document.getElementById("remoteHostKey");
const startRemoteViewer = document.getElementById("redirectToViwer");
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;

const redirectToViwer = () => {
  window.location.href = "chrome://media-internals/"; //"./viewer.html?remoteId=" + remoteHostKey.value;
};

btn_share.addEventListener("click", async () =>
  window.versions.startHostDesktop()
);

const startRemoteHostConnection = () => {
  console.log("remoteId", remoteHostKey.value);
  window.versions.connetToRemoteHost(remoteHostKey.value, "remoteVideoPlayer");
};

startRemoteViewer.addEventListener("click", () => redirectToViwer());
