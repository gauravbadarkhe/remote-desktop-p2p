const { CODECS } = require("./constnats");

class PeerData {
  constructor(remotePeerId, videoElement, videoSourceBuffer) {
    this.remotePeerId = remotePeerId;
    this.videoElement = videoElement;
    this.videoSourceBuffer = videoSourceBuffer;
  }
}

module.exports = class VideoRenderer {
  constructor(parentContiner) {
    this.parentContiner = parentContiner;
    this.peers = {}; //Map Of Peers
  }

  async addNewVideoStream(remotePeerId) {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement("video");
      const mediaSource = new MediaSource();
      videoElement.autoplay = true;
      videoElement.id = `video_${remotePeerId}`;

      document.getElementById(this.parentContiner).append(videoElement);

      videoElement.src = URL.createObjectURL(mediaSource);
      mediaSource.onsourceopen = () => {
        console.log("Media Source Opened");
        const videoBuffer = mediaSource.addSourceBuffer(CODECS);
        const peer = new PeerData(remotePeerId, videoElement, videoBuffer);
        this.peers[remotePeerId] = peer;
        resolve(peer);
      };
    });
  }

  onPeerVideoUpdate(remoteId, dataBuffer) {
    if (!this.peers[remoteId]) {
      console.log("No Peer With id", remoteId);
      return;
    }

    let peer = this.peers[remoteId];
    let videoSourceBuffer = peer.videoSourceBuffer;
    if (!videoSourceBuffer.updating) {
      videoSourceBuffer.appendBuffer(dataBuffer);
    }
  }
};
