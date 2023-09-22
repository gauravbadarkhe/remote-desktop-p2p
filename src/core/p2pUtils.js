const b4a = require("b4a");
const { EventEmitter } = require("corestore");
const DHT = require("hyperdht");

module.exports = class P2PUtils extends EventEmitter {
  constructor() {
    this.dht = new DHT();
    this.keyPair = DHT.keyPair();
    this.server,
      this.client,
      this.clientConnection,
      (this.remoteServerKey = null);
    this.role = "NA"; // Can get "Server", Client
  }

  P2PEvents = {
    NewClientConnected: "NewClientConnected",
    OnMessage: "OnMessage",
    ServerStarted: "ServerStarted",
    ConnectedToServer: "ConnectedToServer",
  };

  sendMessage(data) {
    if (this.role === "Client") this.client.write(data);
    else if (this.role === "Server") this.clientConnection.write(data);
    else console.log("No Valid Role!!");
  }

  reciveMessages(callback) {
    this.clientConnection.on("data", (d) => {
      callback(d.toString());
    });
  }

  createServer() {
    this.server = dht.createServer((conn) => {
      console.log("New Connection!");
      this.clientConnection = conn;
      this.emit(this.P2PEvents.NewClientConnected, conn);
    });

    server
      .listen(this.keyPair)
      .then(() => {
        console.log(
          `Listening on: ${b4a.toString(this.keyPair.publicKey, "hex")}`
        );
        this.emit(this.P2PEvents.ServerStarted, this.keyPair.publicKey);
        this.role = "Server";
        resolve(this.keyPair.publicKey);
      })
      .catch((err) => {
        reject(err);
      });
  }

  createClient(remoteServerKey, onMessageCallback) {
    const publicKey = b4a.from(remoteServerKey, "hex");

    this.client = dht.connect(publicKey);
    this.client.once("open", () => {
      this.emit(this.P2PEvents.ConnectedToServer);
      this.role = "Client";
    });

    this.client.on("data", (d) => {
        this.emit(this.)
      onMessageCallback(d.toString());
    });
  }
};
