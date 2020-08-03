import React from "react";

const TOGGLE_OFF = false;
const TOGGLE_ON = true;

function ToggleButton(props) {
  const [toggleState, setToggleState] = React.useState(TOGGLE_ON);

  function toggleClick() {
    setToggleState(!toggleState);
  }

  return (
    <div onClick={toggleClick}>
      {toggleState ? props.onText : props.offText}
    </div>
  );
}

export default ToggleButton;
