import React, { useState } from "react";
import { getSignedUrl, uploadFileToSignedUrl } from "../api";
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
  const [selectedSculpture, setSelectedSculpture] = useState("");
  const showTermsPopup = () => {
    AlertPopup("Terms and Conditions", "Just a placeholder, ignore it for now", "info");
  };

  const handleCheckboxChange = (event) => {
    setSelectedSculpture(event.target.value);
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
    /*
    if (selectedSculpture === "butterfly") {
      key = `test/image/${file.name}`;
    } else {
      key = `test/imageBee/${file.name}`
    }
    content_type = file.type;
    res = null;
    getSignedUrl({ key, content_type }).then((response) => {
      res = response;
      // console.log(res);
      document.getElementById("chosenImage").src = URL.createObjectURL(file);
    }).catch(() => {
     AlertPopup("Error", "Sorry, something went wrong with the selection", "error");
    });
    */
  };
  const onUploadClick = (e) => {
    if (file && selectedSculpture) {
      if (file.size > MAX_UPLOAD_SIZE) {
        AlertPopup("Error", "Sorry, your file is too big", "error");
      } else {
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
            if (selectedSculpture === "butterfly") {
              key = `test/image/${file.name}`;
            } else {
              key = `test/imageBee/${file.name}`;
            }
            content_type = file.type;
            res = null;
            getSignedUrl({ key, content_type }).then((response) => {
              res = response;
              // console.log(res);
              // document.getElementById("chosenImage").src = URL.createObjectURL(file);
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
                  setFileLink("res.data.fileLink");
                  setFile(null);
                  document.getElementById("chosenImage").src = "";
                }
              ).catch(() => {
                AlertPopup("Error", "Sorry, something went wrong with the upload", "error");
              });
            }).catch(() => {
             AlertPopup("Error", "Sorry, something went wrong with the selection", "error");
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
      <div className="drawFrame">
        <div className = "frame">
          <div id="previewArea" className = "innerFrame">
            <label htmlFor="fileUpload" className="custom-file-upload">
            <img id="cloud" src="/Vector.png" alt="A picture of a cloud"></img>
              <p>Choose your image</p>
            </label>
            <input id = "fileUpload" type="file" accept="*" onChange={onFileSelect} />
            <img id="chosenImage" src={fileLink} />
          </div>
        </div>
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
      <div className = "uploadButton" style={{ marginTop: "15px"}}>
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