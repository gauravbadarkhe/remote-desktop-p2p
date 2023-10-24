/* eslint-disable no-undef */

import React, { useEffect, useRef, useState } from "react";
import { useRoom } from "../hooks/RoomProvider";
import { CODECS } from "../constants";
import cenc from "compact-encoding";
import { Buffer } from "buffer/";
import { Readable } from "readable-stream";
// const { Readable } = require("stream");
import zlib from "react-zlib-js";

function PeerVideoComp({ localStream, remotePeerId, isLocal }) {
  const { addDataListerner, removeDataListerner } = useRoom();
  const [mediaSource, setMediaSource] = useState();

  const videoRef = useRef();
  const isPlayable = useRef();
  const sourceBuffer = useRef();
  const TAG = `PeerVideo${remotePeerId ? "_P" : "_L"}`;

  const handleAudioData = (decoded_data, writer) => {
    const { format, sampleRate, numberOfFrames, numberOfChannels, timestamp } =
      decoded_data;
    const buffer = Buffer.from(decoded_data.data, "base64");

    const audioData = new AudioData({
      format,
      sampleRate,
      numberOfFrames,
      numberOfChannels,
      timestamp,
      data: buffer,
    });
    writer.write(audioData);
  };

  const handleVideoData = (decoded_data, writer) => {
    const { timestamp, codedWidth, codedHeight, format, frameCount } =
      decoded_data;
    const buffer = Buffer.from(decoded_data.data, "base64"); // zlib.inflateRawSync(Buffer.from(decoded_data.data, "base64"));

    // eslint-disable-next-line no-undef
    const newFrame = new VideoFrame(buffer, {
      timestamp: timestamp,
      codedWidth: codedWidth,
      codedHeight: codedHeight,
      format: format,
    });

    writer.write(newFrame);
  };

  useEffect(() => {
    if (isLocal) {
      videoRef.current.srcObject = localStream;
    } else {
      if (videoRef.current) {
        // eslint-disable-next-line no-undef
        const videoTrackGenerator = new MediaStreamTrackGenerator({
          kind: "video",
        });
        // eslint-disable-next-line no-undef
        const audioTrackGenerator = new MediaStreamTrackGenerator({
          kind: "audio",
        });
        const videoWriter = videoTrackGenerator.writable.getWriter();
        const audioWriter = audioTrackGenerator.writable.getWriter();

        addDataListerner(remotePeerId, ({ data, remoteId }) => {
          // console.time();

          const decoded_data = cenc.decode(cenc.json, data);
          // console.log("PEER", decoded_data);
          if (decoded_data.type === "audio")
            handleAudioData(decoded_data, audioWriter);
          if (decoded_data.type === "video")
            handleVideoData(decoded_data, videoWriter);

          // console.timeEnd();
        });

        // writer.write(audioData);
        const streamAfter = new MediaStream([
          videoTrackGenerator,
          audioTrackGenerator,
        ]);
        videoRef.current.srcObject = streamAfter;
      } else {
        console.log("Wierd But Video Ref is not populated");
      }
    }

    return () => {
      if (remotePeerId) removeDataListerner(remotePeerId);
    };
  }, []);

  return (
    <>
      <video
        className="peer-video"
        autoPlay
        muted
        onClick={(video) => {
          if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: "0",
          objectFit: "cover",
        }}
        ref={videoRef}
      ></video>
      <span>Loading...</span>
    </>
  );
}

export default PeerVideoComp;
