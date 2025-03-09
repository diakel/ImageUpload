import React, { useEffect, useState, useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import { checkForNSFWContent, generateImage, getSignedUrl, uploadFileToSignedUrl } from "../api";
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
  const [prompt, setPrompt] = useState("");
  const [units, setDuration] = useState("hour");
  const canvasRef = useRef(null);
  const [blob, setBlob] = useState(); // for AI image to send
  const [fileLink, setFileLink] = useState(); // for AI image
  const [loading, setLoading] = useState(false);  // blur for AI
  const [active, setActive] = useState(false);

  const showTermsPopup = () => {
    AlertPopup("Terms and Conditions", "Here will be Terms and Condition detailing file storage and image usage", "info");
  };

  const handleSelectorChange = (event) => {
    setDuration(event.target.value);
  };

  const handleInputChange = (event) => {
    setQuantity(event.target.value);
  }; 

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  }; 

  const onAiClick = () => {
    let sketch = null;
    setLoading(true);
    setActive(!active);
    if (active) {
      setFileLink();
      setBlob();
      setLoading(false);
      return;
    } 
    if (JSON.parse(canvasRef.current.getSaveData()).lines.length !== 0) {
      canvasToBlob(canvasRef).then(async (sketchBlob) => {
        const arrayBuffer = await sketchBlob.arrayBuffer();
        const sketch = new Uint8Array(arrayBuffer);
        generateImage(prompt, sketch)
          .then((data) => {
            try {
              setBlob(data);
              setLoading(false);
              setActive(true);
              const objectURL = URL.createObjectURL(data);
              setFileLink(objectURL);
            } catch (err) {
              console.error(err.response);
              setActive(false);
              setLoading(false);
            }
          })
          .catch(() => {
            setLoading(false);
            AlertPopup("Error", "Couldn't generate AI image based on the sketch, please, try again. Make sure you entered the prompt.", "error");
          });
      }).catch((error) => {
        console.error("Error creating Blob:", error)
        setLoading(false);
        setActive(false);
      });
    } else {
      generateImage(prompt, sketch).then((data) => {
        try {
          setBlob(data);
          setLoading(false);
          const objectURL = URL.createObjectURL(data);
          setFileLink(objectURL);
        } catch (err) {
          setActive(false);
          setLoading(false);
          console.error(err.response);
        }
      }).catch(() => {
        setActive(false);
        setLoading(false);
        AlertPopup("Error", "Couldn't generate AI image, please, try again. Make sure you entered the prompt.", "error");
      });
    }
  }


  const URLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  };

  const canvasToBlob = async (canvasRef) => {
    return new Promise((resolve, reject) => {
      const canvasDraw = canvasRef.current.canvasContainer.children[1];
      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");
    
      tempCanvas.width = canvasDraw.width;
      tempCanvas.height = canvasDraw.height;
    
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
      ctx.drawImage(canvasDraw, 0, 0);
  
      tempCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to Blob"));
        }
      }, "image/png");
    });
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

  const onUploadClick = (e) => {
    if (JSON.parse(canvasRef.current.getSaveData()).lines.length === 0 && !blob) {
      AlertPopup("Error", "Please, draw or generate something first", "warning");
      return;
    }
    if (!quantity || !units) {
      AlertPopup("Warning", "Please, set the duration.", "warning");
      return;
    }

    // const blob = canvasToBlobSync(canvasRef);
    const now = new Date();
    const later = new Date(2100, 12, 31, 10, 0, 0, 0);
    const timeDiff = Math.abs(later - now);
    const fileName = `${timeDiff}_${uuidv4()}_sketchorAI.jpeg`;
    let file = null;
    if (!blob) {
      const blobCanvas = canvasToBlobSync(canvasRef);
      file = new File([blobCanvas], fileName, { type: "image/jpg" });
    } else {
      file = new File([blob], fileName, { type: "image/jpg" });
    }
    const content_type = file.type;
    const key = `test/imageBee/${file.name}`;

    Swal.fire({
      title: "Checking the image for inappropriate content...",
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
          AlertPopup("Error", "Sorry, something went wrong with the AI check. Select another image.", "error");
        });
      }
    });
  };

  return (
    <div className="drawFrame" style={{ textAlign: "center" }}>
      <div className={`innerFrame ${loading ? "blurred" : ""}`} style={{backgroundColor: "white", paddingTop: "8px", paddingLeft: "5px", marginBottom: "2px"}}>
        <CanvasDraw 
          ref={canvasRef}
          brushColor={color}
          lazyRadius={0}
          brushRadius={1}
          canvasWidth={230}
          canvasHeight={315}
          backgroundColor="#ffffff"
          hideGrid
        />
        <img className="aiImage" src={fileLink}/>
      </div>
      <div style={{ marginTop: "0px" }}>
        <input 
          id="drawButton"
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)}
          style = {{
            marginLeft: "13px"
          }}
        />
        <button id="drawButton" onClick={() => canvasRef.current.clear()} style={{padding: "4px"}}> <i className='clear-icon'></i> </button>
        <button id="drawButton" onClick={() => canvasRef.current.undo()} style={{padding: "5px"}}><i className='undo-icon'></i></button>

        <button className={`aiButton ${active ? "active" : ""}`} onClick={onAiClick} style={{ float: "right", marginRight: "25px", paddingTop: "3px", lineHeight: "2.5", width: "110px", height: "35px", marginLeft: "7px", fontSize: "12px", backgroundColor: "white", transition: "border 0.3s"}}>
          <i className='ai-icon'></i> Generate
        </button>
        
        <form style = {{ display: "inline-block", width: "240px", marginBottom: "5px"}}>
        <input
          value = {prompt}
          onChange={handlePromptChange}
          type="text"
          placeholder="Enter your AI prompt"
          style = {{ display: "inline-block", height: "25px", width: "220px", marginTop: "8px", marginBottom: "8px", borderRadius: "5px", backgroundColor: "white", color: "black", border: "1px solid"}} />
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
          style = {{ width: "82px", height: "27px", borderRadius: "5px", backgroundColor: "white", color: "black", border: "1px solid"}}>  
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
