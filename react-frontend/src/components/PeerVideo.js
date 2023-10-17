import { useEffect, useRef, useState } from "react";
import { useRoom } from "../hooks/RoomProvider";
import { CODECS } from "../constants";
export function PeerVideo({ localStream, remotePeerId, isLocal }) {
  const { addDataListerner, removeDataListerner } = useRoom();
  const [mediaSource, setMediaSource] = useState();
  const [sourceBuffer, setSourceBuffer] = useState();

  const videoRef = useRef();
  const TAG = "PeerVideo";

  useEffect(() => {
    if (mediaSource) {
      mediaSource.addEventListener("sourceclose", (e) =>
        console.log(TAG, "sourceclose", e)
      );

      mediaSource.addEventListener("sourceended", (e) =>
        console.log(TAG, "sourceended", e)
      );

      mediaSource.addEventListener("sourceopen", () => {
        const buffer = mediaSource.addSourceBuffer(CODECS);

        addDataListerner(remotePeerId, ({ data, remoteId }) => {
          // console.log(TAG, "New Data", buffer);

          try {
            buffer.appendBuffer(data);
          } catch (error) {
            console.error(error);
          }
        });
        // setSourceBuffer(mediaSource.addSourceBuffer(CODECS));
      });
      videoRef.current.src = URL.createObjectURL(mediaSource);

      videoRef.current.onsuspend = (event) => {
        console.log(TAG, "Video is onsuspend.");
      };

      videoRef.current.onpause = (event) => {
        console.log(TAG, "Video is paused.");
      };
      videoRef.current.onplaying = (event) => {
        console.log(TAG, "Video is no longer paused.");
      };

      videoRef.current.play().catch((err) => console.error(err));
    }
    return () => {
      removeDataListerner(remotePeerId);
    };
  }, [mediaSource, remotePeerId]);

  // useEffect(() => {
  //   if (sourceBuffer) {
  //     addDataListerner(remotePeerId, ({ data, remoteId }) => {
  //       console.log(TAG,"New Data", sourceBuffer);
  //       sourceBuffer.appendBuffer(data);
  //     });
  //   }
  // }, [sourceBuffer]);

  useEffect(() => {
    console.log(TAG, "useEffect__PeerrVid");
    if (isLocal) {
      videoRef.current.srcObject = localStream;

      videoRef.current.play().catch((err) => console.error(err));
    } else {
      if (videoRef.current) {
        setMediaSource(new MediaSource());
      }
    }
  }, [isLocal, localStream]);

  return (
    <video
      muted
      className="peer-video"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: "0",
        objectFit: "cover",
      }}
      ref={videoRef}
      //   ref={(video) => {
      //     if (video && localStream) {
      //       video.srcObject = localStream;
      //     }
      //   }}
    ></video>
  );
}
