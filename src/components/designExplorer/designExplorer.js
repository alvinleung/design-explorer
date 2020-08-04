import React, { useCallback } from "react";
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

function DesignExplorer() {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewportSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [viewingSection, setCurrentViewingSection] = useState("");

  const imgList = [
    `${process.env.PUBLIC_URL}/img/8 Viewing your tasks.svg`,
    `${process.env.PUBLIC_URL}/img/9 Contacting a client.svg`,
    `${process.env.PUBLIC_URL}/img/10 Contacting a helper.svg`,
    `${process.env.PUBLIC_URL}/img/11 Leaderboard.svg`,
    `${process.env.PUBLIC_URL}/img/12 Check in - Before.svg`,
    `${process.env.PUBLIC_URL}/img/13 Check in - During and after.svg`,
    `${process.env.PUBLIC_URL}/img/14 Leaving Reviews.svg`,
  ];

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
      width: window.innerWidth,
      height: window.innerHeight,
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
    <div className="design-explorer-container">
      {/* <SectionNavigation sections={sections} currentSection={viewingSection} /> */}
      <ZoomControl zoomLevel={zoomLevel} onZoomChange={zoomChangeHandler} />
      <div className="viewport-container">
        <Viewport
          width={viewportSize.width}
          height={viewportSize.height}
          src={imgList}
          sections={sections}
          targetSection={viewingSection}
          targetZoom={zoomLevel / 100}
          onZoom={viewportZoomHandler}
        />
      </div>
    </div>
  );
}

export default DesignExplorer;
