import express from "express"
import multer from "multer"
import jpeg from "jpeg-js"
import * as tf from "@tensorflow/tfjs-node"
//import * as nsfwjs from "nsfwjs"
//import sharp from "sharp"
import { getModel } from "../model.js"

const SAFETY_THRESHOLD = 0.5    // if probability that an image is inappropriate is higher than this threshold, it will be rejected

const nsfwChecker = express.Router()
const upload = multer()

const convert = async (imageBuffer) => {
  // Decoded image in UInt8 Byte array
  const tensor = tf.node.decodeImage(imageBuffer, 3);
  return tensor;
  const data = await sharp(imageBuffer).resize({ width: 100, height: 100 }).toFormat("jpeg").toBuffer();
  // const data = await sharp(imageBufferResized).toFormat("jpeg").toBuffer();
  const image = jpeg.decode(data, true);

  const numChannels = 3
  const numPixels = image.width * image.height
  const values = new Int32Array(numPixels * numChannels)
  
  for (let i = 0; i < numPixels; i++)
    for (let c = 0; c < numChannels; ++c)
      values[i * numChannels + c] = image.data[i * 4 + c]
  
  return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32')
}
  
nsfwChecker.post('/nsfw', upload.single('image'), async (req, res) => {
  if (!req.file) res.status(400).send('Missing image multipart/form-data')
  else {
    try {
      const _model = getModel();
      //const image = await convert(req.file.buffer);
      const image = tf.node.decodeImage(req.file.buffer, 3);
      const predictions = await _model.classify(image);
      for (const item of predictions) {
        if (item.className !== "Drawing" && item.className !== "Neutral") {
          if (item.probability > SAFETY_THRESHOLD) {
            console.log("NSFW content detected: ", item.className);
            return res.status(200).send({ answer: "disallow", category: item.className });
          }
        }
      }
      return res.status(200).send({ answer: "allow", category: "" });
    } catch(err) {
      console.log(err);
      return res.status(500).json({ error: err });;
    }
  }
})

export default nsfwChecker