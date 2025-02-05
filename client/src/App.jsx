import { useState } from 'react'
import './App.css'
import React from "react";
import Container from "@mui/material/Container";
import Playground from "./components/Playground";
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


function TabGroup() {
  const [active, setActive] = useState(areas[0]);
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
  const [count, setCount] = useState(0)
  return (
    <div className="App">
      <img className="logo" src="/logo_butterfly.png" alt="logo"/>
      <div className="Tabs"> <TabGroup /> </div>
      <Container style={{ display: "flex", justifyContent: "center" }}>
        <Playground />
      </Container>
    </div>
  );
}

export default App;