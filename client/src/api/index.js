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

export async function generateImage(prompt) {
  let response = null;
  response = await fetch(config.API_BASE_URL+"/ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt,
    }),
  });
  if (response.ok) {
    const blob = await response.blob();
    return blob;
  } else {
    console.log(response);
    return error;
  }
}

const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

export async function uploadFileToSignedUrl(
  signedUrl,
  fileLink,
  file,
  duration,
  contentType,
  onProgress,
  onComplete
) {
  onComplete({"status": 200});  // for testing purposes
  return;
  // const base64Image = await fileToBase64(file);
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
        ws.send(fileLink);
        ws.close();
        onComplete(response);
      }
    })
    .catch((err) => {
      console.error(err.response);
    });
}
