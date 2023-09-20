const b4a = require("b4a");
const DHT = require("hyperdht");
const Hypercore = require("hypercore");
const Hyperswarm = require("hyperswarm");
const goodbye = require("graceful-goodbye");

module.exports = class HolePunchUtil {
  constructor(onRemoteConnection) {
    this.seed = Math.random();
    this.swarm = new Hyperswarm();
    this.onRemoteConnection = onRemoteConnection;

    goodbye(() => {
      this.swarm.destroy();
    });
  }

  START_HYPER_CODE() {
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
  }
};
