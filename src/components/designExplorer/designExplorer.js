import React from "react";
import { useState, useEffect } from "react";
import { PropTypes } from "prop-types";
import Viewport from "./viewport";

// utility function for min-maxing
function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function DesignExplorer() {
  const [viewportSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const imgList = [
    `${process.env.PUBLIC_URL}/img/8 Viewing your tasks.svg`,
    `${process.env.PUBLIC_URL}/img/9 Contacting a client.svg`,
    `${process.env.PUBLIC_URL}/img/10 Contacting a helper.svg`,
  ];

  function windowResizeHandler() {
    // refresh the window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }
  useEffect(() => {
    window.addEventListener("resize", windowResizeHandler);
    return () => {
      window.removeEventListener("resize", windowResizeHandler);
    };
  }, []);

  return (
    <Viewport
      width={viewportSize.width}
      height={viewportSize.height}
      src={imgList}
    />
  );
}

export default DesignExplorer;
