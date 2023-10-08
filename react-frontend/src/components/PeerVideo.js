import { useEffect, useRef } from "react";
import { useRoom } from "../hooks/RoomProvider";
import { Buffer } from "buffer/";
export function PeerVideo({ localStream, remotePeerId }) {
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
      createDataListerner();
    };

    const createDataListerner = () => {
      addDataListerner(remotePeerId, ({ data, remoteId }) => {
        console.log(`Data From remote : `, remoteId);
        sourceBuffer.current.appendBuffer(Buffer.from(data));
      });
    };
    if (remotePeerId) {
      mediaSource.addEventListener("sourceopen", sourceOpened);
      mediaSource.addEventListener("sourceclose", (e) =>
        console.log("sourceclose", e)
      );
      mediaSource.addEventListener("sourceended", (e) =>
        console.log("sourceended", e)
      );

      if (localStream) {
        videoRef.current.srcObject = localStream;
      } else {
        videoRef.current.src = URL.createObjectURL(mediaSource);
      }
    }
  }, [remotePeerId]);

  return (
    <video
      muted
      className="peer-video"
      autoPlay
      ref={videoRef}
      //   ref={(video) => {
      //     if (video && localStream) {
      //       video.srcObject = localStream;
      //     }
      //   }}
    ></video>
  );
}
