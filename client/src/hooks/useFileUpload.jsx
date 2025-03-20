import { useCallback, useState } from "react";
import { checkForNSFWContent, getSignedUrl, uploadFileToSignedUrl } from "../api";
import { v4 as uuidv4 } from "uuid";
import Swal from 'sweetalert2';

/**
 Hook to upload a file to S3 and send it to the Websockets server. NSFW content check included.  
**/

function getKeyAndContentType(file) {
  const now = new Date();
  const later = new Date(2100, 12, 31, 10, 0, 0, 0);
  const timeDiff = Math.abs(later - now);
  const newFileName = `${timeDiff}_${uuidv4()}_${file.name}`;
  let key = `test/image/${newFileName}`;
  let content_type = file.type;
  return { key, content_type };
}

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

export default function useFileUpload(onSuccess) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const uploadFile = useCallback((file) => {
    if (file) {
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
              const { key, content_type } = getKeyAndContentType(file);
              getSignedUrl({ key, content_type }).then((response) => {
                const signedUrl = response.data?.signedUrl;
                const fileLink = response.data?.fileLink;
                if (signedUrl) {
                  /*
                  let seconds = 0;
                  switch (units) {
                    case "hour": seconds = 3600; break;
                    case "day": seconds = 86400; break;
                    case "week": seconds = 604800; break;
                    case "month": seconds = 2629746; 
                  }
                  const duration = quantity * seconds;  // not used in the Unreal Engine prototype, example only
                  */
                  const duration = 0;
                  setUploading(true);
                  uploadFileToSignedUrl(
                    signedUrl,
                    fileLink,
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
                      // console.log("Upload completed successfully");
                      // AlertPopup("Success", "Your file was uploaded!", "success");
                      onSuccess(fileLink);
                      setUploading(false);
                    }
                  ).catch(() => {
                    AlertPopup("Error", "Sorry, something went wrong with the upload", "error");
                  }).finally(() => {
                    setUploadProgress(0);
                  });
                } else {
                  console.error("Problem with the signed URL");
                }
              });
            }
          }).catch(() => {
            AlertPopup("Error", "Sorry, something went wrong with the AI content check", "error");
          });
        }
      });
    }
    // eslint-disable-next-line
  }, []);
  return {
    uploading,
    uploadProgress,
    uploadFile,
  };
}