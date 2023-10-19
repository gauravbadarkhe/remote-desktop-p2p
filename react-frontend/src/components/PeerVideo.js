import React, { useEffect, useRef, useState } from "react";
import { useRoom } from "../hooks/RoomProvider";
import { CODECS } from "../constants";
export function PeerVideo({ localStream, remotePeerId, isLocal }) {
  const { addDataListerner, removeDataListerner } = useRoom();
  const [mediaSource, setMediaSource] = useState();

  const videoRef = useRef();
  const isPlayable = useRef();
  const TAG = "PeerVideo";

  useEffect(() => {
    if (mediaSource) {
      mediaSource.addEventListener("sourceclose", (e) => {
        console.log(TAG, "sourceclose", e, videoRef.current);
        isPlayable.current = false;
        setMediaSource(new MediaSource());
      });

      mediaSource.addEventListener("sourceended", (e) => {
        console.log(TAG, "sourceended", e, videoRef.current);
        isPlayable.current = false;
        setMediaSource(new MediaSource());
      });

      mediaSource.addEventListener("sourceopen", () => {
        const buffer = mediaSource.addSourceBuffer(CODECS);
        isPlayable.current = true;
        addDataListerner(remotePeerId, ({ data, remoteId }) => {
          // console.log(TAG, "New Data", buffer);
          if (isPlayable.current && buffer?.updating === false) {
            try {
              buffer.appendBuffer(data);
            } catch (error) {
              console.error(error);
            }
          }
        });
      });
      videoRef.current.src = URL.createObjectURL(mediaSource);

      videoRef.current.onsuspend = (event) => {
        console.log(TAG, "Video is onsuspend.");
      };

      videoRef.current.onpause = (event) => {
        console.log(TAG, "Video is paused.");
        // playVideo();
      };
      videoRef.current.onplaying = (event) => {
        console.log(TAG, "Video is no longer paused.");
      };
    }
    return () => {
      removeDataListerner(remotePeerId);
      isPlayable.current = false;
    };
  }, [mediaSource, remotePeerId]);

  const playVideo = () => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log(TAG, "Play resolved"))
          .catch((err) => console.error(err));
      }
    }
  };

  useEffect(() => {
    if (isLocal) {
      videoRef.current.srcObject = localStream;
    } else {
      if (videoRef.current) {
        setMediaSource(new MediaSource());
      }
    }
  }, [isLocal, localStream]);

  return (
    <>
      <video
        autoPlay
        className="peer-video"
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

export default React.memo(PeerVideo);
