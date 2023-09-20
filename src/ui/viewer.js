const urlParams = new URLSearchParams(window.location.search);
const remoteId = urlParams.get("remoteId");
console.log("remoteId", remoteId);

const start = async () => {
  const response = await window.versions.startRemoteDesktop(remoteId);
};
start();
