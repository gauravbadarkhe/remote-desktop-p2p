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
      // await discovery.flushed();
      console.log(`Joined Room ${b4a.toString(this._RoomId, "hex")}`);
      resolve(b4a.toString(this._RoomId, "hex"));
    });
  }

  closeRoom() {
    this.swarm.destroy();
  }

  initEvents() {
    this.swarm.on("connection", (conn) => {
      const remoteId = b4a.toString(conn.remotePublicKey, "hex");
      this.emit("newconnection", remoteId);
      console.log(`New Peer COnnected  :${remoteId}`, conn);
      this.conns.push(conn);
      conn.on("error", (err) => {
        this.conns.splice(this.conns.indexOf(conn), 1);
        this.emit("close", remoteId);
        console.error(err);
      });
      conn.once("close", () => {
        this.conns.splice(this.conns.indexOf(conn), 1);
        this.emit("close", remoteId);
      });
      conn.on("data", (data) => {
        // console.log(`${remoteId}: ${data}`);
        this.emit("data", { remoteId: remoteId, data: Buffer.from(data) });
      });
    });
  }

  sendDataToAllConnections(data) {
    // console.log(`Sending data to ${this.conns.length} conns`);
    // console.log(data);
    for (const conn of this.conns) {
      conn.write(data);
    }
  }
};
