const { CODECS } = require("./constnats");

module.exports = class StreamHandler {
  constructor(sourceId) {
    this.sourceId = sourceId;
    this.stream = null;

    this.mediaRecorder = null;
    this.sourceBuffer = null;
    this.recordingIntervel = null;
  }

  CREATE_STREAM = async (sourceId) => {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720,
        },
      },
    });

    return this.stream;
  };

  CREATE_MEDIA_RECORDER = async (onDataAvalible) => {
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: CODECS,
    });

    this.mediaRecorder.onerror = (err) =>
      console.log("mediaRecorder.onerror", err);
    this.mediaRecorder.onstart = (s) => console.log("mediaRecorder.onstart", s);
    this.mediaRecorder.onstop = (ss) => console.log("mediaRecorder.onstop", ss);

    this.mediaRecorder.ondataavailable = async function (event) {
      if (event.data.size > 0) {
        console.log("blobtype", event.data);
        // console.log(` mediaRecorder.ondataavailable: ${event.data.size}`);
        onDataAvalible(event.data);
      }
    };

    return this.mediaRecorder;
  };

  START = (intervel = 3000) => {
    console.log("Stream handler : Start");
    this.mediaRecorder.start(intervel);
    // this.recordingIntervel = setInterval(() => {
    //   this.mediaRecorder.start(100);
    // }, intervel);
  };

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
