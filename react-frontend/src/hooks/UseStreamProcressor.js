import { useRef, useState } from "react";
import { Buffer } from "buffer/";
import zlib, { log } from "react-zlib-js";

export const useStreamProcressor = ({ stream }) => {
  const audioTrack = useRef();
  const videoTrack = useRef();
  const recording = useRef(false);
  const TAG = `StreamProcressor_${stream?.id}`;

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
      async write(videoFrame) {
        // return new Promise(async (resolve, reject) => {
        if (recording.current) {
          // resolve();
          if (frameCount % 3 === 0) {
            let buffer = new Uint8Array(videoFrame.allocationSize());
            const copyResult = await videoFrame.copyTo(buffer);
            const { timestamp, codedWidth, codedHeight, format } = videoFrame;

            let data = {
              data: Buffer.from(buffer).toString("base64"),
              timestamp: timestamp,
              codedWidth: codedWidth,
              codedHeight: codedHeight,
              format: format,
              frameCount: frameCount,
            };
            //   if (frameCount % 3 === 0) {
            newDataCallback(data);
            //   }
            //   frameCount++;

            // zlib.deflateRaw(Buffer.from(buffer), (err, compData) => {
            //   const compressedData = compData.toString("base64");
            //   let data = {
            //     data: compressedData,
            //     timestamp: timestamp,
            //     codedWidth: codedWidth,
            //     codedHeight: codedHeight,
            //     format: format,
            //     frameCount: frameCount,
            //   };

            //   newDataCallback(data);
            // });
          }
          frameCount++;
          videoFrame.close();

          // console.log("procressor", data);
        }
        return;
        // });
      },
    });
    videoTrackProcessor.readable.pipeTo(videoConsumer);
    console.log(TAG, "Started");
  };

  const stopProcressor = () => {
    recording.current = false;
    console.log(TAG, "Stopped");
  };

  return {
    startProcressor,
    stopProcressor,
  };
};
