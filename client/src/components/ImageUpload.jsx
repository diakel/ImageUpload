import React, { useEffect, useState } from "react";

import { MenuItem, Menu } from "@mui/material";
import useFileUpload from "../hooks/useFileUpload";
function EditAvatar({ inputId, image, name, onChange, prefix = "avatars" }) {
  const { uploadFile } = useFileUpload(onChange, prefix);
  const [file, setFile] = useState(null);
  useEffect(() => {
    uploadFile(file);
    // Do NOT put uploadFile function as dependency here
    // eslint-disable-next-line
  }, [file]);
  return (
    <div>
      <img src={image} alt={name} className="edit-avatar" />
      <input
        type="file"
        accept="image/jpeg, image/png"
        onChange={(e) => {
          setFile(e.target.files[0]);
        }}
        id={inputId}
        className="edit-file-input"
      />
      <div className="edit-menu-button">
        <Menu>
          <label htmlFor={inputId}>
            <MenuItem>Upload New</MenuItem>
          </label>
          {image && (
            <a href={image} target="_blank" rel="noreferrer">
              <MenuItem>Preview</MenuItem>
            </a>
          )}
          <MenuItem onClick={() => onChange(null)}>Remove</MenuItem>
        </Menu>
      </div>
    </div>
  );
}