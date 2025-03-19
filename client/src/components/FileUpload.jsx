import React, { useState } from "react";
import UploadArea from "./UploadArea";

const FileUpload = () => {
  const [file, setFile] = useState();
  const [fileLink, setFileLink] = useState();

  const onFileSelect = (e) => {
    var original_file = e.target.files[0];

    setFile(new File([original_file], "file", { type: original_file.type }));
    setFileLink(URL.createObjectURL(original_file));
    document.getElementById("custom-file-upload").style.opacity = 0;
  };

  return (
    <div className="drawFrame" style = {{ height: "590px"}}>
      <div className = "innerFrame" style={{width: "241px", height: "338px"}}>
        <label htmlFor="fileUpload" id="custom-file-upload">
        <img id="cloud" src="/Vector.png" alt="A picture of a cloud"></img>
          <p style = {{ marginTop: "10px", marginBottom: "5px" }}>Choose your image</p>
          <p style = {{ marginTop: "0px", fontSize: "10px", color: "#ADAAAA" }}>JPEG/GIF Under 10MB</p>
          <p style = {{ display: "inline-block", width: "162px", marginTop: "50px", fontSize: "10px", color: "#ADAAAA" }}>
            <i className='attention-icon'></i>
            AI moderation enabled (there might be some mistakes). For perfomance, the AI check is disabled for large files.
          </p>
        </label>
        <input id="fileUpload" type="file" accept="*" onChange={onFileSelect} />
        <img id="chosenImage" src={fileLink} />
      </div>
      <UploadArea file={file} onSuccess={() => {
          setFile(); 
          setFileLink(); 
          document.getElementById("custom-file-upload").style.opacity = 100; 
        }}
      />
    </div>
  );
};
export default FileUpload;