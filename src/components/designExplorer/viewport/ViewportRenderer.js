/*
 * this componenet takes in the input controlling signal
 * from Viewport and render it on screen.
 */
const DEBUG_MODE = false;
// global variables in this component
let mousePosition = { x: 0, y: 0 };
let zoom = 0;
let zooming = false;

// Whether the component is initialised
let _initialized = false;

// ZOOM
let currentZoom = 1;
let currentZoomChanges = 0; // basically velocity of zoom

// CAMERA
let currentCameraPos = { x: 0, y: 0 };
let currentCameraVel = { x: 0, y: 0 };
let targetCameraPos = { x: 0, y: 0 };

// mouse
let mouseDragBeginPosition = { x: 0, y: 0 };

// IMAGE OPTIMISATION
let imgList = [];
let lowFidelityImges = [];
const paddingBetweenImages = 0;
const DOCUMENT_PADDING = 100;
let documentWidth = 0;
let documentHeight = 0;

// ref to the canvas
let canvas,
  ctx = null;

// callback functions
let zoomEndCallback = () => {};
let panEndCallback = () => {};

// update functions
let deltaTime = 0;
let realDeltaTime = 0;
let currentUpdateTime = Date.now();
let lastUpdateTime = currentUpdateTime;
const TIME_SCALE = 0.1;

// interface for the renderer
function ViewportRenderer(_canvas) {
  // initialize the canvas
  canvas = _canvas;
  ctx = canvas.getContext("2d");

  return {
    initialize: function (_imgList) {
      generateOptimizedImage(_imgList);
      imgList = _imgList;
      calculateDocumentDimension(_imgList);
      _initialized = true;
    },
    isInitialized: function () {
      return _initialized;
    },
    update: function (mousePosition, zoom, dragging) {
      updateDeltaTime();
      updateLogic(mousePosition, zoom, dragging);
      repaintCanvas(canvas, ctx, imgList, mousePosition, zoom);
    },

    zoomTo: function (_targetZoom) {
      // currentZoom = _targetZoom;
      console.log("zooming to target: " + _targetZoom);
    },

    pointCameraTo: function (_targetCameraPos) {
      targetCameraPos.x = _targetCameraPos.x;
      targetCameraPos.y = _targetCameraPos.y;
    },

    getCurrentCameraPos: function () {
      return {
        x: currentCameraPos.x,
        y: currentCameraPos.y,
      };
    },

    pointCameraToImage: function (img) {
      const imgIndex =
        img instanceof HTMLImageElement ? imgList.indexOf(img) : img;

      if (!imgList[imgIndex]) {
        console.warn("Can't find img index " + img);
        return;
      }

      // calculate the center position
      const cameraX = -canvas.width / currentZoom / 2;

      // calculate where the camera should scroll to
      let cumulativeImagePos = 0;
      for (let i = 0; i < imgIndex; i++) {
        cumulativeImagePos += imgList[i].height + paddingBetweenImages;
      }
      targetCameraPos.x = cameraX;
      targetCameraPos.y = cumulativeImagePos;
    },
    onPanEnd: function (callback) {
      panEndCallback = callback;
    },
    onZoomEnd: function (callback) {
      zoomEndCallback = callback;
    },
  };
}

// ===============================================================
// begin main cycle
// ===============================================================

// INITIALIZATION
function generateOptimizedImage(imgs) {
  lowFidelityImges = imgs.map((img) => cacheLowfidelityRender(img, 0.5));
}

function calculateDocumentDimension(imgList) {
  let fardestPointX = 0;
  let fardestPointY = 0;
  for (let i = 0; i < imgList.length; i++) {
    const docFardestPointX = imgList[i].width;
    if (docFardestPointX > fardestPointX) fardestPointX = docFardestPointX;
    fardestPointY = fardestPointY + imgList[i].height + paddingBetweenImages;
  }
  documentWidth = fardestPointX;
  documentHeight = fardestPointY;
}

