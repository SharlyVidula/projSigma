import { exec } from 'child_process';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize the SDK pointing specifically to Groq!
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1", // Crucial: Points to Groq's blazing fast servers
});

const architectPrompt = `You are a Senior Solutions Architect. Your job is to take a raw, informal project idea and convert it into a highly structured, comprehensive XML specification file. This file will be read by an autonomous coding agent (Antigravity) to build a prototype.

You must expand on the raw idea to fill in logical gaps. Your output must strictly follow this XML structure and contain NO markdown, NO conversational text, and NO explanations outside the XML tags.

<ProjectSpecification>
    <ProjectName>[Generate a concise name]</ProjectName>
    <Summary>[Brief summary of the system]</Summary>
    <UserRoles>
        <!-- Define all necessary user roles here -->
    </UserRoles>
    <FunctionalRequirements>
        <!-- List specific, actionable features -->
    </FunctionalRequirements>
    <UIStructure>
        <!-- Define core pages and components needed -->
    </UIStructure>
    <DatabaseSchema>
        <!-- Outline the necessary data entities -->
    </DatabaseSchema>
</ProjectSpecification>`;

app.post('/api/generate-xml', async (req, res) => {
    try {
        const { rawRequirements } = req.body;

        if (!rawRequirements) {
            return res.status(400).json({ error: "Please provide project requirements." });
        }

        console.log("Sending requirements to Groq...");

        // Call the Groq API
        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile", // One of Groq's most powerful supported models
            messages: [
                { role: "system", content: architectPrompt },
                { role: "user", content: rawRequirements }
            ],
            temperature: 0.2, // Keeps the AI focused and strict with the XML format
        });

        // Extract the XML string from Groq's response
        const xmlContent = response.choices[0].message.content;

        const projectDir = path.resolve('projects');
        await fs.mkdir(projectDir, { recursive: true });

        const fileName = `specs_${Date.now()}.xml`;
        const filePath = path.join(projectDir, fileName);
        await fs.writeFile(filePath, xmlContent, 'utf8');

        console.log(`Successfully saved XML to ${filePath}`);

        res.status(200).json({
            message: "Intake successful. XML generated and saved.",
            file: fileName
        });

    } catch (error) {
        console.error("Error during XML generation:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Level 2: The Execution Engine (Antigravity Simulator)
app.post('/api/build-prototype', async (req, res) => {
    try {
        const { fileName } = req.body;

        if (!fileName) {
            return res.status(400).json({ error: "No XML file specified." });
        }

        console.log(`Starting Antigravity build process for ${fileName}...`);

        // Define where the new prototype will be built
        const prototypeDir = path.resolve('projects', 'generated_prototype');

        // 1. Create the folder if it doesn't exist
        await fs.mkdir(prototypeDir, { recursive: true });

        // 2. Here is where the "Antigravity Agent" would read the XML and write the code.
        // For now, let's have it write a simple index.html to prove it works
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><title>Generated Prototype</title></head>
            <body style="font-family: sans-serif; padding: 50px;">
                <h1>🚀 Your Prototype is Live!</h1>
                <p>This was generated based on the XML file: ${fileName}</p>
                <p>Next step: Make the agent parse the XML and write MERN stack code here.</p>
            </body>
            </html>
        `;

        await fs.writeFile(path.join(prototypeDir, 'index.html'), htmlContent, 'utf8');

        // 3. Spin up a lightweight server on port 3001 to serve this prototype
        // We use 'npx serve' which is a fast way to serve static files
        console.log("Booting up the prototype on port 3001...");

        const buildProcess = exec('npx serve -p 3001', { cwd: prototypeDir });

        buildProcess.stdout.on('data', (data) => console.log(`Prototype Log: ${data}`));
        buildProcess.stderr.on('data', (data) => console.error(`Prototype Error: ${data}`));

        // Tell the frontend that it's ready!
        res.status(200).json({
            message: "Prototype built and running!",
            url: "http://localhost:3001"
        });

    } catch (error) {
        console.error("Error during prototype build:", error);
        res.status(500).json({ error: "Failed to build prototype." });
    }
});
app.listen(port, () => {
    console.log(`Rapid Prototype Backend running on http://localhost:${port}`);
});