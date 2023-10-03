const information = document.getElementById("info");
const btn_share = document.getElementById("btn_share");
const stop_btn = document.getElementById("stop");
const hyperCoreId = document.getElementById("hyperCoreId");
const remoteHostKey = document.getElementById("remoteHostKey");
const startRemoteViewer = document.getElementById("redirectToViwer");

// information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;

const redirectToViwer = () => {
  window.location.href = "./viewer.html?remoteId=" + remoteHostKey.value;
};

btn_share.addEventListener("click", async () =>
  window.versions.startHostDesktop()
);

const startRemoteHostConnection = () => {
  console.log("remoteId", remoteHostKey.value);
  window.versions.connetToRemoteHost(remoteHostKey.value, "remoteVideoPlayer");
};

startRemoteViewer.addEventListener("click", () => redirectToViwer());

function recalculateLayout() {
  console.log("asdasd");
  var gallery = document.getElementById("gallery");
  var aspectRatio = 16 / 9;
  var screenWidth = document.body.getBoundingClientRect().width;
  var screenHeight = document.body.getBoundingClientRect().height;
  var videoCount = document.getElementsByTagName("video").length;
  // or use this nice lib: https://github.com/fzembow/rect-scaler
  function calculateLayout(
    containerWidth,
    containerHeight,
    videoCount,
    aspectRatio
  ) {
    var bestLayout = {
      area: 0,
      cols: 0,
      rows: 0,
      width: 0,
      height: 0,
    };
    // brute-force search layout where video occupy the largest area of the container
    for (var cols_1 = 1; cols_1 <= videoCount; cols_1++) {
      var rows = Math.ceil(videoCount / cols_1);
      var hScale = containerWidth / (cols_1 * aspectRatio);
      var vScale = containerHeight / rows;
      var width_1 = void 0;
      var height_1 = void 0;
      if (hScale <= vScale) {
        width_1 = Math.floor(containerWidth / cols_1);
        height_1 = Math.floor(width_1 / aspectRatio);
      } else {
        height_1 = Math.floor(containerHeight / rows);
        width_1 = Math.floor(height_1 * aspectRatio);
      }
      var area = width_1 * height_1;
      if (area > bestLayout.area) {
        bestLayout = {
          area: area,
          width: width_1,
          height: height_1,
          rows: rows,
          cols: cols_1,
        };
      }
    }
    return bestLayout;
  }
  var _a = calculateLayout(screenWidth, screenHeight, videoCount, aspectRatio),
    width = _a.width,
    height = _a.height,
    cols = _a.cols;
  gallery.style.setProperty("--width", width + "px");
  gallery.style.setProperty("--height", height + "px");
  gallery.style.setProperty("--cols", cols + "");
}
