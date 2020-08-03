/*
 * this componenet takes in the input controlling signal
 * from Viewport and render it on screen.
 */
const DEBUG_MODE = true;
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

// ref to the canvas
let canvas,
  ctx = null;

// interface for the renderer
function ViewportRenderer(_canvas) {
  // initialize the canvas
  canvas = _canvas;
  ctx = canvas.getContext("2d");

  return {
    initialize: function (_imgList) {
      generateOptimizedImage(_imgList);
      imgList = _imgList;
      _initialized = true;
    },
    isInitialized: function () {
      return _initialized;
    },
    update: function (mousePosition, zoom, dragging) {
      updateLogic(mousePosition, zoom, dragging);
      repaintCanvas(canvas, ctx, imgList, mousePosition, zoom);
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
    currentCameraVel.x = zoomDifference.x;
    currentCameraVel.y = zoomDifference.y;

    targetCameraPos.x = currentCameraPos.x + currentCameraVel.x;
    targetCameraPos.y = currentCameraPos.y + currentCameraVel.y;
  } else {
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

      console.log(cameraMouseOffset);
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

  if (!zooming) {
    // update camera pos, camera trail the target point if it's not zooming
    currentCameraVel.x = (targetCameraPos.x - currentCameraPos.x) * 0.25; // add alittle bit of trailing effect
    currentCameraVel.y = (targetCameraPos.y - currentCameraPos.y) * 0.25; // add alittle bit of trailing effect
  }

  // interpolate the camera position
  currentCameraPos.x += currentCameraVel.x;
  currentCameraPos.y += currentCameraVel.y;
}

let prevZoom = 0;
// RENDER
function repaintCanvas(canvas, ctx, imgs, mouseScreenPosition, zoom) {
  // clear the canvas
  ctx.clearRect(0, 0, window.innerHeight, window.innerWidth);

  // prepare transformation for camera movement transformation
  ctx.save();

  const zoomPivot = {
    x: canvas.width / 2,
    y: canvas.height / 2,
  };

  // move camera
  ctx.scale(currentZoom, currentZoom);
  ctx.translate(-currentCameraPos.x, -currentCameraPos.y); // move everything to center
  // zoom in a point using scale and translate
  //https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate

  // render images
  renderImages(ctx, imgs, true);

  // screen to world pos projection is working

  if (DEBUG_MODE) {
    // render mouse world position
    const mouseWorldPos = screenToWorldPos(mouseScreenPosition);
    ctx.beginPath();
    ctx.rect(mouseWorldPos.x, mouseWorldPos.y, 10, 10);
    ctx.fillStyle = "blue";
    ctx.fill();

    // reset transformation
    ctx.restore();
  }

  // display the debug information and round to 2 deicmals
  if (DEBUG_MODE) {
    renderPos(ctx, "mouse screen", mouseScreenPosition, 20, 50);
    renderPos(ctx, "camera pos", currentCameraPos, 20, 80);
    ctx.fillText("zoom " + currentZoom.toFixed(2), 20, 110);
  }
}
// ===============================================================
// end of main cycle
// ===============================================================

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
  const paddingBetweenImages = 0;
  let currentDrawY = 0;
  for (let i = 0; i < imgs.length; i++) {
    // render all the images
    if (lowQuality) {
      ctx.drawImage(
        lowFidelityImges[i],
        0,
        currentDrawY,
        imgs[i].width,
        imgs[i].height
      );
    } else {
      ctx.drawImage(imgs[i], 0, currentDrawY);
    }

    currentDrawY += imgs[i].height + paddingBetweenImages;
  }
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

export default ViewportRenderer;