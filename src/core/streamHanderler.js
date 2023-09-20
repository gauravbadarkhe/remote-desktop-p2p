module.exports = class StreamHandler {
  constructor(sourceId) {
    this.sourceId = sourceId;
    this.stream = null;
    this.mediaSource = null;
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

  CREATE_SOURCE_BUFFER = () => {
    this.sourceBuffer = this.mediaSource.addSourceBuffer(
      'video/webm; codecs="vp9"'
    );

    return this.sourceBuffer;
  };

  CREATE_MEDIA_SOURCE = async (onDataAvalible) => {
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    this.mediaRecorder.onerror = (err) =>
      console.log("mediaRecorder.onerror", err);
    this.mediaRecorder.onstart = (s) => console.log("mediaRecorder.onstart", s);
    this.mediaRecorder.onstop = (ss) => console.log("mediaRecorder.onstop", ss);
    this.mediaSource = new MediaSource();

    this.mediaSource.addEventListener(
      "sourceopen",
      (e) => {
        console.log("mediaSource.sourceopen");
        this.sourceBuffer = this.CREATE_SOURCE_BUFFER();
        const _sourceBuff = this.sourceBuffer;
        this.mediaRecorder.ondataavailable = async function (event) {
          if (event.data.size > 0) {
            console.log(` mediaRecorder.ondataavailable: ${event.data.size}`);
            onDataAvalible(_sourceBuff, event.data);
          }
        };
      },
      false
    );

    return this.mediaSource;
  };

  START = (intervel) => {
    console.log("Stream handler : Start");
    this.mediaRecorder.start(intervel);
    // this.recordingIntervel = setInterval(() => {
    //   this.mediaRecorder.start(100);
    // }, intervel);
  };

  DESTORY = () => {
    return new Promise((resolve, reject) => {
      //   clearInterval(this.recordingIntervel);

      //   this.sourceBuffer.abort();
      this.mediaSource.endOfStream();
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
