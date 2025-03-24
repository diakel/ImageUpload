import React, { useState } from "react";
import Swal from 'sweetalert2';
import UploadArea from "./UploadArea";
import { generateImage } from "../api";

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

const AI = () => {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState();
  const [fileLink, setFileLink] = useState();
  const [loading, setLoading] = useState(false);
  const [expandedFrame, setExpandedFrame] = useState(false);

  const onAiClick = () => {
    setLoading(true);
    generateImage(prompt).then((data) => {
      try {
        setFile(new File([data], "AI", { type: "image/jpg" }));
        setLoading(false);
        const objectURL = URL.createObjectURL(data);
        setFileLink(objectURL);
      } catch (err) {
        setLoading(false);
        console.error(err.response);
      }
    }).catch(() => {
      setLoading(false);
      AlertPopup("Error", "Couldn't generate AI image, please, try again. Make sure you entered the prompt.", "error");
    });
  }

  return (
    <div className={`drawFrame ${expandedFrame ? "expanded" : ""}`}>
      <div className={`innerFrame ${loading ? "blurred" : ""}`} style={{backgroundColor: "white", paddingTop: "8px", paddingLeft: "5px", marginBottom: "0px"}}>
        <img className="aiImage" id="aiImage" src={fileLink}/>
      </div>
      <div style={{ marginTop: "0px" }}>
        <input
          id="promptInput"
          value = {prompt}
          onChange={e => setPrompt(e.target.value)}
          type="text"
          placeholder="Enter your AI prompt"/>
        <div className="aiButtonDiv">
        {loading ? (
          <span className="loader"></span>
          ) : (
            <button className="aiButton" disabled={!prompt.trim()} onClick={onAiClick}>
              <i className='ai-icon'></i> Generate
            </button>
          )}
        </div>
      </div>
      <UploadArea file={file} onSuccess={() => {
          setFile(); 
          setFileLink();
        }} setExpandedFrame={setExpandedFrame}
      />
    </div>
  );
};

export default AI;