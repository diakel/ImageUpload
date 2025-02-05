import React, { useState } from "react";
import { getSignedUrl, uploadFileToSignedUrl } from "../api";
import Swal from 'sweetalert2';

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
      Swal.fire({
        title: "Error",
        text: "Sorry, something went wrong with the selection",
        icon: "error",
        customClass: {
          popup: 'rounded-popup',
          confirmButton: 'rounded-alert'
        }
      });
    });;
  };
  const onUploadClick = (e) => {
    if (file && content_type && key) {
      uploadFileToSignedUrl(
        res.data.signedUrl,
        file,
        content_type,
        null,
        () => {
          Swal.fire({
            title: "Success",
            text: "Your file was uploaded!",
            icon: "success",
            customClass: {
              popup: 'rounded-popup',
              confirmButton: 'rounded-alert'
            }
          });
          setFileLink("res.data.fileLink");
          document.getElementById("chosenImage").src = "";
        }
      ).catch(() => {
        Swal.fire({
          title: "Error",
          text: "Sorry, something went wrong with the upload",
          icon: "error",
          customClass: {
            popup: 'rounded-popup',
            confirmButton: 'rounded-alert'
          }
        });
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "Please, select a file first",
        icon: "warning",
        customClass: {
          popup: 'rounded-alert',
          confirmButton: 'rounded-alert'
        }
      });
    }
  };
  return (
    <div>
      <div className="upload">
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
      </div>
      <div className = "uploadButton">
        <button onClick={onUploadClick}>Upload</button>
      </div>
    </div>
  );
};
export default Playground;