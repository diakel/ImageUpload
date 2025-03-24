import { useState } from 'react'
import './App.css'
import React from "react";
import Container from "@mui/material/Container";
import FileUpload from "./components/FileUpload";
import SketchPad from "./components/SketchPad";
import AI from "./components/AI";
import styled from "styled-components";
import Joyride, { STATUS } from "react-joyride";
import Swal from 'sweetalert2';

const areas = ["File", "Draw", "AI"];

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "active"
})`
  display: inline-block;
  width: 96px; height: 28px; 
  line-height: 0;
  cursor: pointer;
  opacity: 1;
  background: white;
  border: 0;
  ${({ active }) =>
    active &&
    `
    background-color: black;
    color: white;
    opacity: 1;
  `}
`;


function TabGroup({active, setActive}) {
  // const [active, setActive] = useState(areas[0]);
  return (
    <>
      <div>
        {areas.map((area) => (
          <Tab
            key={area}
            active={active === area}
            onClick={() => setActive(area)}
          >
            {area}
          </Tab>
        ))}
      </div>
    </>
  );
}

function App() {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(areas[0]);
  const [run, setRun] = useState(false); 

  const stepsFile = [
    {
      target: ".Tabs",
      content: "Click one of these to choose an image from your phone, draw, or AI generate one",
      disableBeacon: true,
    },
    {
      target: ".innerFrame",
      content: "Click here to choose an image from your file system",
    },
    {
      target: "#uploadB",
      content: "Press this to send your image to the beehive or choose another one",
    },
  ];

  const stepsDraw = [
    {
      target: ".Tabs",
      content: "Click one of these to choose an image from your phone, draw, or AI generate one",
      disableBeacon: true,
    },
    {
      target: ".innerFrame",
      content: "Draw on this canvas",
    },
    {
      target: "#drawButtonArea",
      content: "Choose brush color, size, clean the canvas, or undo your last action",
      styles: {
        spotlight: {
          marginLeft: "2px",
        },
      },
    },
    {
      target: "#uploadB",
      content: "Press this to send your sketch to the beehive",
    },
  ];

  const stepsAI = [
    {
      target: ".Tabs",
      content: "Click one of these to choose an image from your phone, draw, or AI generate one",
      disableBeacon: true,
    },
    {
      target: "#promptInput",
      content: "First, type your prompt for the image here",
      styles: {
        spotlight: {
          borderRadius: "5px",
        },
      },
    },
    {
      target: ".aiButton",
      content: "Second, press this button to start AI generating",
      styles: {
        spotlight: {
          borderRadius: "5px",
        },
        tooltip: {borderRadius: "16px", transition: "transform 0.2s ease-out, opacity 0.2s ease-out", position: "absolute", maxWidth: "100vw", right: "-60px"}, 
      },
    },
    {
      target: ".innerFrame",
      content: "Wait (up to 1 minute) for the generated image to appear here",
    },
    {
      target: "#uploadB",
      content: "Press this to send your image to the beehive or generate another one",
    },
  ];
  

  const handleJoyrideCallback = (data) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
    }
  };

  return (
    <div className="App">
      <Joyride steps={ active===areas[0] ? stepsFile : (active===areas[1] ? stepsDraw : stepsAI) } run={run} continuous showSkipButton spotlightPadding={false} disableScrolling={false} floaterProps={{ styles: {arrow: {margin: -13} } }}
        callback={handleJoyrideCallback}
        styles={{ options: {width: "300px", },
                  buttonClose: {position: "absolute", right: "-80px", }, 
                  spotlight: { borderRadius: "25px", }, 
                  tooltip: {borderRadius: "16px", transition: "transform 0.2s ease-out, opacity 0.2s ease-out", position: "absolute", maxWidth: "100vw", right: "-150px"}, 
                  tooltipFooter: {marginTop: "0px"},
                  buttonNext: {backgroundColor: "black", borderRadius: "45px", }, 
                  buttonBack: {color: "black", }, }}/>
      <div className="header"><img className="logo" src="/logo_bee.png" alt="logo"/></div>
      <div className="Tabs"> <TabGroup active={active} setActive={setActive} /> </div>
      <span 
        onClick={() => setRun(true)} 
        style={{ display: "block", paddingBottom: "7px", color: "blue", textDecoration: "underline", cursor: "pointer" }}
      >
        <i className='loupe-icon'></i>
        Tutorial
      </span>
      <Container style={{ display: "flex", justifyContent: "center" }}>
        {active === areas[0] && <FileUpload />}
        {active === areas[1] && <SketchPad />}
        {active === areas[2] && <AI />}
      </Container>
    </div>
  );
}

export default App;