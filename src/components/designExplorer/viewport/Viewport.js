/*
 * this componenet handles
 * 1 - User Input for munipulation of the viewport
 * 2 - loading of the image files
 * 3 - managing the ViewportRenderer
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PropTypes } from "prop-types";
import ViewportRenderer from "./ViewportRenderer.js";
import "./Viewport.scss";

let _imageLoaded = false;

// Canvas Implementation of the
function Viewport(props) {
  const canvasWidth = props.width;
  const canvasHeight = props.height;

  // control zooming
  const ZOOM_SPEED_FACTOR = 0.02;
  const MAX_ZOOM = 1.5;
  const MIN_ZOOM = 0.2;
  const zoom = useRef(1);

  // control panning
  // const [dragging, setDragging] = useState(false);

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

    // initialize the dragging parameter
    // const viewportRect = canvasRef.current.getBoundingClientRect();

    // setDragOffset({
    //   x: e.nativeEvent.pageX - viewportRect.left - mousePosition.x,
    //   y: e.nativeEvent.pageY - viewportRect.top - mousePosition.y,
    // });

    // enter dragging mode
    dragging.current = true;
  }

  function mouseUpHandler(e) {
    // exit dragging mode
    dragging.current = false;
  }

  function mouseWheelHandler(e) {
    // stop the document from scrolling when the user mouse over this
    e.nativeEvent.preventDefault();

    // calculate zoom value
    const newZoomValue =
      zoom.current - e.nativeEvent.deltaY * ZOOM_SPEED_FACTOR;
    // set the zoom level

    zoom.current = clamp(newZoomValue, MIN_ZOOM, MAX_ZOOM);
  }

  function mouseMoveHandler(e) {
    if (dragging) {
      // grab the mouse position relative to the canvas top left
      // and save it to the mousePosition ref
      mousePosition.current = {
        x: e.nativeEvent.pageX - viewportPosition.x,
        y: e.nativeEvent.pageY - viewportPosition.y,
      };
    }
  }

  useEffect(() => {
    // calculate canvas position when state changes
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setViewportPosition({
      x: canvasRect.left,
      y: canvasRect.top,
    });
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

        if (loadedImage === imgList.length) {
          // all the image is loaded
          _imageLoaded = true;

          console.log("All images loaded, initialize ViewportRenderer");

          // initialize the viewport renderer using the loaded image list
          viewportRenderer.initialize(imgList);
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

  return (
    <canvas
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onMouseMove={mouseMoveHandler}
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
  targetSection: PropTypes.string,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      src: PropTypes.string,
    })
  ),
  onZoom: PropTypes.func,
};

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
