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
      });

      mediaSource.addEventListener("sourceended", (e) => {
        console.log(TAG, "sourceended", e, videoRef.current);
        isPlayable.current = false;
      });

      mediaSource.addEventListener("sourceopen", () => {
        const buffer = mediaSource.addSourceBuffer(CODECS);
        buffer.mode = "segments";
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
      playVideo();

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
          .then(() => console.log(TAG, "Play Started"))
          .catch((err) => console.error(err));
      }
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
      playVideo();
    } else {
      if (videoRef.current) {
        setMediaSource(new MediaSource());
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
