import React, { useCallback, useRef } from "react";
import { useState, useEffect } from "react";
import { PropTypes } from "prop-types";
import Viewport from "./viewport";
import SectionNavigation from "./sectionNavigation";
import "./DesignExplorer.scss";
import ZoomControl from "../zoomControl";

// utility function for min-maxing
function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function DesignExplorer(props) {
  const imgList = props.src;

  const defaultZoomLevel = 20;
  const [zoomLevel, setZoomLevel] = useState(20);
  const [viewportSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [viewingSection, setCurrentViewingSection] = useState("");

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

  function viewportZoomHandler(zoom) {
    setZoomLevel(zoom * 100);
  }

  function zoomChangeHandler(zoomLevel) {
    setZoomLevel(zoomLevel);
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
    return () => {
      window.removeEventListener("resize", windowResizeHandler);
      window.removeEventListener("hashchange", hashChangeHandler);
    };
  }, []);

  return (
    <div className="design-explorer-container" ref={containerRef}>
      {/* <SectionNavigation sections={sections} currentSection={viewingSection} /> */}
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
        />
      </div>
    </div>
  );
}

export default DesignExplorer;
