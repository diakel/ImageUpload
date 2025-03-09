import express from "express"

const cloudflareAI = express.Router()
  
cloudflareAI.post('/generate', async (req, res) => {
    let { prompt, image } = req.body;
    let response = null;
    if (image) {
      response = await fetch(
        process.env.CLOUD_API_URL_IMG,
        {
          headers: { Authorization: `Bearer ${process.env.CLOUD_API_KEY}` },
          method: "POST",
          body: JSON.stringify({
            prompt: prompt,
            height: 257,
            width: 360,
            image_b64: image,
          }),
        }
      );
    } else {
      response = await fetch(
        process.env.CLOUD_API_URL_PROMPT,
        {
          headers: { Authorization: `Bearer ${process.env.CLOUD_API_KEY}` },
          method: "POST",
          body: JSON.stringify({
            prompt: prompt,
            height: 1008,
            width: 720,
          }),
        }
      );
    }
    if (response.status !== 200) {
      console.log(response);
      return res.status(response.status).json({ error: response.statusText });
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(buffer);
})

export default cloudflareAI