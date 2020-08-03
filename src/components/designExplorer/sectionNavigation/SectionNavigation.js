import React, { useState } from "react";
import "./SectionNavigation.scss";
import ToggleButton from "../toggleButton";

function SectionNavigation(props) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="nav-container">
      <h2>Sections</h2>
      <ul className="nav-list">
        {props.sections.map((item) => {
          return (
            <li>
              <a
                className={
                  item.title === props.currentSection
                    ? "nav-link nav-link--active"
                    : "nav-link"
                }
                href={"#" + encodeURIComponent(item.title)}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default SectionNavigation;
