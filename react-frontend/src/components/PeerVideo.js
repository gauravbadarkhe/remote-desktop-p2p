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

  useEffect(() => {
    if (isLocal) {
      videoRef.current.srcObject = localStream;
    } else {
      if (videoRef.current) {
        // setMediaSource(new MediaSource());
        let lastUpdated = 1;

        // eslint-disable-next-line no-undef
        const trackGenerator = new MediaStreamTrackGenerator({ kind: "video" });
        const writer = trackGenerator.writable.getWriter();

        addDataListerner(remotePeerId, ({ data, remoteId }) => {
          // console.time();

          const decoded_data = cenc.decode(cenc.json, data);
          // console.log("PEER", decoded_data);
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
          // console.timeEnd();
        });

        // writer.write(audioData);
        const streamAfter = new MediaStream([trackGenerator]);
        videoRef.current.srcObject = streamAfter;
      }
    }

    return () => {
      if (remotePeerId) removeDataListerner(remotePeerId);
    };
  }, [isLocal, localStream, remotePeerId]);

  return (
    <>
      <video
        className="peer-video"
        autoPlay
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
