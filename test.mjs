import fs from "fs";
import chunks from "../p2p-demo/out-stream/2-21-1695218088515.json" assert { type: "json" };

// console.log(data);
const positon = 10;
const chunkSize = 20;
async function saveJsonToVideo() {
  // let blobs = chunks.map((chunk) => {
  //   return Buffer.from(chunk, "base64");
  // });
  // console.log("blobs", blobs);
  // const blob = new Blob(blobs, {
  //   type: "video/webm; codecs=vp9",
  // });

  // const buffer = Buffer.from(await blob.arrayBuffer());

  // fs.writeFile(`./out-stream/${Date.now()}.webm`, buffer, () =>
  //   console.log("video saved successfully!")
  // );

  let buffers = chunks.map((chunk) => Buffer.from(chunk, "base64"));
  const blob = new Blob(buffers, { type: 'video/webm; codecs="vp9"' });
  const arrayBuffer = Buffer.from(await blob.arrayBuffer());

  const path = `./out-stream/${positon - chunkSize}-${
    positon - 1
  }-${Date.now()}.webm`;
  fs.writeFile(path, arrayBuffer, () => {
    console.log(`Video Saved`, path);
  });
}

await saveJsonToVideo();

const saveRenderVideo = async () => {
  log("saveRenderVideo", chunks);
  let blobs = chunks.map((chunk) => {
    return Buffer.from(chunk, "base64");
  });
  log("blobs", blobs);
  const blob = new Blob(blobs, {
    type: "video/webm; codecs=vp9",
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  fs.writeFile(`./out-stream/${Date.now()}.webm`, buffer, () =>
    console.log("video saved successfully!")
  );
};
