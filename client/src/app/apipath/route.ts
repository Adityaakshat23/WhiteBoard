const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function fileToGenerativePart(fileEntry: FormDataEntryValue) {
  if (fileEntry instanceof File) {
    const arrayBuffer = await fileEntry.arrayBuffer();
    return {
      data: Buffer.from(arrayBuffer).toString("base64"),
      mimeType: "image/png", // Adjust mimeType according to your file type
    };
  } else {
    throw new Error("Expected 'file' to be of type File.");
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const fileblob = formData.get('file');

  if (!fileblob) {
    console.error('Failed to retrieve file from form data');
    return new Response('Failed to retrieve file from form data', { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
    const prompt = "Do these look store-bought or homemade?";
const image = {
  inlineData: {
    data: Buffer.from(await fileblob.arrayBufffer()).toString("base64"),
    mimeType: "image/png",
  },
};

    const result = await model.generateContent({
      prompt: prompt,
      content: [
        { image: { inlineData: image } }
      ]
    });

    const response = await result.response;
    const text = await response.text();
    console.log(text);
    
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('Error processing request', { status: 500 });
  }
}
