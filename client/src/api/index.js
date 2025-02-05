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

export async function uploadFileToSignedUrl(
  signedUrl,
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
      onComplete(response);
    })
    .catch((err) => {
      console.error(err.response);
    });
}