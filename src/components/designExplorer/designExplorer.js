import React, { useCallback, useRef } from "react";
import { useState, useEffect } from "react";
import { PropTypes } from "prop-types";
import Viewport from "./viewport";
import "./DesignExplorer.scss";
import ZoomControl from "../zoomControl";

function DesignExplorer(props) {
  const imgList = props.src;

  const defaultZoomLevel = props.initialZoom || 100;
  const [zoomLevel, setZoomLevel] = useState(props.initialZoom || 100);
  const [viewportSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [viewingSection, setCurrentViewingSection] = useState("");

  // zoom hint message
  const ZOOM_HINT_TIME = 500;
  const [zoomInteractionHint, setZoomInteractionHint] = useState(false);
  const zoomHintTimer = useRef(null);

  const containerRef = useRef(null);

  const sectionNames = [
    "Viewing your tasks",
    "Contacting a client",
    "Contacting a helper",
    "Leaderboard",
    "Check in - Before",
    "Check in - During and after",
    "Leaving Reviews",
  ];
  var sections = imgList.map((val, index) => {
    return {
      title: sectionNames[index],
      src: val,
    };
  });

  // for testing the platform so it shows the correct hints
  // https://stackoverflow.com/questions/10527983/best-way-to-detect-mac-os-x-or-windows-computers-with-javascript-or-jquery
  function isMacintosh() {
    return navigator.platform.indexOf("Mac") > -1;
  }

  function isWindows() {
    return navigator.platform.indexOf("Win") > -1;
  }

  function viewportZoomHandler(zoom) {
    setZoomLevel(zoom * 100);
  }

  function zoomChangeHandler(zoomLevel) {
    setZoomLevel(zoomLevel);
  }

  function scrollHandler(e) {
    if (!e.ctrlkey || !e.metaKey) {
      setZoomInteractionHint(true);

      // How do I know when I've stopped scrolling?
      //https://stackoverflow.com/questions/4620906/how-do-i-know-when-ive-stopped-scrolling

      // if the timer exist already(menaing the user still scrolling wihtout zooming)
      // show reset the timer
      if (zoomHintTimer.current != null) clearTimeout(zoomHintTimer.current);

      // set a timer for how long the zoom hint text display
      zoomHintTimer.current = setTimeout(
        () => setZoomInteractionHint(false),
        ZOOM_HINT_TIME
      );
    } else {
      setZoomInteractionHint(false);
    }
  }

  function windowResizeHandler() {
    // refresh the window size
    setWindowSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });
  }

  function hashChangeHandler() {
    setCurrentViewingSection(
      decodeURIComponent(window.location.hash.split("#")[1])
    );
  }
  useEffect(() => {
    window.addEventListener("resize", windowResizeHandler);
    window.addEventListener("hashchange", hashChangeHandler);
    window.addEventListener("scroll", scrollHandler);
    return () => {
      window.removeEventListener("resize", windowResizeHandler);
      window.removeEventListener("hashchange", hashChangeHandler);
      window.removeEventListener("scroll", scrollHandler);
    };
  }, [containerRef]);

  return (
    <div ref={containerRef} className="design-explorer-container">
      <div className="credit-text">Crafted with ReactJS by Alvin Leung</div>
      <ZoomControl
        zoomLevel={zoomLevel}
        onZoomChange={zoomChangeHandler}
        defaultZoomLevel={defaultZoomLevel}
      />
      <div className="viewport-container">
        <Viewport
          width={viewportSize.width}
          height={viewportSize.height}
          src={imgList}
          sections={sections}
          targetSection={viewingSection}
          targetZoom={zoomLevel / 100}
          onZoom={viewportZoomHandler}
          cols={props.cols ? props.cols : 1}
          scrollToPan={props.scrollToPan ? props.scrollToPan : false}
        />
      </div>
      <div
        className={
          zoomInteractionHint
            ? "zoom-interaction-hint"
            : "zoom-interaction-hint zoom-interaction-hint--hidden"
        }
      >
        {isWindows() && <span>Hold Ctrl and scroll to zoom in</span>}
        {isMacintosh() && <span>Hold &#8984; and scroll to zoom in</span>}
      </div>
    </div>
  );
}

DesignExplorer.propTypes = {
  scrollToPan: PropTypes.bool,
  src: PropTypes.array,
  cols: PropTypes.number, // the amount of columns in the layout
  initialZoom: PropTypes.number,
};

export default DesignExplorer;
