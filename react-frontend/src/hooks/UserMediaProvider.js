import { useState, useEffect, useRef } from "react";
import { Buffer } from "buffer/";

export const useUserMedia = ({ constraints, mimeType, timeSlice = 500 }) => {
  const [status, setStatus] = useState(null);
  const [recorderTimeSlice, setTimeSlice] = useState(timeSlice);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);

  useEffect(() => console.log(status), [status]);

  const startStreamingData = async (newDataCallback) => {
    if (!stream) await startStream();
    mediaRecorder.current = new MediaRecorder(stream, {
      mimeType: mimeType,
    });

    mediaRecorder.current.ondataavailable = (eventBlob) => {
      // console.log(eventBlob);

      if (eventBlob.data.size > 0) {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          // console.log(Buffer.from(fileReader.result));
          newDataCallback(Buffer.from(fileReader.result));
        };
        fileReader.readAsArrayBuffer(eventBlob.data);
      }
    };
    mediaRecorder.current.onstop = () => setStatus("RECORDING_STOPPED");
    mediaRecorder.current.onstart = () => setStatus("RECORDING_STARTED");
    mediaRecorder.current.onerror = () => {
      setError("NO_RECORDER");
      setStatus("idle");
    };
    mediaRecorder.current.start(recorderTimeSlice);
    setStatus("RECORDING_REQUESTED");
  };

  const stopStreamingData = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
  };
  const startStream = async () => {
    try {
      setStream(await navigator.mediaDevices.getUserMedia(constraints));
      setStatus("STREAM_READY");
    } catch (e) {
      console.error(e);
      setError(e);
    }
    return stream;
  };

  const cancelStream = () => {
    if (!stream) return;
    if (stream?.getVideoTracks) {
      stream.getVideoTracks().map((track) => track.stop());
    }
    if (stream?.getAudioTracks) {
      stream.getAudioTracks().map((track) => track.stop());
    }
    if (stream?.stop) {
      stream.stop();
    }
    setStream(null);
  };

  return {
    startStream,
    stream,
    status,
    error,
    startStreamingData,
    stopStreamingData,
    cancelStream,
  };
};
