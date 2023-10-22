import React, { useEffect, useRef, useState } from "react";
import { useRoom } from "../hooks/RoomProvider";
import { CODECS } from "../constants";
import cenc from "compact-encoding";
import { Buffer } from "buffer/";
import { Readable } from "readable-stream";
// const { Readable } = require("stream");

function PeerVideoComp({ localStream, remotePeerId, isLocal }) {
  const { addDataListerner, removeDataListerner } = useRoom();
  const [mediaSource, setMediaSource] = useState();

  const videoRef = useRef();
  const isPlayable = useRef();
  const sourceBuffer = useRef();
  const TAG = `PeerVideo${remotePeerId ? "_P" : "_L"}`;

  useEffect(() => {
    if (mediaSource) {
      mediaSource.addEventListener("sourceclose", (e) => {
        console.log(TAG, "sourceclose", e, videoRef.current);
        isPlayable.current = false;
      });

      mediaSource.addEventListener("sourceended", (e) => {
        console.log(TAG, "sourceended", e, videoRef.current);
        isPlayable.current = false;
      });

      mediaSource.addEventListener("sourceopen", () => {
        sourceBuffer.current = mediaSource.addSourceBuffer(CODECS);
        sourceBuffer.current.mode = "segments";
        isPlayable.current = true;
        let lastUpdated = 1;
        addDataListerner(remotePeerId, ({ data, remoteId }) => {
          const decoded_data = cenc.decode(cenc.json, data);

          // console.log("decoded_data", decoded_data);
          const buffer = Buffer.from(decoded_data.data, "base64");
          // eslint-disable-next-line no-undef
          let videoFrame = new VideoFrame(buffer, { timestamp: ++lastUpdated });
          // trackGenerator.writable.write(videoFrame);

          if (true) {
            lastUpdated = decoded_data.position;
            if (
              isPlayable.current &&
              sourceBuffer.current?.updating === false
            ) {
              try {
                sourceBuffer.current.appendBuffer(buffer);
                // console.info(TAG, "New Data");
              } catch (error) {
                console.error(error);
              }
            }
          }
        });
      });
      // videoRef.current.src = URL.createObjectURL(mediaSource);

      videoRef.current.addEventListener("canplay", function () {
        console.log(TAG, "Video is canplay.");
      });

      videoRef.current.onpause = (event) => {
        console.log(TAG, "Video is paused.");
        isPlayable.current = false;
        // playVideo();
        // sourceBuffer.current.abort();
      };
      videoRef.current.onplaying = (event) => {
        isPlayable.current = true;
        console.log(TAG, "Video is no longer paused.");
      };
      // playVideo();
    }
    return () => {
      removeDataListerner(remotePeerId);
      isPlayable.current = false;
    };
  }, [mediaSource, remotePeerId]);

  const playVideo = () => {
    try {
      if (videoRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          console.log(TAG, playPromise);
          playPromise
            .then(() => console.log(TAG, "Play Started"))
            .catch((err) => console.error(err));
        } else {
          console.log(TAG, "wierd2", videoRef.current);
        }
      } else {
        console.log(TAG, "wierd", videoRef.current);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      const pausePromise = videoRef.current.pause();
      if (pausePromise !== undefined) {
        pausePromise
          .then(() => console.log(TAG, "Play Paused"))
          .catch((err) => console.error(err));
      }
    }
  };

  useEffect(() => {
    if (isLocal) {
      videoRef.current.srcObject = localStream;
    } else {
      if (videoRef.current) {
        // setMediaSource(new MediaSource());
        let lastUpdated = 1;

        // const mockEventStream = new Readable({
        //   objectMode: true,
        //   read: function (size) {
        //     let streamContext = this;
        //     addDataListerner(remotePeerId, ({ data, remoteId }) => {
        //       const decoded_data = cenc.decode(cenc.json, data);
        //       const { timestamp, codedWidth, codedHeight, format, frameCount } =
        //         decoded_data;
        //       const buffer = Buffer.from(decoded_data.data, "base64");

        //       // eslint-disable-next-line no-undef
        //       const newFrame = new VideoFrame(buffer, {
        //         timestamp: timestamp,
        //         codedWidth: codedWidth,
        //         codedHeight: codedHeight,
        //         format: format,
        //       });

        //       streamContext.push(newFrame);
        //     });
        //   },
        // });

        // const transformer = new TransformStream({
        //   transform(newFrame, controller) {
        //     controller.enqueue(newFrame);
        //   },
        // });

        // mockEventStream.pipe(transformer).pipeTo(trackGenerator.writable);

        // mockEventStream.pipe(trackGenerator.writable);

        // eslint-disable-next-line no-undef
        const trackGenerator = new MediaStreamTrackGenerator({ kind: "video" });
        const writer = trackGenerator.writable.getWriter();

        addDataListerner(remotePeerId, ({ data, remoteId }) => {
          // console.time();
          const decoded_data = cenc.decode(cenc.json, data);
          // console.log("PEER", decoded_data);
          const { timestamp, codedWidth, codedHeight, format, frameCount } =
            decoded_data;
          const buffer = Buffer.from(decoded_data.data, "base64");

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
  }, [isLocal, localStream]);

  const handleClick = (e) => {
    console.log("Clicked");
    if (!videoRef.current) return;
    const isVideoPlaying = () =>
      !!(
        videoRef.current.currentTime > 0 &&
        !videoRef.current.paused &&
        !videoRef.current.ended &&
        videoRef.current.readyState > 2
      );
    console.log("Clicked", isVideoPlaying());
    if (!isVideoPlaying()) playVideo();
    else pauseVideo();
  };

  return (
    <>
      <video
        className="peer-video"
        onClick={handleClick}
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
