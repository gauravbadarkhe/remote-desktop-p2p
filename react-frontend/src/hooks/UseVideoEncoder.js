/* eslint-disable no-undef */
import { useRef } from "react";
import { Muxer, StreamTarget } from "webm-muxer";

export const UseVideoEncoder = ({ stream }) => {
  const recording = useRef(false);
  const muxer = useRef();
  const audioEncoder = useRef();
  const videoEncoder = useRef();
  const audioTrack = useRef();
  const videoTrack = useRef();
  const videoTrackWidth = useRef();
  const videoTrackHeight = useRef();
  const audioSampleRate = useRef();

  const makeMuxer = (newDataCallback) => {
    muxer.current = new Muxer({
      streaming: true,

      target: new StreamTarget((buffer, position) => newDataCallback(buffer)),
      video: videoTrack.current
        ? {
            codec: "V_VP9",
            width: videoTrackWidth.current,
            height: videoTrackHeight.current,
            frameRate: 30,
          }
        : undefined,
      audio: audioTrack.current
        ? {
            codec: "A_OPUS",
            sampleRate: audioSampleRate.current,
            numberOfChannels: 1,
          }
        : undefined,
      firstTimestampBehavior: "offset", // Because we're directly pumping a MediaStreamTrack's data into it
    });
  };

  const startEncoding = (newDataCallback) => {
    audioTrack.current = stream.getAudioTracks()[0];
    videoTrack.current = stream.getVideoTracks()[0];

    if (!audioTrack) console.warn("Couldn't acquire a user media audio track.");
    if (!videoTrack) console.warn("Couldn't acquire a user media video track.");

    audioSampleRate.current =
      audioTrack.current?.getCapabilities().sampleRate.max;
    videoTrackWidth.current = videoTrack.current?.getSettings().width;
    videoTrackHeight.current = videoTrack.current?.getSettings().height;

    makeMuxer(newDataCallback);

    if (audioTrack.current) {
      audioEncoder.current = new AudioEncoder({
        output: (chunk, meta) => muxer.current?.addAudioChunk(chunk, meta),
        error: (e) => console.error(e),
      });
      audioEncoder.current.configure({
        codec: "opus",
        numberOfChannels: 1,
        sampleRate: audioSampleRate.current,
        bitrate: 64000,
      });

      // Create a MediaStreamTrackProcessor to get AudioData chunks from the audio track
      let trackProcessor = new MediaStreamTrackProcessor({
        track: audioTrack.current,
      });
      let consumer = new WritableStream({
        write(audioData) {
          audioEncoder.current?.encode(audioData);
          audioData.close();
        },
      });
      trackProcessor.readable.pipeTo(consumer);
    }

    // Video track
    if (videoTrack.current) {
      videoEncoder.current = new VideoEncoder({
        output: (chunk, meta) => muxer.current?.addVideoChunk(chunk, meta),
        error: (e) => console.error(e),
      });
      videoEncoder.current.configure({
        codec: "vp09.00.10.08",
        width: videoTrackWidth.current,
        height: videoTrackHeight.current,
        bitrate: 1e6,
        latencymode: "realtime",
      });

      // Create a MediaStreamTrackProcessor to get VideoFrame chunks from the video track
      let frameCount = 0;
      const keyframeInterval = 3;
      let videoTrackProcessor = new MediaStreamTrackProcessor({
        track: videoTrack.current,
      });
      let videoConsumer = new WritableStream({
        write(videoFrame) {
          const isKeyframe = frameCount % keyframeInterval === 0;
          videoEncoder.current?.encode(videoFrame, { keyFrame: isKeyframe });
          videoFrame.close();

          frameCount++;
        },
      });
      videoTrackProcessor.readable.pipeTo(videoConsumer);
    }
  };

  const stopEncoding = async () => {
    recording.current = false;
    await videoEncoder.current?.flush();
    await audioEncoder.current?.flush();
    muxer.current?.finalize();

    videoEncoder.current = null;
    audioEncoder.current = null;
    muxer.current = null;
  };

  return {
    stopEncoding,
    startEncoding,
  };
};
