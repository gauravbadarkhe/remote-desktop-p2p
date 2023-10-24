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
    this.logIt = false;
  }

  initRoom(roomId) {
    return new Promise(async (resolve, reject) => {
      this._RoomId = roomId ? b4a.from(roomId, "hex") : crypto.randomBytes(32);
      const options = {
        client: true,
        server: true,
      };
      const discovery = this.swarm.join(this._RoomId, options);

      if (!roomId) await discovery.flushed();
      this.roomLog(
        roomId,
        options,
        `Joined Room ${b4a.toString(this._RoomId, "hex")}`,
        discovery
      );
      resolve(b4a.toString(this._RoomId, "hex"));
    });
  }

  closeRoom() {
    this.swarm.destroy();
  }
  formatBytes(a, b = 2) {
    if (!+a) return "0 Bytes";
    const c = 0 > b ? 0 : b,
      d = Math.floor(Math.log(a) / Math.log(1024));
    return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
      ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"][d]
    }`;
  }

  initEvents() {
    this.swarm.on("connection", (conn) => {
      const remoteId = b4a.toString(conn.remotePublicKey, "hex");
      this.emit("newconnection", remoteId);
      this.roomLog(`New Peer COnnected  :${remoteId}`, conn);
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
        this.roomLog(
          `${remoteId}: New data`,
          this.formatBytes(Buffer.byteLength(data))
        );
        this.emit("data", { remoteId: remoteId, data: data });
      });
    });
  }

  sendDataToAllConnections(data) {
    this.roomLog(
      `Sending data to ${this.conns.length} conns`,
      this.formatBytes(Buffer.byteLength(data))
    );

    for (const conn of this.conns) {
      conn.write(data);
    }
  }

  roomLog(...logs) {
    if (this.logIt) {
      this.roomLog("RoomUtils", ...logs);
    }
  }
};
