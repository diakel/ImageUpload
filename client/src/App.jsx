import { useState } from 'react'
import './App.css'
import React from "react";
import Container from "@mui/material/Container";
import Playground from "./components/Playground";
import SketchPad from "./components/SketchPad";
import styled from "styled-components";

const areas = ["File", "Draw"];

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "active"
})`
  display: inline-block;
  width: 145px; height: 28px; 
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
  return (
    <div className="App">
      <div className="header"><img className="logo" src="/logo_bee.png" alt="logo"/></div>
      <div className="Tabs"> <TabGroup active={active} setActive={setActive} /> </div>
      <Container style={{ display: "flex", justifyContent: "center" }}>
        {active === areas[0] && <Playground />}
        {active === areas[1] && <SketchPad />}
      </Container>
    </div>
  );
}

export default App;