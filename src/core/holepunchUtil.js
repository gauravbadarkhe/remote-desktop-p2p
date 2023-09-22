const b4a = require("b4a");
const DHT = require("hyperdht");
const Hypercore = require("hypercore");
const Hyperswarm = require("hyperswarm");
const goodbye = require("graceful-goodbye");

module.exports = class HolePunchUtil {
  constructor() {
    this.seed = Math.random();
    this.swarm = new Hyperswarm();
    this.hyperCore;

    goodbye(() => {
      this.swarm.destroy();
    });
  }

  START_HYPER_CORE = (onRemoteConnection) => {
    return new Promise((resolve, reject) => {
      this.hyperCore = new Hypercore(`./writer-storage/seed-${this.seed}/`);
      this.hyperCore.ready().then(() => {
        console.log("hypercore key:", b4a.toString(this.hyperCore.key, "hex"));
        this.swarm.join(this.hyperCore.discoveryKey);

        this.swarm.on("connection", (conn) => {
          console.log("New Connection");
          this.hyperCore.replicate(conn);
          onRemoteConnection(conn);
        });
        resolve(b4a.toString(this.hyperCore.key, "hex"));
      });
    });
  };

  SEND_DATA(data) {
    if (this.hyperCore) this.hyperCore.append(data);
    else console.error("Hypercore is null");
  }

  CONNECT_TO_HYPER_CORE(remoteCoreKey, newDataCallback) {
    console.log("CONNECT_TO_HYPER_CORE", remoteCoreKey);
    return new Promise(async (resolve, reject) => {
      const core = new Hypercore(
        `./reader-storage/seed-${this.seed}/`,
        remoteCoreKey
      );
      await core.ready();
      const foundPeers = core.findingPeers();
      this.swarm.join(core.discoveryKey);
      this.swarm.on("connection", (conn) => core.replicate(conn));
      await this.swarm.flush();
      foundPeers();
      await core.update();
      resolve();
      let position = core.length;
      console.log(`Skipping ${core.length} earlier blocks...`);
      for await (const block of core.createReadStream({
        start: core.length,
        live: true,
      })) {
        position++;

        // console.log(`Block ${position}`);

        newDataCallback(block.toString(), position);
      }
    });
  }
};
