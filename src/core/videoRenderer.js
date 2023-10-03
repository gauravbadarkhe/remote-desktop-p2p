const { CODECS, recalculateLayout } = require("./constnats");
const debounce = require("lodash/debounce");

class PeerData {
  constructor(remotePeerId, videoElement, videoSourceBuffer, isLocalStream) {
    this.remotePeerId = remotePeerId;
    this.videoElement = videoElement;
    this.videoSourceBuffer = videoSourceBuffer;
    this.isLocalStream = isLocalStream;
  }
}

module.exports = class VideoRenderer {
  constructor(parentContiner) {
    this.parentContiner = parentContiner;
    this.peers = {}; //Map Of Peers
    window.addEventListener("resize", this.reCalculateGalaryBounds);
  }

  async addNewVideoStream(remotePeerId, localStream) {
    return new Promise((resolve, reject) => {
      const videoContainer = document.createElement("div");
      videoContainer.className = "video-container";
      const videoElement = document.createElement("video");
      const mediaSource = new MediaSource();
      videoElement.autoplay = true;
      videoElement.id = `video_${remotePeerId}`;

      videoContainer.appendChild(videoElement);

      document.getElementById(this.parentContiner).append(videoContainer);

      if (!localStream) {
        videoElement.src = URL.createObjectURL(mediaSource);
        mediaSource.onsourceopen = () => {
          console.log("Media Source Opened");
          const videoBuffer = mediaSource.addSourceBuffer(CODECS);
          const peer = new PeerData(remotePeerId, videoElement, videoBuffer);
          this.peers[remotePeerId] = peer;
          resolve(peer);
          this.reCalculateGalaryBounds();
        };
      } else {
        const peer = new PeerData(remotePeerId, videoElement, null, true);
        this.peers[remotePeerId] = peer;
        resolve(peer);
        this.reCalculateGalaryBounds();
      }
    });
  }

  attachLocalStream(remoteId, localStream) {
    if (!this.peers[remoteId]) {
      console.log(this.peers);
      console.log("No Peer With id", remoteId);
      return;
    }
    let peer = this.peers[remoteId];
    const localVideoPlayer = document.getElementById(`video_${remoteId}`);
    if ("srcObject" in localVideoPlayer) {
      localVideoPlayer.srcObject = localStream;
    } else {
      // Avoid using this in new browsers, as it is going away.
      localVideoPlayer.src = URL.createObjectURL(localStream);
    }

    console.log(localVideoPlayer);
    localVideoPlayer.play();
  }
  onPeerVideoUpdate(remoteId, dataBuffer) {
    if (!this.peers[remoteId]) {
      console.log("No Peer With id", remoteId);
      return;
    }

    let peer = this.peers[remoteId];
    let videoSourceBuffer = peer.videoSourceBuffer;
    if (!videoSourceBuffer.updating) {
      try {
        videoSourceBuffer.appendBuffer(dataBuffer);
      } catch (error) {
        console.log(error);
      }
    }
  }

  reCalculateGalaryBounds = debounce(recalculateLayout, 50);
};
