import React, { useState, useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import UploadArea from "./UploadArea";

const SketchPad = () => {
  const [color, setColor] = useState("#000000");
  const [radius, setRadius] = useState(1);
  const canvasRef = useRef(null);
  const [expandedFrame, setExpandedFrame] = useState(false);

  return (
    <div className={`drawFrame ${expandedFrame ? "expanded" : ""}`}>
      <div className="innerFrame" style={{backgroundColor: "white", paddingTop: "8px", paddingLeft: "5px", marginBottom: "1px"}}>
        <CanvasDraw 
          ref={canvasRef}
          brushColor={color}
          lazyRadius={0}
          brushRadius={radius}
          canvasWidth={230}
          canvasHeight={320}
          backgroundColor="#ffffff"
          hideGrid
        />
      </div>
      <div style={{ marginTop: "0px"}}>
        <div id="drawButtonArea" style={{float: "left", paddingLeft: "20px", marginBottom: "15px" }}>
          <input 
            id="drawButton"
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            style={{marginLeft: "10px"}}
          />
          <input 
            id="drawButtonRadius"
            type="range" 
            min="1" max="20" step="1"
            value={radius} 
            onChange={(e) => setRadius(Number(e.target.value))}
          />
          <button id="drawButton" onClick={() => canvasRef.current.clear()} style={{padding: "5px"}}> <i className='clear-icon'></i> </button>
          <button id="drawButton" onClick={() => canvasRef.current.undo()} style={{padding: "5px"}}><i className='undo-icon'></i></button>
        </div>
      </div>
      <UploadArea file={canvasRef} 
        onSuccess={() => {
          canvasRef.current.clear();
        }}
        setExpandedFrame={setExpandedFrame}
      />
    </div>
  );
};

export default SketchPad;
