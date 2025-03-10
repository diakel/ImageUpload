import React, { useState } from "react";
import { checkForNSFWContent, getSignedUrl, uploadFileToSignedUrl } from "../api";
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from "uuid";

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
const Playground = () => {
  // var file = null;
  var content_type = null;
  var key = null;
  var res = null;
  const [file, setFile] = useState();
  const [fileLink, setFileLink] = useState();
  const [quantity, setQuantity] = useState(1);
  const [units, setDuration] = useState("hour");
  const showTermsPopup = () => {
    AlertPopup("Terms and Conditions", "Here will be Terms and Condition detailing file storage and image usage", "info");
  };

  const handleSelectorChange = (event) => {
    setDuration(event.target.value);
  };

  const handleInputChange = (event) => {
    setQuantity(event.target.value);
  };

  const onFileSelect = (e) => {
    var original_file = e.target.files[0];

    const now = new Date();
    const later = new Date(2100, 12, 31, 10, 0, 0, 0);
    const timeDiff = Math.abs(later - now);
    const newFileName = `${timeDiff}_${uuidv4()}_${original_file.name}`;

    //file = new File([original_file], newFileName, { type: original_file.type });
    setFile(new File([original_file], newFileName, { type: original_file.type }));
    //document.getElementById("chosenImage").src = URL.createObjectURL(file);
    setFileLink(URL.createObjectURL(original_file));
  };
  const onUploadClick = (e) => {
    if (!quantity || !units) {
      AlertPopup("Warning", "Please, set the duration.", "warning");
      return;
    }
    if (file && units) {
      if (file.size > MAX_UPLOAD_SIZE) {
        AlertPopup("Error", "Sorry, your file is too big", "error");
      } else {
        Swal.fire({
          title: "Checking the image for inappropriate content...",
          //html: `<b>0%</b> <br><progress value="0" max="100"></progress>`,
          allowOutsideClick: false,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-alert',
            confirmButton: 'rounded-alert'
          },
          didOpen: () => {
            Swal.showLoading();
            key = `test/imageBee/${file.name}`;
            checkForNSFWContent(file).then((res) => {
              // console.log(res);
              if (res.answer === "disallow") {
                console.log("Forbidden category: ", res.category);
                AlertPopup("Error", "Sorry, your image did not pass AI content check. Select another one.", "error");
              } else {
                content_type = file.type;
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
                      setFileLink();
                      setFile();
                    }
                  ).catch(() => {
                    AlertPopup("Error", "Sorry, something went wrong with the upload", "error");
                  });
                }).catch(() => {
                  AlertPopup("Error", "Sorry, something went wrong with the selection", "error");
                });
              }
            }).catch(() => {
              AlertPopup("Error", "Sorry, something went wrong with the AI check", "error");
            });
          },
        });
    }
    } else if (!file) {
      AlertPopup("Error", "Please, select a file first", "warning");
    } else {
      AlertPopup("Error", "Please, select a sculpture first", "warning");
    }
  };
  return (
    <div>
      <div className="drawFrame" style = {{ height: "590px"}}>
        <div className = "frame">
          <div id="previewArea" className = "innerFrame">
            <label htmlFor="fileUpload" className="custom-file-upload">
            <img id="cloud" src="/Vector.png" alt="A picture of a cloud"></img>
              <p style = {{ marginTop: "10px", marginBottom: "5px" }}>Choose your image</p>
              <p style = {{ marginTop: "0px", fontSize: "10px", color: "#ADAAAA" }}>JPEG/GIF Under 10MB</p>
              <p style = {{ display: "inline-block", width: "162px", marginTop: "60px", fontSize: "10px", color: "#ADAAAA" }}>
                <i className='attention-icon'></i>
                AI moderation enabled (there might be some mistakes).
              </p>
            </label>
            <input id = "fileUpload" type="file" accept="*" onChange={onFileSelect} />
            <img id="chosenImage" src={fileLink} />
          </div>
        </div>
      <form style = {{ display: "inline-block", width: "240px", marginBottom: "2px"}}>
        <label className = "durSelect" style = {{ display: "inline-block", width: "240px", fontSize: "12px", color: 'rgba(105, 101, 101, 1)'}}>
          How long do you want your image to be displayed for?
        </label>
        <input
          value = {quantity}
          onChange={handleInputChange}
          type="number" id="dur" min = "1" max = "100" 
          style = {{ height: "20px", width: "80px", marginTop: "5px", marginRight: "9px", borderRadius: "5px", backgroundColor: "white", color: "black", border: "1px solid"}} />
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

      <div className = "uploadButton" style={{ marginTop: "20px"}}>
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
    </div>
  );
};
export default Playground;