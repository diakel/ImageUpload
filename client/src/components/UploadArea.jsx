import React, { useState } from "react";
import useFileUpload from "../hooks/useFileUpload";
import Swal from 'sweetalert2';

const MAX_UPLOAD_SIZE = 10485760; // in bytes (set to 10 MB)

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

const UploadArea = ({file, onSuccess, setExpandedFrame}) => {
  const [quantity, setQuantity] = useState(1);
  const [units, setDuration] = useState("hour");
  const [durationCheck, checkDuration] = useState(false);

  const { uploadFile } = useFileUpload(() => {
    AlertPopup("Success", "Your file was uploaded!", "success");
    onSuccess();
  });
          
  const showTermsPopup = () => {
    AlertPopup("Terms and Conditions", "Here will be Terms and Condition detailing file storage and image usage", "info");
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

  const canvasToBlobSync = (canvasRef) => {
      const canvasDraw = canvasRef.current.canvasContainer.children[1];
      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");
    
      tempCanvas.width = canvasDraw.width;
      tempCanvas.height = canvasDraw.height;
    
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
      ctx.drawImage(canvasDraw, 0, 0);
  
      const imageURL = tempCanvas.toDataURL("image/jpeg", 1.0);
  
      const blobSketch = URLtoBlob(imageURL);
  
      return blobSketch;
  }

  const durationDropdown = () => {
    setExpandedFrame(!durationCheck);
    checkDuration(!durationCheck);
  }

  const onUploadClick = (e) => {
    if (!quantity || !units) {
      AlertPopup("Warning", "Please, set the duration.", "warning");
      return;
    }
    if (file && units) {
      if (file.size > MAX_UPLOAD_SIZE) {
        AlertPopup("Error", "Sorry, your file is too big", "error");
      } else {
        if (file instanceof File) {
            uploadFile(file);
        } else if (file.current) {
            const blobCanvas = canvasToBlobSync(file);
            const sketchFile = new File([blobCanvas], "sketch", { type: "image/jpg" });
            uploadFile(sketchFile);
        }
      }
    } else if (!file) {
      AlertPopup("Error", "Please, set a file first", "warning");
    }
  };
  return (
    <div>
      <input className="durDrop" id="durDrop" type="checkbox" style={{ display: "none"}} />
      <label className={`durationSelection ${durationCheck ? "active" : ""}`} htmlFor="durDrop" onClick={durationDropdown}> Duration Selection 
        {durationCheck ? (<i className='drop-icon-up'></i>) : (<i className='drop-icon-down'></i>)}
      </label>
      <form className={`durSelection ${durationCheck ? "open" : ""}`} id="durSelection">
        <label htmlFor="dur" className = "durSelect" style = {{ display: "inline-block", width: "240px", fontSize: "12px", color: 'rgba(105, 101, 101, 1)'}}>
          How long do you want your image to be displayed for?
        </label>
        <input
          value = {quantity}
          onChange={e => setQuantity(e.target.value)}
          type="number" id="dur" min = "1" max = "100" 
          style = {{ height: "20px", width: "80px", marginTop: "5px", marginRight: "9px", borderRadius: "5px", backgroundColor: "white", color: "black", border: "1px solid"}} />
        <select 
          name="durationChoice"
          value={units}
          onChange={e => setDuration(e.target.value)}
          style = {{ width: "82px", height: "27px", borderRadius: "5px", backgroundColor: "white", color: "black", border: "1px solid"}}>  
          <option value="hour">hour(s)</option>
          <option value="day">day(s)</option>
          <option value="week">week(s)</option>
          <option value="month">month(s)</option>
        </select>
      </form>

      <div className = "uploadButton" style={{ marginTop: "10px"}}>
        <button id="uploadB" onClick={onUploadClick}>Upload</button>
      </div>
      <div className="consent">
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
  );
};
export default UploadArea;