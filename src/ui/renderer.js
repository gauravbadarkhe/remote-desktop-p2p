const information = document.getElementById("info");
const start_btn = document.getElementById("start");
const stop_btn = document.getElementById("stop");
const hyperCoreId = document.getElementById("hyperCoreId");
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;

const init = () => {
  window.versions.startHostDesktop();
};
init();

// start_btn.addEventListener(
//   "click",
//   async () => await window.versions.startRecording()
// );
// stop_btn.addEventListener(
//   "click",
//   async () => await window.versions.stopRecording()
// );
