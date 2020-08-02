import React, { useState, useRef, useEffect, useCallback } from "react";
import { PropTypes } from "prop-types";
import "./Viewport.scss";

const DEBUG_MODE = true;

// global variables in this component
let cameraPosition = { x: 0, y: 0 };
let zoom = 0;

let imageLoaded = false;
let viewportInitialized = false;

// Canvas Implementation of the
function Viewport(props) {
  const canvasWidth = 1920;
  const canvasHeight = 1080;

  const canvasRef = useRef(null);

  useEffect(() => {
    // initialise the canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Load the svg files
    let loadedImage = 0;
    const imgList = props.src.map((imgUrl) => {
      const img = new Image();
      img.src = imgUrl;
      img.addEventListener("load", () => {
        console.log("Viewport loaded image: " + imgUrl);
        loadedImage++;

        if (loadedImage === imgList.length) {
          // all the image is loaded
          imageLoaded = true;
          console.log("All images loaded");
        }
      });

      return img;
    });

    // canvas update
    const update = (deltaTime) => {
      if (imageLoaded) {
        // begin the renders
        if (!viewportInitialized) {
          initViewport(imgList);
          viewportInitialized = true;
        }

        updateLogic(cameraPosition, zoom);

        // clear the canvas
        ctx.clearRect(0, 0, window.innerHeight, window.innerWidth);
        // render the content
        repaintCanvas(canvas, ctx, imgList, cameraPosition, zoom);
      }
      requestAnimationFrame(update);
    };

    // begin the update cycle
    update();
  }, []);

  // the only way that the canvas code can access these var :(
  cameraPosition = props.cameraPosition;
  zoom = props.zoom;

  return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />;
}

// the component take in these props
Viewport.propTypes = {
  mouseX: PropTypes.number,
  mouseY: PropTypes.number,
  zoom: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  src: PropTypes.arrayOf(PropTypes.imgs),
};

// ================================+
// CODE FOR RENDERING STUFF ON CANVAS
// ================================+

// ZOOM
let currentZoom = 1;
let currentZoomChanges = 0; // basically velocity of zoom

// CAMERA
let currentCameraPos = { x: 0, y: 0 };
let currentCameraVel = { x: 0, y: 0 };

// IMAGE OPTIMISATION
let lowFidelityImges = [];

// ===============================================================
// begin main cycle
// ===============================================================

// INITIALIZATION
function initViewport(imgs) {
  lowFidelityImges = imgs.map((img) => cacheLowfidelityRender(img, 0.5));
}

// UPDATE
function updateLogic(targetCameraPosition, targetZoom) {
  // update zoom

  currentZoomChanges = (targetZoom - currentZoom) * 0.2; // add a little bit of trailing effect on the zoom
  currentZoom += currentZoomChanges;

  // update camera pos
  currentCameraVel.x = (targetCameraPosition.x - currentCameraPos.x) * 0.25; // add alittle bit of trailing effect
  currentCameraVel.y = (targetCameraPosition.y - currentCameraPos.y) * 0.25; // add alittle bit of trailing effect

  currentCameraPos.x += currentCameraVel.x;
  currentCameraPos.y += currentCameraVel.y;
}

let prevZoom = 0;
// RENDER
function repaintCanvas(canvas, ctx, imgs, cameraPosition, zoom) {
  // prepare transformation for camera movement
  ctx.save();

  const offsetPos = {
    x: currentCameraPos.x,
    y: currentCameraPos.y,
  };

  const zoomPivot = {
    x: canvas.width / 2,
    y: canvas.height / 2,
  };

  // move camera
  ctx.translate(zoomPivot.x, zoomPivot.y);
  ctx.scale(currentZoom, currentZoom);
  ctx.translate(offsetPos.x, offsetPos.y); // move everything to center
  // zoom in a point using scale and translate
  //https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate

  // render images
  renderImages(ctx, imgs, true);

  // reset transformation
  ctx.restore();

  // display the debug information and round to 2 deicmals
  if (DEBUG_MODE) {
    ctx.fillText("camera x " + currentCameraPos.x.toFixed(2), 20, 50);
    ctx.fillText("camera y " + currentCameraPos.y.toFixed(2), 20, 65);
    ctx.fillText("zoom " + currentZoom.toFixed(2), 20, 80);
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

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export default Viewport;

//resources

// using SVG and canvas
// https://levelup.gitconnected.com/draw-an-svg-to-canvas-and-download-it-as-image-in-javascript-f7f7713cf81f

// using canvas and react hooks
// https://itnext.io/using-react-hooks-with-canvas-f188d6e416c0
