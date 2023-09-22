const { CODECS } = require("./constnats");

module.exports = class RemoteHostRenderer {
  constructor(videoElemnetId, sourceOpenedCallback) {
    if (!MediaSource.isTypeSupported(CODECS))
      throw new Error("Unsupported mime");
    this.videoElemnetId = videoElemnetId;
    this.video = document.getElementById(videoElemnetId);
    this.mediaSource = new MediaSource();
    this.video.crossOrigin = "anonymous";
    this.video.src = URL.createObjectURL(this.mediaSource);
    this.chunkSize = 5;
    this.chunks = [];

    this.sourceBuffer;
    this.mediaSource.addEventListener(
      "sourceopen",
      (e) => {
        console.log("mediaSource.sourceopen");

        this.video.play();
        this.sourceBuffer = this.mediaSource.addSourceBuffer(CODECS);

        sourceOpenedCallback(this.sourceBuffer);
      },
      false
    );

    console.log("this.video.src", this.video.src);
  }

  async append(sourceBuffer, encodedBase64Str) {
    try {
      if (this.chunks.length <= this.chunkSize) {
        return this.chunks.push(encodedBase64Str);
      } else {
        const tempChunks = this.chunks.map((chunk) => chunk);
        this.chunks = [];
        this.chunks.push(encodedBase64Str);
        let buffers = tempChunks.map((chunk) => Buffer.from(chunk, "base64"));
        const blob = new Blob([buffers], { type: CODECS });
        console.log("appendBlob", blob);
        const arrayBuffer = await blob.arrayBuffer();

        sourceBuffer.appendBuffer(arrayBuffer);
      }
    } catch (error) {
      console.error(error);
    }
  }
};
