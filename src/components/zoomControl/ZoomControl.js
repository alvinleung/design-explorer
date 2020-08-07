import React from "react";
import PropTypes from "prop-types";
import "./ZoomControl.scss";

function ZoomControl(props) {
  const defaultZoomLevel = props.defaultZoomLevel
    ? props.defaultZoomLevel
    : 100;
  const zoomLevel = Math.floor(props.zoomLevel);
  const zoomInterval = 25;
  const MAX_ZOOM = 150;
  const MIN_ZOOM = 20;

  function reset() {
    if (props.onZoomChange) props.onZoomChange(defaultZoomLevel);
  }
  function zoomIn() {
    // calculate next zoom level
    const remaindingZoomLevel = zoomLevel % zoomInterval;
    const newZoom = zoomLevel - remaindingZoomLevel + zoomInterval;
    if (props.onZoomChange)
      props.onZoomChange(newZoom > MAX_ZOOM ? MAX_ZOOM : newZoom);
  }
  function zoomOut() {
    // calculate next zoom level
    const remaindingZoomLevel = zoomLevel % zoomInterval;
    const newZoom = zoomLevel - remaindingZoomLevel - zoomInterval;
    if (props.onZoomChange)
      props.onZoomChange(newZoom < MIN_ZOOM ? MIN_ZOOM : newZoom);
  }

  return (
    <div
      class={
        zoomLevel == defaultZoomLevel
          ? "zoom-control"
          : "zoom-control zoom-control--mutated"
      }
    >
      <button class="zoom-control__reset" onClick={reset}>
        Reset Zoom
      </button>
      <button onClick={zoomIn}>+</button>
      <div class="zoom-control__value">{zoomLevel}%</div>
      <button onClick={zoomOut}>-</button>
    </div>
  );
}

ZoomControl.propTypes = {
  onZoomChange: PropTypes.func,
};

export default ZoomControl;