let draggingMode = false;
let cameraMouseOffset = { x: 0, y: 0 };
let mouseBeginDragPosition = { x: 0, y: 0 };
// UPDATE
function updateLogic(mouseScreenPosition, targetZoom, dragging) {
  const mouseWorldPosBeforeZoom = screenToWorldPos(mouseScreenPosition); // the position where the mouse is point in the world

  // update zoom
  currentZoomChanges = (targetZoom - currentZoom) * 0.2; // add a little bit of trailing effect on the zoom
  currentZoom += currentZoomChanges;

  // if it's zooming
  if (currentZoomChanges.toFixed(3) != 0) {
    zooming = true;
    // reposition the camera base on where the mouse is pointing
    const mouseWorldPosAfterZoom = screenToWorldPos(mouseScreenPosition);

    const zoomDifference = {
      x: mouseWorldPosBeforeZoom.x - mouseWorldPosAfterZoom.x,
      y: mouseWorldPosBeforeZoom.y - mouseWorldPosAfterZoom.y,
    };

    // trasnlate the camera base on the difference
    const cameraOffsetAmount = {
      x: zoomDifference.x,
      y: zoomDifference.y,
    };

    // tweak the camera position so that it zooms in at the mouse
    currentCameraPos.x += zoomDifference.x;
    currentCameraPos.y += zoomDifference.y;

    // also offset the target camera pos too
    targetCameraPos.x += zoomDifference.x;
    targetCameraPos.y += zoomDifference.y;
  } else {
    if (zooming) zoomEndCallback(currentZoom);
    zooming = false;
  }

  if (dragging) {
    const mousePosInWorld = screenToWorldPos(mouseScreenPosition);

    if (!draggingMode) {
      // getting into dragging mode
      draggingMode = true;
      // calculate the difference between mouse and camera pos
      cameraMouseOffset = {
        x: mousePosInWorld.x - currentCameraPos.x,
        y: mousePosInWorld.y - currentCameraPos.y,
      };
      mouseBeginDragPosition = mousePosInWorld;
    }

    const currentFrameMouseOffset = {
      x: mousePosInWorld.x - mouseBeginDragPosition.x,
      y: mousePosInWorld.y - mouseBeginDragPosition.y,
    };
    targetCameraPos.x = currentCameraPos.x - currentFrameMouseOffset.x;
    targetCameraPos.y = currentCameraPos.y - currentFrameMouseOffset.y;
  } else {
    draggingMode = false;
  }

  // clamping the target camera pos
  // targetCameraPos.x = clamp(
  //   targetCameraPos.x,
  //   -DOCUMENT_PADDING,
  //   documentWidth + DOCUMENT_PADDING - canvas.width / currentZoom
  // );
  // targetCameraPos.y = clamp(
  //   targetCameraPos.y,
  //   -DOCUMENT_PADDING,
  //   documentHeight - canvas.height / currentZoom + DOCUMENT_PADDING
  // );
  // if (targetCameraPos.y)

  // update update the camera velocty base on the target position
  currentCameraVel.x = (targetCameraPos.x - currentCameraPos.x) * 0.2; // add alittle bit of trailing effect
  currentCameraVel.y = (targetCameraPos.y - currentCameraPos.y) * 0.2; // add alittle bit of trailing effect

  // interpolate the camera position
  // constraint the camera movement if it's within bound
  currentCameraPos.x += currentCameraVel.x * deltaTime;
  currentCameraPos.y += currentCameraVel.y * deltaTime;
}

function canMoveHorizontally() {
  return (
    !(currentCameraPos.x < 0 && currentCameraVel.x < 0) &&
    !(
      currentCameraPos.x + canvas.width / currentZoom > documentWidth &&
      currentCameraVel.x > 0
    )
  );
}

function canMoveVertically() {
  return (
    !(currentCameraPos.y < 0 && currentCameraVel.y < 0) &&
    !(
      currentCameraPos.y + canvas.height / currentZoom > documentHeight &&
      currentCameraVel.y > 0
    )
  );
}

