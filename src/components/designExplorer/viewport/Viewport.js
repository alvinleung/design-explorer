/*
 * this componenet handles
 * 1 - User Input for munipulation of the viewport
 * 2 - loading of the image files
 * 3 - managing the ViewportRenderer
 */

import React, { useState, useRef, useEffect } from "react";
import { PropTypes } from "prop-types";
import ViewportRenderer from "./ViewportRenderer.js";
import "./Viewport.scss";

let _imageLoaded = false;

// Canvas Implementation of the
function Viewport(props) {
  const canvasWidth = props.width;
  const canvasHeight = props.height;

  const [mouseHovering, setMouseHovering] = useState(false);

  // control zooming
  const ZOOM_SPEED_FACTOR = 0.005;
  const MAX_ZOOM = 1.5;
  const MIN_ZOOM = 0.2;
  const zoom = useRef(1);

  // control panning
  // const [dragging, setDragging] = useState(false);
  const PAN_SPEED_FACTOR = 5;
  const dragging = useRef(false);
  const mousePosition = useRef({ x: 0, y: 0 });

  // the canvas element
  const [viewportPosition, setViewportPosition] = useState({ x: 0, y: 0 }); // the coordinate of the canvas element on page
  const canvasRef = useRef(null);

  //sections
  const viewportRendererRef = useRef(null);

  function mouseDownHandler(e) {
    // enter the moving state
    e.stopPropagation();
    e.preventDefault();

    // enter dragging mode
    dragging.current = true;
  }

  function mouseUpHandler(e) {
    // exit dragging mode
    dragging.current = false;
  }

  function mouseWheelHandler(e) {
    // trigger pinch to zoom with "ctrl key"
    //https://stackoverflow.com/questions/15416851/catching-mac-trackpad-zoom

    if (e.nativeEvent.ctrlKey || e.nativeEvent.metaKey) {
      // calculate zoom value
      const newZoomValue =
        zoom.current - e.nativeEvent.deltaY * ZOOM_SPEED_FACTOR;

      // set the zoom level
      zoom.current = clamp(newZoomValue, MIN_ZOOM, MAX_ZOOM);

      // callback for the zoom
      if (props.onZoom) props.onZoom(zoom.current);
    } else {
      if (props.scrollToPan) {
        // pan the camera around base on the scroll
        const currentCameraPos = viewportRendererRef.current.getCurrentCameraPos();

        viewportRendererRef.current.pointCameraTo({
          x:
            currentCameraPos.x +
            (e.nativeEvent.deltaX * PAN_SPEED_FACTOR) / zoom.current,
          y:
            currentCameraPos.y +
            (e.nativeEvent.deltaY * PAN_SPEED_FACTOR) / zoom.current,
        });
      }
    }
    return false;
  }

  function mouseMoveHandler(e) {
    // grab the mouse position relative to the canvas top left
    // and save it to the mousePosition ref
    mousePosition.current = {
      x: e.nativeEvent.pageX - viewportPosition.x,
      y: e.nativeEvent.pageY - viewportPosition.y,
    };

    if (dragging.current && props.onPan) {
      props.onPan();
    }
  }

  function mouseOverHandler(e) {
    // lock trackpad panning when the user mouse over this element
    setMouseHovering(true);
  }

  function mouseOutHandler(e) {
    setMouseHovering(false);
  }

  useEffect(() => {
    function gestureStartHandler(e) {
      e.preventDefault();
      // when the the user start moving with the trackpad
      // the viewport start panning
    }

    function gestureEndHandler(e) {
      e.preventDefault();
    }
    // create event listener for handling trackpad panning
    canvasRef.current.addEventListener("touchstart", gestureStartHandler);
    canvasRef.current.addEventListener("touchend", gestureEndHandler);
    return () => {
      canvasRef.current.removeEventListener("touchstart", gestureStartHandler);
      canvasRef.current.removeEventListener("touchend", gestureEndHandler);
    };
  }, []);

  function calculateViewportPosition() {
    // calculate canvas position when state changes
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setViewportPosition({
      // you need to add scroll position to get the accurate value
      // because sometimes the page loaded on at the top, but at the middle
      x: window.scrollX + canvasRect.left,
      y: window.scrollY + canvasRect.top,
    });
  }

  useEffect(() => {
    window.addEventListener("load", calculateViewportPosition);
    window.addEventListener("resize", calculateViewportPosition);
    return () => {
      window.removeEventListener("resize", calculateViewportPosition);
      window.removeEventListener("load", calculateViewportPosition);
    };
  }, []);

  useEffect(() => {
    // initialise the canvas
    const viewportRenderer = ViewportRenderer(canvasRef.current);

    // Load the svg files
    let loadedImage = 0;
    const imgList = props.sections.map((currentSection) => {
      // section:
      // - title:string
      // - src:string
      const img = new Image();
      const imgUrl = currentSection.src;
      img.src = imgUrl;
      img.addEventListener("load", () => {
        console.log("Viewport loaded image: " + imgUrl);

        loadedImage++;

        // call back when there is update
        if (props.onProgress)
          props.onProgress(Math.floor((loadedImage / imgList.length) * 100));

        if (loadedImage === imgList.length) {
          // all the image is loaded
          _imageLoaded = true;

          console.log("All images loaded, initialize ViewportRenderer");

          // initialize the viewport renderer using the loaded image list
          viewportRenderer.initialize(imgList, props.cols, zoom.current);
        }
      });

      return img;
    });

    // the canvas animation loop begins here
    const update = (deltaTime) => {
      if (viewportRenderer.isInitialized()) {
        viewportRenderer.update(
          mousePosition.current,
          zoom.current,
          dragging.current
        );
      }

      requestAnimationFrame(update);
    };
    // begin the update cycle
    update();

    viewportRendererRef.current = viewportRenderer;
  }, []); // no depency, make sure the code is only called once

  useEffect(() => {
    //go to target section when the target section changes
    // get target section image index
    const targetSectionIndex = props.sections.findIndex(
      (item) => item.title === props.targetSection
    );
    console.log("going to target section: " + props.targetSection);

    // jump to that section
    viewportRendererRef.current.pointCameraToImage(targetSectionIndex);
  }, [props.targetSection]);

  useEffect(() => {
    if (!mouseHovering) return;
    const preventDefaultWheelBehaviour = (e) => {
      // stop the document from scrolling when the user mouse over this

      // the scrolltopan is enabled or the user is zooming in using their mouse
      if (props.scrollToPan || e.ctrlKey || e.metaKey) e.preventDefault();
    };
    window.addEventListener("wheel", preventDefaultWheelBehaviour, {
      passive: false,
    });
    return () => {
      window.removeEventListener("wheel", preventDefaultWheelBehaviour);
    };
  }, [mouseHovering]);

  // this effect handle when the user
  useEffect(() => {
    if (props.targetZoom) {
      zoom.current = props.targetZoom;

      // mouse is on the control, meaning that the source is come from the control
      if (!mouseHovering) {
        // const currentCameraPos = viewportRendererRef.current.getCurrentCameraPos();
        const currentScreenCenterInWorld = viewportRendererRef.current.screenToWorldPos(
          {
            x: canvasWidth / 2,
            y: canvasHeight / 2,
          }
        );

        mousePosition.current = viewportRendererRef.current.worldToScreenPos({
          x: clamp(
            currentScreenCenterInWorld.x,
            canvasWidth / 2,
            viewportRendererRef.current.getDocumentWidth()
          ),
          y: clamp(
            currentScreenCenterInWorld.y,
            canvasHeight / 2,
            viewportRendererRef.current.getDocumentHeight()
          ),
        });
      }
    }
  }, [props.targetZoom]);
  return (
    <canvas
      style={{ touchAction: "none" }}
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onMouseMove={mouseMoveHandler}
      onMouseOver={mouseOverHandler}
      onMouseOut={mouseOutHandler}
      onWheel={mouseWheelHandler}
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
    />
  );
}

// the component take in these props
Viewport.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  targetZoom: PropTypes.number,
  targetSection: PropTypes.string,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      src: PropTypes.string,
    })
  ),
  cols: PropTypes.number, // specify how much columns in the layout
  onZoom: PropTypes.func,
  onPan: PropTypes.func,
  onProgress: PropTypes.func,
  scrollToPan: PropTypes.bool,
};

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// utitlitiy to detect wether its trackpad or mouse input
// https://stackoverflow.com/questions/10744645/detect-touchpad-vs-mouse-in-javascript
function detectTrackPad(e) {
  var isTrackpad = false;
  if (e.wheelDeltaY) {
    if (Math.abs(e.wheelDeltaY) !== 120) {
      isTrackpad = true;
    }
  } else if (e.deltaMode === 0) {
    isTrackpad = true;
  }
  return isTrackpad;
}

export default Viewport;

//resources

// using SVG and canvas
// https://levelup.gitconnected.com/draw-an-svg-to-canvas-and-download-it-as-image-in-javascript-f7f7713cf81f

// using canvas and react hooks
// https://itnext.io/using-react-hooks-with-canvas-f188d6e416c0
