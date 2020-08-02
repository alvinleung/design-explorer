import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Viewport.scss";

// purpose of this component

// Referenced tutorial
// https://stackoverflow.com/questions/20926551/recommended-way-of-making-react-component-div-draggable

function Viewport(props) {
  // mode toggles for the components
  const [dragging, setDragging] = useState(false);

  // managing zoom
  const ZOOMMODE_IDLE = 0;
  const ZOOMMODE_IN = 1;
  const ZOOMMODE_OUT = 2;

  const [zooming, setZooming] = useState(ZOOMMODE_IDLE);

  const ZOOM_STEP = 10;
  const MAX_ZOOM = 100;
  const MIN_ZOOM = -400;
  const [viewportZoom, setViewportZoom] = useState(1);
  // the screen coordinate of the zoom point
  const [zoomPivot, setZoomPivot] = useState({ x: 0, y: 0 });

  // handling the position panning state
  const [viewportOffsetPos, setViewportOffsetPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // grab the html reference of the container to get the beginning position
  const viewportContainerRef = useRef(null);
  const viewportPannerRef = useRef(null);

  function mouseClickHandler(e) {
    if (zooming === ZOOMMODE_IN) {
      setViewportZoom(viewportZoom + ZOOM_STEP);
    } else if (zooming === ZOOMMODE_OUT) {
      setViewportZoom(viewportZoom - ZOOM_STEP);
    }
  }

  function mouseDownHandler(e) {
    // enter the moving state
    e.stopPropagation();
    e.preventDefault();

    // enter dragging mode
    setDragging(true);

    // initialise drag offset value
    const viewportElmPagePos = {
      x: viewportContainerRef.current.getBoundingClientRect().left,
      y: viewportContainerRef.current.getBoundingClientRect().top,
    };

    setDragOffset({
      x: e.nativeEvent.pageX - viewportElmPagePos.x - viewportOffsetPos.x,
      y: e.nativeEvent.pageY - viewportElmPagePos.y - viewportOffsetPos.y,
    });

    // disable smooth scroll in css, or else it will glitch when panning with scrollTop, scrollLeft
    viewportContainerRef.current.style.scrollBehavior = "unset";
  }

  function mouseUpHandler(e) {
    // exit dragging mode
    setDragging(false);

    // reset the smooth scroll behaviour
    viewportContainerRef.current.style.scrollBehavior = "smooth";
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
    const newZoomValue = viewportZoom - e.nativeEvent.deltaY * 10;
    // set the zoom level
    setViewportZoom(clamp(newZoomValue, MIN_ZOOM, MAX_ZOOM));

    // set the focus point of zoom
    // TODO: create figure out how to have it zoom according to the mouse pointing position
    const viewportRect = viewportContainerRef.current.getBoundingClientRect();
    setZoomPivot({
      x: viewportRect.width / 2,
      y: viewportRect.height / 2,
    });
  }

  function mouseMoveHandler(e) {
    if (dragging) {
      // more about clientX/pageX/screenX
      // https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y/9335517

      const maxPos = {
        x: 0,
        y: 0,
      };
      const minPos = {
        x: -(
          viewportContainerRef.current.scrollWidth -
          viewportContainerRef.current.clientWidth
        ),
        y: -(
          viewportContainerRef.current.scrollHeight -
          viewportContainerRef.current.clientHeight
        ),
      };

      setViewportOffsetPos({
        // for some reason react glitches when we use offsetX
        x: clamp(e.nativeEvent.pageX - dragOffset.x, minPos.x, maxPos.x),
        y: clamp(e.nativeEvent.pageY - dragOffset.y, minPos.y, maxPos.y),
      });
    }
  }

  // move the viewport
  if (viewportContainerRef.current) {
    viewportContainerRef.current.scrollLeft = -viewportOffsetPos.x;
    viewportContainerRef.current.scrollTop = -viewportOffsetPos.y;
  }

  // code for updating the viewport position when external code modify the scroll position
  const scrollHandler = useCallback(
    (e) => {
      // setViewportOffsetPos({
      //   x: -viewportContainerRef.current.scrollLeft,
      //   y: -viewportContainerRef.current.scrollTop,
      // });
    },
    [setViewportOffsetPos]
  );
  useEffect(() => {
    viewportContainerRef.current.addEventListener("scroll", scrollHandler);

    //
    return () => {
      viewportContainerRef.current.removeEventListener("scroll", scrollHandler);
    };
  }, [viewportContainerRef, scrollHandler]);

  return (
    <div
      className="viewport-container"
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onMouseMove={mouseMoveHandler}
      onClick={mouseClickHandler}
      onWheel={mouseWheelHandler}
      ref={viewportContainerRef}
    >
      {/* outer div control the panning */}
      <div className="viewport-panner">
        {/* inner div control the zooming */}
        <div
          className="viewport-zoomer"
          style={{
            transformOrigin: `${-viewportOffsetPos.x + zoomPivot.x}px ${
              -viewportOffsetPos.y + zoomPivot.y
            }px `,
            transform: `perspective(500px) translate3d(0,0, ${viewportZoom}px)`,
          }}
        >
          {props.src.map((imgUrl, index) => {
            return (
              <img id={index} key={index} src={imgUrl} alt="Design Section" />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export default Viewport;
