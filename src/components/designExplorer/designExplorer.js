import React from "react";
import { useState, useRef } from "react";
import { PropTypes } from "prop-types";
import Viewport from "./viewport";

// utility function for min-maxing
function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function DesignExplorer() {
  const imgList = [
    `${process.env.PUBLIC_URL}/img/8 Viewing your tasks.svg`,
    `${process.env.PUBLIC_URL}/img/9 Contacting a client.svg`,
    `${process.env.PUBLIC_URL}/img/10 Contacting a helper.svg`,
  ];

  // static parameters
  const ZOOM_SPEED_FACTOR = 0.02;
  const MAX_ZOOM = 1.5;
  const MIN_ZOOM = 0.5;
  const VIEWPORT_WIDTH = 1920;
  const VIEWPORT_HEIGHT = 1080;

  // for controlling the viewports
  const [dragging, setDragging] = useState(false);
  const [viewportZoom, setViewportZoom] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // refs
  const viewportContainerRef = useRef(null);

  function mouseDownHandler(e) {
    // enter the moving state
    e.stopPropagation();
    e.preventDefault();

    // initialize the dragging parameter
    const viewportElmPagePos = {
      x: viewportContainerRef.current.getBoundingClientRect().left,
      y: viewportContainerRef.current.getBoundingClientRect().top,
    };

    setDragOffset({
      x: e.nativeEvent.pageX - viewportElmPagePos.x - viewportCameraPos.x,
      y: e.nativeEvent.pageY - viewportElmPagePos.y - viewportCameraPos.y,
    });

    // enter dragging mode
    setDragging(true);
  }

  function mouseUpHandler(e) {
    // exit dragging mode
    setDragging(false);
  }

  function mouseWheelHandler(e) {
    // stop the document from scrolling when the user mouse over this
    e.nativeEvent.preventDefault();

    // pan around the viewport using scroll wheel when the zooming mode is not active
    // setViewportOffsetPos({
    //   x: viewportOffsetPos.x - e.nativeEvent.deltaX,
    //   y: viewportOffsetPos.y - e.nativeEvent.deltaY,
    // });

    // calculate zoom value
    const newZoomValue =
      viewportZoom - e.nativeEvent.deltaY * ZOOM_SPEED_FACTOR;
    // set the zoom level
    setViewportZoom(clamp(newZoomValue, MIN_ZOOM, MAX_ZOOM));
  }

  function mouseMoveHandler(e) {
    if (dragging) {
      // grab the mouse position relative to the canvas top left
      setViewportCameraPos({
        x: e.nativeEvent.pageX - dragOffset.x,
        y: e.nativeEvent.pageY - dragOffset.y,
      });
    }
  }

  return (
    <div
      ref={viewportContainerRef}
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onMouseMove={mouseMoveHandler}
      onWheel={mouseWheelHandler}
      className="viewport-container"
    >
      <Viewport
        mouseX={mousePosition.x}
        mouseY={mousePosition.y}
        zoom={viewportZoom}
        width={VIEWPORT_WIDTH}
        height={VIEWPORT_HEIGHT}
        src={imgList}
      />
    </div>
  );
}

export default DesignExplorer;
