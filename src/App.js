import React from "react";
import "./App.scss";
import DesignExplorer from "./components/designExplorer";

function App() {
  const cols = 3;
  const imgList = [
    `${process.env.PUBLIC_URL}/img/8 Viewing your tasks.svg`,
    `${process.env.PUBLIC_URL}/img/9 Contacting a client.svg`,
    `${process.env.PUBLIC_URL}/img/10 Contacting a helper.svg`,
    `${process.env.PUBLIC_URL}/img/11 Leaderboard.svg`,
    `${process.env.PUBLIC_URL}/img/12 Check in - Before.svg`,
    `${process.env.PUBLIC_URL}/img/13 Check in - During and after.svg`,
    `${process.env.PUBLIC_URL}/img/14 Leaving Reviews.svg`,
  ];
  return (
    <div>
      <DesignExplorer src={imgList} cols={cols} />
    </div>
  );
}

export default App;
