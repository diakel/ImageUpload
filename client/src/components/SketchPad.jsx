import React, { useState, useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import { getSignedUrl, uploadFileToSignedUrl } from "../api";
import Swal from 'sweetalert2';

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
  const canvasRef = useRef(null);

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
    var imageURL = canvasRef.current.getDataURL();
    const blob = URLtoBlob(imageURL);
    var file = new File([blob], "sketch.png", { type: "image/png" });
    var content_type = file.type;
    var key = `test/drawing/${file.name}`;
    var res = null;
    getSignedUrl({ key, content_type }).then((response) => {
      res = response;
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
              res.data.signedUrl,
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
  };

  return (
    <div className="drawFrame" style={{ textAlign: "center" }}>
      <div className="drawArea">
        <CanvasDraw 
          ref={canvasRef}
          brushColor={color}
          lazyRadius={0}
          brushRadius={1}
          canvasWidth={222}
          canvasHeight={311}
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
            background: "transparent",
            appearance: "none",
            cursor: "pointer",
            WebkitAppearance: "none"
             }}
        />
        <button id="drawButton" onClick={() => canvasRef.current.clear()}>Clear</button>
        <button id="drawButton" onClick={() => canvasRef.current.undo()}>Undo</button>
        <div className = "uploadButton" style={{ marginTop: "25px", marginBottom: "0px"}}>
          <button id="uploadB" onClick={onUploadClick}>Upload</button>
        </div>
        <div className="consent" style={{ width: "222px", marginTop: "0px"}}>
          <p> By clicking Upload, you agree to the Terms and Conditions</p>
        </div>
      </div>
    </div>
  );
};

export default SketchPad;
