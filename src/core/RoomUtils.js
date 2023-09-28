const EventEmitter = require("events");
const Hyperswarm = require("hyperswarm");
const crypto = require("hypercore-crypto");
const b4a = require("b4a");

module.exports = class RoomUtils extends EventEmitter {
  constructor() {
    super();
    this.swarm = new Hyperswarm();
    this.conns = [];
    this._RoomId = null;
  }

  initRoom(roomId) {
    return new Promise(async (resolve, reject) => {
      this._RoomId = roomId ? b4a.from(roomId, "hex") : crypto.randomBytes(32);
      const discovery = this.swarm.join(this._RoomId, {
        client: true,
        server: true,
      });
      await discovery.flushed();
      console.log(`Joined Room ${b4a.toString(this._RoomId, "hex")}`);
      resolve(b4a.toString(this._RoomId, "hex"));
    });
  }

  start() {
    this.swarm.on("connection", (conn) => {
      const name = b4a.toString(conn.remotePublicKey, "hex");
      this.emit("newconnection", name);
      console.log(`New Peer COnnected  :${name}`);
      this.conns.push(conn);
      conn.on("error", (err) => console.error(err));
      conn.once("close", () => this.conns.splice(this.conns.indexOf(conn), 1));
      conn.on("data", (data) => {
        // console.log(`${name}: ${data}`);
        this.emit("data", { name: name, data: data });
      });
    });
  }

  sendDataToAllConnections(data) {
    console.log(`Sending data to ${this.conns.length} conns`, data);
    for (const conn of this.conns) {
      conn.write(data);
    }
  }
};
