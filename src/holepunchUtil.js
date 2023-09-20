const b4a = require("b4a");
const DHT = require("hyperdht");
const Hypercore = require("hypercore");
const Hyperswarm = require("hyperswarm");
const goodbye = require("graceful-goodbye");

const swarm = new Hyperswarm();
goodbye(() => {
  swarm.destroy();
});

const core = new Hypercore("./writer-storage");

core.ready().then(() => {
  console.log("hypercore key:", b4a.toString(core.key, "hex"));

  // Append all stdin data as separate blocks to the core
  process.stdin.on("data", (data) => core.append(data));
  swarm.join(core.discoveryKey);

  swarm.on("connection", (conn) => {
    console.log("New Connection");
    core.replicate(conn);
  });
});

module.exports = {
  core: core,
};
