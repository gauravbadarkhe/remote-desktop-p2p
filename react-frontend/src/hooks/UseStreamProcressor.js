import { useRef } from "react";
import { Buffer } from "buffer/";

export const useStreamProcressor = ({ stream }) => {
  const audioTrack = useRef();
  const videoTrack = useRef();
  const recording = useRef(false);

  const startProcressor = (newDataCallback) => {
    audioTrack.current = stream.getAudioTracks()[0];
    videoTrack.current = stream.getVideoTracks()[0];

    if (!audioTrack) console.warn("Couldn't acquire a user media audio track.");
    if (!videoTrack) console.warn("Couldn't acquire a user media video track.");
    // eslint-disable-next-line no-undef
    let videoTrackProcessor = new MediaStreamTrackProcessor({
      track: videoTrack.current,
    });
    recording.current = true;
    let frameCount = 1;
    let videoConsumer = new WritableStream({
      write(videoFrame) {
        return new Promise(async (resolve, reject) => {
          if (recording.current) {
            resolve();
            let buffer = new Uint8Array(videoFrame.allocationSize());
            const copyResult = await videoFrame.copyTo(buffer);
            let data = {
              data: Buffer.from(buffer).toString("base64"),
              timestamp: videoFrame.timestamp,
              codedWidth: videoFrame.codedWidth,
              codedHeight: videoFrame.codedHeight,
              format: videoFrame.format,
              frameCount: frameCount,
            };

            if (frameCount % 5 === 0) {
              newDataCallback(data);
            }

            // console.log("procressor", data);
            videoFrame.close();
            frameCount++;

            console.log();
          }
        });
      },
    });
    videoTrackProcessor.readable.pipeTo(videoConsumer);
  };

  const stopProcressor = () => {
    recording.current = false;
  };

  return {
    startProcressor,
    stopProcressor,
  };
};
