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
    // eslint-disable-next-line no-undef
    let auditoTrackProcessor = new MediaStreamTrackProcessor({
      track: audioTrack.current,
    });
    recording.current = true;
    let frameCount = 1;
    let videoConsumer = new WritableStream({
      async write(videoFrame) {
        // return new Promise(async (resolve, reject) => {
        if (recording.current && frameCount % 3 === 0) {
          // resolve();

          let buffer = new Uint8Array(videoFrame.allocationSize());
          const copyResult = await videoFrame.copyTo(buffer);
          const { timestamp, codedWidth, codedHeight, format } = videoFrame;

          let data = {
            type: "video",
            data: Buffer.from(buffer).toString("base64"),
            timestamp: timestamp,
            codedWidth: codedWidth,
            codedHeight: codedHeight,
            format: format,
            frameCount: frameCount,
          };
          newDataCallback(data);
        }
        frameCount++;
        videoFrame.close();
        return;
        // });
      },
    });

    let audioConsumer = new WritableStream({
      async write(audioData) {
        // console.log("audio", audioData);
        if (recording.current) {
          let buffer = new Uint8Array(
            audioData.allocationSize({ planeIndex: 0 })
          );
          const copyResult = await audioData.copyTo(buffer, { planeIndex: 0 });
          const {
            timestamp,
            sampleRate,
            numberOfChannels,
            duration,
            numberOfFrames,
            format,
          } = audioData;

          let data = {
            type: "audio",
            data: Buffer.from(buffer).toString("base64"),
            duration: duration,
            sampleRate: sampleRate,
            timestamp: timestamp,
            numberOfChannels: numberOfChannels,
            numberOfFrames: numberOfFrames,
            format: format,
          };
          //   console.log("audio", data);
          newDataCallback(data);
        }

        audioData.close();
      },
    });
    videoTrackProcessor.readable.pipeTo(videoConsumer);
    auditoTrackProcessor.readable.pipeTo(audioConsumer);
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
