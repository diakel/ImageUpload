import React, { useState } from "react";
import UploadArea from "./UploadArea";
import Swal from 'sweetalert2';

const FileUpload = () => {
  const [file, setFile] = useState();
  const [fileLink, setFileLink] = useState();
  const [expandedFrame, setExpandedFrame] = useState(false);

  if (!localStorage.returning) {
    infoPopup();
  }

  function infoPopup() {
    Swal.fire({
      title: "<strong>Upload your content to the beehive!</strong>",
      //imageUrl: "simpson.gif",
      html: `Use this website to upload an image onto the beehive. The image can be chosen from your file system, drawn, or AI generated right here on this website.
      This image will be displayed in Virtual Reality approximately 2 minutes after you upload it. Please, be aware that we have an AI content checker, which might make mistakes.<br>
      <p>
      The time it will be displayed for depends on your preferences and how actively people upload their content.<br><p>
      <img src="duration.gif" width="300" height="140"/> <p> <br>
      Eventually, your image will be replaced by another in the beehive. However, we will continue to store it in our Amazon secure storage.<br><p> 
      More information can be found in the Terms and Conditions.<br> If you have difficulties navigating the website, click Tutorial.`,
      customClass: {
        popup: 'rounded-alert',
        confirmButton: 'rounded-alert'
      }
    });
    localStorage.returning = true;
  };

  const onFileSelect = (e) => {
    var original_file = e.target.files[0];

    setFile(new File([original_file], "file", { type: original_file.type }));
    setFileLink(URL.createObjectURL(original_file));
    document.getElementById("custom-file-upload").style.opacity = 0;
  };

  return (
    <div className={`drawFrame ${expandedFrame ? "expanded" : ""}`}>
      <div className = "innerFrame" style={{width: "241px", height: "338px", marginBottom: "40x"}}>
        <label htmlFor="fileUpload" id="custom-file-upload">
        <img id="cloud" src="/Vector.png" alt="A picture of a cloud"></img>
          <p style = {{ marginTop: "10px", marginBottom: "5px" }}>Choose your image</p>
          <p style = {{ marginTop: "0px", fontSize: "10px", color: "#ADAAAA" }}>Files Under 20MB</p>
          <p style = {{ display: "inline-block", width: "162px", marginTop: "50px", fontSize: "10px", color: "#ADAAAA" }}>
            <i className='attention-icon'></i>
            AI moderation enabled (there might be some mistakes).
          </p>
        </label>
        <input id="fileUpload" type="file" accept="*" onChange={onFileSelect} />
        <img id="chosenImage" src={fileLink} />
      </div>
      <UploadArea file={file} onSuccess={() => {
          setFile(); 
          setFileLink(); 
          document.getElementById("custom-file-upload").style.opacity = 100; 
        }} setExpandedFrame={setExpandedFrame}
      />
      <div className="fileFooter" style={{marginTop: "8px"}}>
        <span
          onClick={infoPopup} 
          style={{ color: "blue", textDecoration: "underline", cursor: "pointer", fontSize: "14px"}}
        >
          About the project
        </span>
      </div>
    </div>
  );
};
export default FileUpload;