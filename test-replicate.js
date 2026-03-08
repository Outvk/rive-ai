const Replicate = require("replicate");

async function test() {
  const token = "r8_B7I2lWInweKYQGAIelTd0tHa5NUNz3y1B6nEh";
  const replicate = new Replicate({ auth: token });

  try {
    console.log("Testing Replicate API...");
    const model = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";
    const input = { prompt: "a small cat", width: 768, height: 768 };
    
    const output = await replicate.run(model, { input });
    console.log("Success! Output:", output);
  } catch (error) {
    console.error("Replicate Error:", error.message);
    if (error.response) {
       console.error("Status:", error.response.status);
       const body = await error.response.text();
       console.error("Body:", body);
    }
  }
}

test();
