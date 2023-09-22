const urlParams = new URLSearchParams(window.location.search);
const remoteId = urlParams.get("remoteId");
console.log("remoteId", remoteId);

const StartRemoteHostConnection = () => {
  window.versions.connetToRemoteHost(remoteId, "remoteVideoPlayer");
};
start();
