const { CODECS } = require("./constnats");

module.exports = class VideoRenderer {
  constructor(videoElement) {
    this.videoElement = videoElement;
    this.mediaSource = new MediaSource();
  }

  getSourceBuffer() {
    return new Promise((resolve, reject) => {
      this.videoElement.src = URL.createObjectURL(this.mediaSource);
      this.mediaSource.onsourceopen = () => {
        console.log("Media Source Opened");
        this.videoBuffer = this.mediaSource.addSourceBuffer(CODECS);
        resolve(this.videoBuffer);
      };
    });
  }
};
