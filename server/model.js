import * as nsfwjs from "nsfwjs";

let _model = null;

export const loadModel = async () => {
  if (!_model) {
    _model = await nsfwjs.load("https://windows9-bucket.s3.ca-central-1.amazonaws.com/public/mobilenet_v2/model.json");
    console.log("NSFW model loaded!");
  }
};

export const getModel = () => {
  if (!_model) {
    throw new Error("NSFW model is not loaded yet!");
  }
  return _model;
};