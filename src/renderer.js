const information = document.getElementById("info");
const start_btn = document.getElementById("start");
const stop_btn = document.getElementById("stop");
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;

const func = async () => {
  const response = await window.versions.ping();
  console.log(response); // prints out 'pong'
};
func();

information.addEventListener("click", func);

stop_btn.addEventListener("click", func);

start_btn.addEventListener(
  "click",
  async () => await window.versions.startRecording()
);
stop_btn.addEventListener(
  "click",
  async () => await window.versions.stopRecording()
);
