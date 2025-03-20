import express from "express"

const cloudflareAI = express.Router()
  
cloudflareAI.post('/generate', async (req, res) => {
    let { prompt } = req.body;
    let response = null;
    const start = performance.now();
    response = await fetch(
      process.env.CLOUD_API_URL_LIGHT,
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
    const end = performance.now();
    if (response.status !== 200) {
      console.log(response);
      return res.status(response.status).json({ error: response.statusText });
    }
    console.log(`Call to generate took ${end - start} milliseconds`)
    const startB = performance.now();
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const endB = performance.now();
    console.log(`Call to buffer took ${endB - startB} milliseconds`)
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(buffer);
})

export default cloudflareAI