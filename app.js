const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");


const genAI = new GoogleGenerativeAI(process.env.API_KEY);


function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

async function run() {
 
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "What's different between these pictures?";

  const imageParts = [
    fileToGenerativePart("image1.png", "image/png"),
    fileToGenerativePart("image2.jpeg", "image/jpeg"),
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();
  console.log(text);
}

run();