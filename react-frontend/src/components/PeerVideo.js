import { useEffect, useRef } from "react";
import { useRoom } from "../hooks/RoomProvider";
import { Buffer } from "buffer/";
export function PeerVideo({ localStream, remotePeerId, isLocal }) {
  const { addDataListerner } = useRoom();
  const sourceBuffer = useRef();
  const mediaSource = new MediaSource();
  const videoRef = useRef();

  useEffect(() => {
    console.log(
      "Type Support",
      MediaSource.isTypeSupported("video/webm;codecs=vp9,opus")
    );
    const sourceOpened = () => {
      console.log("sourceopen");

      sourceBuffer.current = mediaSource.addSourceBuffer(
        "video/webm;codecs=vp9,opus"
      );
      sourceBuffer.current.onupdateend = () => console.log("onupdateend");
      sourceBuffer.current.onupdatestart = () => console.log("onupdatestart");
      createDataListerner();
    };

    const createDataListerner = () => {
      addDataListerner(remotePeerId, ({ data, remoteId }) => {
        console.log(`Data From remote : `, remoteId, data);
        try {
          sourceBuffer.current.appendBuffer(data);
        } catch (error) {
          console.error(error);
        }
      });
    };

    if (isLocal) {
      videoRef.current.srcObject = localStream;
    } else {
      mediaSource.addEventListener("sourceopen", sourceOpened);
      mediaSource.addEventListener("sourceclose", (e) =>
        console.log("sourceclose", e)
      );
      mediaSource.addEventListener("sourceended", (e) =>
        console.log("sourceended", e)
      );
      videoRef.current.src = URL.createObjectURL(mediaSource);
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