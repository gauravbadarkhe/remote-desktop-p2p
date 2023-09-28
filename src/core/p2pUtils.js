const b4a = require("b4a");
const { EventEmitter } = require("corestore");
const DHT = require("hyperdht");

module.exports = class P2PUtils extends EventEmitter {
  constructor() {
    super();
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
    this.server = this.dht.createServer((conn) => {
      console.log("New Connection!");
      this.clientConnection = conn;
      this.emit(this.P2PEvents.NewClientConnected, conn);
    });

    this.server.listen(this.keyPair).then(() => {
      console.log(
        `Listening on: ${b4a.toString(this.keyPair.publicKey, "hex")}`
      );
      this.emit(
        this.P2PEvents.ServerStarted,
        b4a.toString(this.keyPair.publicKey, "hex")
      );
      this.role = "Server";
    });
  }

  createClient(remoteServerKey) {
    console.log("Connection To Server", remoteServerKey);
    const publicKey = b4a.from(remoteServerKey, "hex");
    this.client = this.dht.connect(publicKey);
    this.client.once("open", () => {
      this.role = "Client";
      this.emit(this.P2PEvents.ConnectedToServer);
    });

    this.client.on("data", (d) => {
      this.emit(this.P2PEvents.OnMessage, d.toString());
      // onMessageCallback(d.toString());
    });
  }
};
