import React, { useState, useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import { checkForNSFWContent, getSignedUrl, uploadFileToSignedUrl } from "../api";
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from "uuid";

// Completely unrefactored

function AlertPopup(title, text, icon) {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    customClass: {
      popup: 'rounded-alert',
      confirmButton: 'rounded-alert'
    }
  });  
};

const SketchPad = () => {
  const [color, setColor] = useState("#000000");
  const [quantity, setQuantity] = useState(1);
  const [units, setDuration] = useState("hour");
  const canvasRef = useRef(null);

  const showTermsPopup = () => {
    AlertPopup("Terms and Conditions", "Here will be Terms and Condition detailing file storage and image usage", "info");
  };

  const handleSelectorChange = (event) => {
    setDuration(event.target.value);
  };

  const handleInputChange = (event) => {
    setQuantity(event.target.value);
  }; 

  const URLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  };

  const onUploadClick = (e) => {
    if (JSON.parse(canvasRef.current.getSaveData()).lines.length === 0) {
      AlertPopup("Error", "Please, draw something first", "warning");
      return;
    }
    if (!quantity || !units) {
      AlertPopup("Warning", "Please, set the duration.", "warning");
      return;
    }

    const canvasDraw = canvasRef.current.canvasContainer.children[1];
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");
  
    tempCanvas.width = canvasDraw.width;
    tempCanvas.height = canvasDraw.height;
  
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    ctx.drawImage(canvasDraw, 0, 0);

    const imageURL = tempCanvas.toDataURL("image/jpeg", 1.0);

    //var imageURL = canvasRef.current.getDataURL("image/jpeg");
    const blob = URLtoBlob(imageURL);
    const now = new Date();
    const later = new Date(2100, 12, 31, 10, 0, 0, 0);
    const timeDiff = Math.abs(later - now);
    const fileName = `${timeDiff}_${uuidv4()}_sketch.jpeg`;
    const file = new File([blob], fileName, { type: "image/jpg" });
    const content_type = file.type;
    const key = `test/image/${file.name}`;

    Swal.fire({
      title: "Analysing the image for inappropriate content...",
      //html: `<b>0%</b> <br><progress value="0" max="100"></progress>`,
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-alert',
        confirmButton: 'rounded-alert'
      },
      didOpen: () => {
        Swal.showLoading();
        checkForNSFWContent(file).then((res) => {
          if (res.answer === "disallow") {
            console.log("Forbidden category: ", res.category);
            AlertPopup("Error", "Sorry, your image did not pass AI content check. Select another one.", "error");
          } else {
            let seconds = 0;
            switch (units) {
              case "hour": seconds = 3600; break;
              case "day": seconds = 86400; break;
              case "week": seconds = 604800; break;
              case "month": seconds = 2629746; 
            }
            const duration = quantity * seconds;
            getSignedUrl({ key, content_type }).then((response) => {
                uploadFileToSignedUrl(
                  response.data.signedUrl,
                  response.data.fileLink,
                  file,
                  duration,
                  content_type,
                  (progressEvent) => {
                    if (progressEvent.lengthComputable) {
                      var progressPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                      Swal.update({
                        title: "Uploading the image...",
                        html: `<b>${progressPercent}%</b> <br><progress value="${progressPercent}" max="100"></progress>`,
                      });
                    }
                  },
                  () => {
                    AlertPopup("Success", "Your file was uploaded!", "success");
                    canvasRef.current.clear();
                  }
                ).catch(() => {
                  AlertPopup("Error", "Sorry, something went wrong with the upload", "error");
                });
            });
          }
        }).catch(() => {
          AlertPopup("Error", "Sorry, something went wrong with the AI check", "error");
        });
      }
    });
  };

  return (
    <div className="drawFrame" style={{ textAlign: "center" }}>
      <div className="drawArea" style={{backgroundColor: "white"}}>
        <CanvasDraw 
          ref={canvasRef}
          brushColor={color}
          lazyRadius={0}
          brushRadius={1}
          canvasWidth={222}
          canvasHeight={300}
          backgroundColor="#ffffff"
          hideGrid
        />
      </div>
      <div style={{ marginTop: "5px" }}>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)}
          style={{ 
            width: "70px",
            height: "30px",
            padding: "8px",
            border: "1px solid rgba(0,0,0)",
            borderRadius: "25px",
            marginRight: "20px",
            marginLeft: "20px",
            background: "transparent",
            appearance: "none",
            cursor: "pointer",
            WebkitAppearance: "none"
             }}
        />
        <button id="drawButton" onClick={() => canvasRef.current.clear()}>Clear</button>
        <button id="drawButton" onClick={() => canvasRef.current.undo()}>Undo</button>

        <form style = {{ display: "inline-block", width: "240px", marginBottom: "5px"}}>
        <label className = "durSelect" style = {{ display: "inline-block", width: "240px", fontSize: "12px", color: 'rgba(105, 101, 101, 1)'}}>
          How long do you want your image to be displayed for?
        </label>
        <input
          value = {quantity}
          onChange={handleInputChange}
          type="number" id="dur" min = "1" max = "100" 
          style = {{ display: "inline-block", height: "20px", width: "80px", marginTop: "5px", marginRight: "9px", borderRadius: "5px", backgroundColor: "white", color: "black", border: "1px solid"}} />
        <select 
          name="durationChoice"
          value={units}
          onChange={handleSelectorChange}
          style = {{ width: "82px", height: "25px", borderRadius: "5px", backgroundColor: "white", color: "black", border: "1px solid"}}>  
          <option value="hour">hour(s)</option>
          <option value="day">day(s)</option>
          <option value="week">week(s)</option>
          <option value="month">month(s)</option>
        </select>
       </form>
        <div className = "uploadButton" style={{ marginTop: "10px", marginBottom: "0px"}}>
          <button id="uploadB" onClick={onUploadClick}>Upload</button>
        </div>
        <div className="consent" style={{ width: "222px", marginTop: "0px"}}>
          <p> By clicking Upload, I accept the {" "}
          <span 
            onClick={showTermsPopup} 
            style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
          >
          Terms and Conditions
          </span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SketchPad;