let prevZoom = 0;
// RENDER
function repaintCanvas(canvas, ctx, imgs, mouseScreenPosition, zoom) {
  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // prepare transformation for camera movement transformation
  ctx.save();

  // move camera
  ctx.scale(currentZoom, currentZoom);
  ctx.translate(-currentCameraPos.x, -currentCameraPos.y); // move everything to center
  // zoom in a point using scale and translate
  //https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate

  // render images in low quality mode when there is camera movement
  // to make the animation look smoother
  if (zooming || isCameraMoving()) {
    renderImages(ctx, imgs, true);
  } else {
    renderImages(ctx, imgs, false);
  }

  // screen to world pos projection is working

  if (DEBUG_MODE) {
    // render mouse world position
    const mouseWorldPos = screenToWorldPos(mouseScreenPosition);
    ctx.beginPath();
    ctx.rect(mouseWorldPos.x, mouseWorldPos.y, 10, 10);
    ctx.fillStyle = "blue";
    ctx.fill();

    // reset transformation
  }
  ctx.restore();

  // display the debug information and round to 2 deicmals
  if (DEBUG_MODE) {
    renderPos(ctx, "mouse screen", mouseScreenPosition, 20, 50);
    renderPos(ctx, "camera pos", currentCameraPos, 20, 80);
    ctx.fillText("zoom " + currentZoom.toFixed(2), 20, 110);
    ctx.fillText("fps " + Math.round(1000 / realDeltaTime), 20, 130);
  }
}
// ===============================================================
// end of main cycle
// ===============================================================

function updateDeltaTime() {
  currentUpdateTime = Date.now();
  realDeltaTime = currentUpdateTime - lastUpdateTime;
  deltaTime = realDeltaTime * TIME_SCALE;
  lastUpdateTime = currentUpdateTime;
}

// pre render a low fedelity version of the image when zoom to acheive the smooth animation
function cacheLowfidelityRender(img, scaleFactor) {
  const preRenderCanvas = document.createElement("canvas");
  preRenderCanvas.width = img.width * scaleFactor;
  preRenderCanvas.height = img.height * scaleFactor;

  preRenderCanvas
    .getContext("2d")
    .drawImage(img, 0, 0, preRenderCanvas.width, preRenderCanvas.height);

  return preRenderCanvas;
}

function renderPos(ctx, label, value, x, y) {
  ctx.fillText(label + " x " + value.x.toFixed(2), x, y);
  ctx.fillText(label + " y " + value.y.toFixed(2), x, y + 15);
}

function renderImages(ctx, imgs, lowQuality) {
  let currentDrawY = 0;
  for (let i = 0; i < imgs.length; i++) {
    const isImageInBound = isRectInBound(
      0,
      currentDrawY + paddingBetweenImages * i,
      imgs[i].width,
      imgs[i].height
    );
    if (isImageInBound) {
      // render all the images
      if (lowQuality || currentZoom < 0.5) {
        // if the zoom is too small, we don't need recalcualte the high quality
        ctx.drawImage(
          lowFidelityImges[i],
          0,
          currentDrawY,
          imgs[i].width,
          imgs[i].height
        );
      } else {
        // only render high quality image if the img is in bound
        ctx.drawImage(imgs[i], 0, currentDrawY);
      }
    }
    currentDrawY += imgs[i].height + paddingBetweenImages;
  }
}

function isCameraMoving() {
  return (
    currentCameraVel.x.toFixed(2) != 0 || currentCameraVel.y.toFixed(2) != 0
  );
}

function isRectInBound(x, y, w, h) {
  let viewportWidthInWorld = canvas.width / currentZoom;
  let viewportHeightInWorld = canvas.height / currentZoom;
  return (
    x < currentCameraPos.x + viewportWidthInWorld &&
    x + w > currentCameraPos.x &&
    y < currentCameraPos.y + viewportHeightInWorld &&
    y + h > currentCameraPos.y
  );
}
function checkCollisionRect(x, y, w, h, x2, y2, w2, h2) {
  return x < x2 + w2 && x + w > x2 && y < y2 + h2 && y + h > y2;
}

// mapping of screen position to world position
function screenToWorldPos(screenPos) {
  return {
    x: screenPos.x / currentZoom + currentCameraPos.x,
    y: screenPos.y / currentZoom + currentCameraPos.y,
  };
}

function worldToScreenPos(worldPos) {
  // word coordinate would be
  return {
    x: (worldPos.x - currentCameraPos.x) * currentZoom,
    y: (worldPos.y - currentCameraPos.y) * currentZoom,
  };
}

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export default ViewportRenderer;
