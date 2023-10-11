import { useEffect, useRef } from "react";
import { useRoom } from "../hooks/RoomProvider";
import { Buffer } from "buffer/";
export function PeerVideo({ localStream, remotePeerId, isLocal }) {
  const { addDataListerner } = useRoom();
  const sourceBuffer = useRef();
  const mediaRef = useRef();
  const videoRef = useRef();

  useEffect(() => {
    const sourceOpened = () => {
      if (mediaRef.current?.sourceBuffers.length > 0) return;
      console.log("sourceopen");

      sourceBuffer.current = mediaRef.current.addSourceBuffer(
        'video/webm; codecs="vp9,opus"'
      );

      createDataListerner();
    };

    const createDataListerner = () => {
      addDataListerner(remotePeerId, ({ data, remoteId }) => {
        console.log(`Data From remote : `, remoteId, data);
        try {
          sourceBuffer.current.onupdateend = () => console.log("onupdateend");
          sourceBuffer.current.onupdatestart = () =>
            console.log("onupdatestart");
          setTimeout(() => {
            console.log(
              "activeSourceBuffers",
              mediaRef.current.sourceBuffers[0]
            );
            sourceBuffer.current.appendBuffer(data);
          }, 2000);
        } catch (error) {
          console.error(error);
        }
      });
    };

    if (isLocal) {
      videoRef.current.srcObject = localStream;
    } else {
      if (!videoRef.current?.src) {
        console.log("SRC Added");
        mediaRef.current = new MediaSource();
        mediaRef.current.addEventListener("sourceopen", sourceOpened);
        mediaRef.current.addEventListener("sourceclose", (e) =>
          console.log("sourceclose", e)
        );
        mediaRef.current.addEventListener("sourceended", (e) =>
          console.log("sourceended", e)
        );
        videoRef.current.src = URL.createObjectURL(mediaRef.current);
      } else {
        console.log("Noo Need to add SRC");
      }
    }
  }, [remotePeerId]);

  return (
    <video
      muted
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
      //   ref={(video) => {
      //     if (video && localStream) {
      //       video.srcObject = localStream;
      //     }
      //   }}
    ></video>
  );
}
