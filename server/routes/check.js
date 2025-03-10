import express from "express"
import multer from "multer"
import jpeg from "jpeg-js"
import tf from "@tensorflow/tfjs"
import * as nsfwjs from "nsfwjs"
import sharp from "sharp"
import { getModel } from "../model.js"

const SAFETY_THRESHOLD = 0.5    // if probability that an image is inappropriate is higher than this threshold, it will be rejected

const nsfwChecker = express.Router()
const upload = multer()

const convert = async (imageBuffer) => {
  // Decoded image in UInt8 Byte array
  const data = await sharp(imageBuffer).toFormat("jpeg").toBuffer();
  const image = await jpeg.decode(data, true)

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
      if (req.file.size > 100000) {
        return res.status(200).send({ answer: "allow", category: "" });
      } else {
        const _model = getModel();
        const image = await convert(req.file.buffer)
        const predictions = await _model.classify(image)
        for (const item of predictions) {
          if (item.className !== "Drawing" && item.className !== "Neutral") {
            if (item.probability > SAFETY_THRESHOLD) {
              console.log("NSFW content detected: ", item.className);
              return res.status(200).send({ answer: "disallow", category: item.className });
            }
          }
        }
        return res.status(200).send({ answer: "allow", category: "" });
      }
    } catch(err) {
      console.log(err);
      return res.status(500).json({ error: err });;
    }
  }
})

export default nsfwChecker