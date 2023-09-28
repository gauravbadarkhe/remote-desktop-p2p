export const StartStreamFromSource = async (sourceId) => {
  const stream = await navigator.mediaDevices.getUserMedia({
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
  return stream;
};

export const GenerateMediaSourceBuffer = (videoElementId, Codecs) => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.getElementById(videoElementId);
      const mediaSource = new MediaSource();
      video.src = URL.createObjectURL(mediaSource);
      mediaSource.addEventListener("sourceopen", async (e) => {
        const videoBuffer = mediaSource.addSourceBuffer(codecs);
        resolve(videoBuffer);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const CreateMediaRecorder = (stream, codecs) => {
  return new MediaRecorder(stream, {
    mimeType: codecs,
  });
};
