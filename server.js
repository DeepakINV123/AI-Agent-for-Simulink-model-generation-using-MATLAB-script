const express = require("express");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;



async function generateMatlabCode(prompt) {
    try {
        const response = await axios.post("http://localhost:11434/api/generate", {
            model: "llama2",
            prompt: `Write a correct MATLAB script to create a Simulink model with: ${prompt}.
                     Ensure it follows MATLAB and Simulink syntax correctly.`,
            stream: false
        });

        return response.data.response.trim(); // Trim extra spaces
    } catch (error) {
        console.error("Error calling Ollama:", error);
        return "Error: AI model failed to generate MATLAB code.";
    }
}





app.post("/generate", async (req, res) => {
    const userPrompt = req.body.prompt;

    try {
        const matlabCode = await generateMatlabCode(userPrompt);

        
        if (!matlabCode || matlabCode.startsWith("Error")) {
            return res.status(500).json({ success: false, error: "AI failed to generate MATLAB code." });
        }

        
        const filename = __dirname + "/generated_model.m";
        fs.writeFileSync(filename, matlabCode, "utf-8");

        res.json({ success: true, filename, code: matlabCode });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal server error." });
    }
});



app.get("/download", (req, res) => {
    const filename = "generated_model.m";
    res.download(filename);
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
