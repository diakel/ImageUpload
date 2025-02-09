import React, { useState } from "react";
import { getSignedUrl, uploadFileToSignedUrl } from "../api";
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
const Playground = () => {
  var file = null;
  var content_type = null;
  var key = null;
  var res = null;
  const [fileLink, setFileLink] = useState("");
  const onFileSelect = (e) => {
    file = e.target.files[0];
    content_type = file.type;
    key = `test/image/${file.name}`;
    res = null;
    getSignedUrl({ key, content_type }).then((response) => {
      res = response;
      // console.log(res);
      document.getElementById("chosenImage").src = URL.createObjectURL(file);
    }).catch(() => {
     AlertPopup("Error", "Sorry, something went wrong with the selection", "error");
    });
  };
  const onUploadClick = (e) => {
    if (file && content_type && key) {
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
                document.getElementById("chosenImage").src = "";
              }
            ).catch(() => {
              AlertPopup("Error", "Sorry, something went wrong with the upload", "error");
            });
          },
        });
    }
    } else {
      AlertPopup("Error", "Please, select a file first", "warning");
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
      <div className = "uploadButton" style={{ marginTop: "40px"}}>
        <button id="uploadB" onClick={onUploadClick}>Upload</button>
      </div>
      <div className="consent">
        <p> By clicking Upload, I accept the Terms and Conditions</p>
      </div>
      </div>
    </div>
  );
};
export default Playground;