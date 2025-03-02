import express from "express"
import multer from "multer"
import jpeg from "jpeg-js"
import tf from "@tensorflow/tfjs-node"
import * as nsfwjs from "nsfwjs"
import sharp from "sharp"

const SAFETY_THRESHOLD = 0.5    // if probability that an image is inappropriate is higher than this threshold, it will be rejected

const nsfwChecker = express.Router()
const upload = multer()

let _model
 
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
    const image = await convert(req.file.buffer)
    const predictions = await _model.classify(image)
    for (const item of predictions) {
      if (item.className !== "Drawing" && item.className !== "Neutral") {
        if (item.probability > SAFETY_THRESHOLD) {
          return res.send({ answer: "disallow", category: item.className });
        }
      }
    }
    return res.send({ answer: "allow", category: "" });
  }
})
 
const load_model = async () => {
  _model = await nsfwjs.load()
}

await load_model()
 

/*
s3Router.post("/signed_url", async (req, res) => {
  try {
    let { key, content_type } = req.body;
    key = "public/" + key;
    const data = await createPresignedPost({ key, contentType: content_type });
    return res.send({
      status: "success",
      data,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).send({
      status: "error",
      message: err.message,
    })
  }
})
*/



/*
export async function nsfwCheck(file) {
  const model = await nsfwjs.load();
  const image = await tf.node.decodeImage(file, 3); // Uint8Array
  const predictions = await model.classify(image);
  image.dispose();
  console.log(predictions);
}
*/

export default nsfwChecker