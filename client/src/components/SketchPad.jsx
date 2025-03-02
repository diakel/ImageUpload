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
  const [selectedSculpture, setSelectedSculpture] = useState("");
  const canvasRef = useRef(null);

  const showTermsPopup = () => {
    AlertPopup("Terms and Conditions", "Here will be Terms and Condition detailing file storage and image usage", "info");
  };

  const handleCheckboxChange = (event) => {
    setSelectedSculpture(event.target.value);
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
    if (!selectedSculpture) {
      AlertPopup("Error", "Please, select a sculpture", "warning");
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
    // const fileName = `sketch_${uuidv4()}.png`;
    const file = new File([blob], fileName, { type: "image/jpg" });
    const content_type = file.type;
    var key = null;
    if (selectedSculpture === "butterfly") {
      key = `test/image/${file.name}`;
    } else {
      key = `test/imageBee/${file.name}`;
    }
    // const key = `test/image/${file.name}`;
    // var res = null;
    /*
    file.arrayBuffer().then(buff => {
      let imageArray = new Uint8Array(buff);
      nsfwCheck(imageArray);
    });
    */
    checkForNSFWContent(file).then((res) => {
      if (res.answer === "disallow") {
        console.log("Forbidden category: ", res.category);
        AlertPopup("Error", "Sorry, your image did not pass AI content check. Select another one.", "error");
      } else {
        getSignedUrl({ key, content_type }).then((response) => {
          // res = response;
          if (file && content_type && key) {
            Swal.fire({
              title: "Upload is in progress...",
              html: `<b>0%</b> <br><progress value="0" max="100"></progress>`,
              allowOutsideClick: false,
              showConfirmButton: false,
              customClass: {
                popup: 'rounded-alert',
                confirmButton: 'rounded-alert'
              },
              didOpen: () => {
                Swal.showLoading();
                uploadFileToSignedUrl(
                  response.data.signedUrl,
                  response.data.fileLink,
                  file,
                  content_type,
                  (progressEvent) => {
                    if (progressEvent.lengthComputable) {
                      var progressPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                      Swal.update({
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
              },
            });
        } else {
          AlertPopup("Error", "Please, select a file first", "warning");
        }
        }).catch(() => {
          AlertPopup("Error", "Sorry, something went wrong with the selection", "error");
        });
      }
    }).catch(() => {
      AlertPopup("Error", "Sorry, something went wrong with the AI check", "error");
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
          canvasHeight={336}
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
        <label className = "sculpSelect">
        <input
          type="radio"
          name="sculptureChoice"
          value="butterfly"
          checked={selectedSculpture === "butterfly"}
          onChange={handleCheckboxChange}
        />
        Butterfly
        </label>

        <label className = "sculpSelect">
        <input
          type="radio"
          name="sculptureChoice"
          value="bee"
          checked={selectedSculpture === "bee"}
          onChange={handleCheckboxChange}
          style = {{ marginLeft: "20px"}}
        />
        Bee
        </label> 
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
