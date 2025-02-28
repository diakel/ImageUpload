import axios from "axios";
import config from "../config";
import ws from "../main.jsx"

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
      // console.log("Put request returned succesfully \n");
      // const ws = new WebSocket('ws://192.168.0.102:8080')
      // ws.onopen = () => {
      //  console.log('ws opened on browser')
      //  ws.send('image sent')
      //  ws.close()
      // }
      // ws.close();
      ws.send(JSON.stringify({
        url: fileLink,
        duration: 1
      }));
      onComplete(response);
    })
    .catch((err) => {
      console.error(err.response);
    });
}