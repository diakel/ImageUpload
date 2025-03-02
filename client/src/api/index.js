import axios from "axios";
import config from "../config";

const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
});

export async function getSignedUrl({ key, content_type }) {
  const response = await apiClient.post("/s3/signed_url", {
    key,
    content_type,
  }).catch((err => {
    console.error(err.response);
  }));
  return response.data;
}

export async function checkForNSFWContent(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await apiClient.post("/check/nsfw", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err) {
    console.error(err.response);
  }
}

export async function uploadFileToSignedUrl(
  signedUrl,
  fileLink,
  file,
  contentType,
  onProgress,
  onComplete
) {
  axios
    .put(signedUrl, file, {
      onUploadProgress: onProgress,
      headers: {
        "Content-Type": contentType,
      },
    })
    .then((response) => {
      const ws = new WebSocket('wss://ws.websocket-windows9.click')
      ws.onopen = () => {
        // console.log('connection to ws established')
        ws.send(JSON.stringify({
          url: fileLink,
          duration: 1
        }));
        ws.close();
        onComplete(response);
      }
    })
    .catch((err) => {
      console.error(err.response);
    });
}