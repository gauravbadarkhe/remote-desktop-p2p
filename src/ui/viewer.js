const urlParams = new URLSearchParams(window.location.search);
const remoteId = urlParams.get("remoteId");

const StartRemoteHostConnection = () => {
  console.log("remoteId", remoteId);
  window.versions.connetToRemoteHost(remoteId, "remoteVideoPlayer");
};
StartRemoteHostConnection();
