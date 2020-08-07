import React from "react";
import ReactDOM from "react-dom";
// import "./index.css";
// import App from "./App";
import DesignExplorer from "./components/designExplorer";
// import * as serviceWorker from "./serviceWorker";

// const imgList = [
//   `${process.env.PUBLIC_URL}/img/8 Viewing your tasks.svg`,
//   `${process.env.PUBLIC_URL}/img/9 Contacting a client.svg`,
//   `${process.env.PUBLIC_URL}/img/10 Contacting a helper.svg`,
//   `${process.env.PUBLIC_URL}/img/11 Leaderboard.svg`,
//   `${process.env.PUBLIC_URL}/img/12 Check in - Before.svg`,
//   `${process.env.PUBLIC_URL}/img/13 Check in - During and after.svg`,
//   `${process.env.PUBLIC_URL}/img/14 Leaving Reviews.svg`,
// ];

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById("root")
// );

// grab all the viewer elements on html
window.addEventListener("load", function () {
  const designExplorerList = document.querySelectorAll(".design-explorer");
  designExplorerList.forEach((elm) => {
    const srcListAttribute = elm.getAttribute("data-src").replaceAll("'", '"');
    const srcList = JSON.parse(srcListAttribute);

    const colCountAttribute = parseInt(elm.getAttribute("data-cols") || 1);

    const colInitialZoomAttribute = parseInt(
      elm.getAttribute("data-init-zoom") || 100
    );
    console.log("test");
    ReactDOM.render(
      <DesignExplorer
        src={srcList}
        cols={colCountAttribute}
        scrollToPan={false}
        initialZoom={colInitialZoomAttribute}
      />,
      elm
    );
  });
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
