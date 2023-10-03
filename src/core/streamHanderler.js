const { CODECS } = require("./constnats");

module.exports = class StreamHandler {
  constructor(sourceId) {
    this.sourceId = null;
    this.stream = null;
    this.mediaRecorder = null;
    this.sourceBuffer = null;
    this.recordingIntervel = null;
  }

  CREATE_STREAM = async (ondataCallback) => {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: this.sourceId
        ? {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: sourceId,
              minWidth: 1920,
              maxWidth: 1920,
              minHeight: 1080,
              maxHeight: 1080,
            },
          }
        : true,
    });

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: CODECS,
    });

    this.mediaRecorder.onerror = (err) =>
      console.log("mediaRecorder.onerror", err);
    this.mediaRecorder.onstart = (s) => console.log("mediaRecorder.onstart", s);
    this.mediaRecorder.onstop = (ss) => console.log("mediaRecorder.onstop", ss);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        ondataCallback(event.data);
      }
    };

    console.log(this.stream);
    return this.stream;
  };

  START(recordingIntervel = 1000) {
    this.recordingIntervel = recordingIntervel;
    this.mediaRecorder.start(this.recordingIntervel);
  }

  DESTORY = () => {
    return new Promise((resolve, reject) => {
      this.mediaRecorder.stop();
      this.stream.getTracks().forEach((track) => {
        if (track.readyState == "live") {
          track.stop();
        }
      });
      console.log(`Stream Handler : ${this.sourceId} Destroyed!`);
      resolve();
    });
  };
};
