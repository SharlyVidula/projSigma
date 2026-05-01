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
let prototypePort = 3005; // We will increment this for every new build

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
// Level 2 & 3: The Execution Engine (Autonomous Coding Agent)
app.post('/api/build-prototype', async (req, res) => {
    try {
        const { fileName } = req.body;

        if (!fileName) {
            return res.status(400).json({ error: "No XML file specified." });
        }

        console.log(`Starting Autonomous Agent for ${fileName}...`);

        // 1. Read the XML file we generated in Level 1
        const xmlFilePath = path.join(path.resolve('projects'), fileName);
        const xmlContent = await fs.readFile(xmlFilePath, 'utf8');

        // 2. The Agent Prompt: Telling Groq to write actual code based on the XML
        const coderPrompt = `You are an Expert Full-Stack Developer and UI/UX Designer. 
        Read the following XML architecture and build a working prototype.
        
        CRITICAL INSTRUCTION: You must respond ONLY with a raw, valid JSON object. Do NOT wrap it in markdown code blocks (like \`\`\`json). Do not add any conversational text.
        The keys of the JSON must be the exact file paths, and the values must be the exact code string.
        
        Required files to generate:
        1. "package.json": Must include "express", "cors", and "mongoose". Include a start script: "node server.js".
        2. "server.js": An Express backend with mock API routes based on the XML. Serve static files from "public". CRITICAL: You MUST use process.env.PORT for your listener (e.g., const PORT = process.env.PORT || 3005; app.listen(PORT...)).
        3. "public/index.html": The frontend UI. 
           - UI/UX RULES: You MUST use Tailwind CSS via CDN. 
           - DO NOT output plain, unstyled HTML. 
           - Implement a modern, sleek aesthetic (e.g., dark mode, CSS grid/flexbox, glassmorphism, styled cards for components, hover effects, and nice typography). 
           - The layout should look like a premium, professional web application. 
           - Include interactive inline JavaScript to make the wattage calculator and compatibility checks actually update the DOM visually.`;
        console.log("Agent is writing the codebase. Please wait...");

        // 3. Send to Groq
        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: coderPrompt },
                { role: "user", content: xmlContent }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" } // Very low temperature so it strictly follows the JSON rules
        });

        // 4. Clean and parse the AI's response into a JSON object
        let rawCode = response.choices[0].message.content;
        // Sometimes AI adds markdown anyway, this strips it out just in case
        rawCode = rawCode.replace(/```json/g, '').replace(/```/g, '').trim();

        const codeFiles = JSON.parse(rawCode);

        // 5. Create a unique folder for this specific build
        const buildId = fileName.replace('.xml', '');
        const prototypeDir = path.resolve('projects', buildId);
        await fs.mkdir(prototypeDir, { recursive: true });
        await fs.mkdir(path.join(prototypeDir, 'public'), { recursive: true });

        // 6. Loop through the JSON object and write the actual code files to your hard drive!
        for (const [filePath, fileContent] of Object.entries(codeFiles)) {
            await fs.writeFile(path.join(prototypeDir, filePath), fileContent, 'utf8');
            console.log(`Agent wrote file: ${filePath}`);
        }

        // 7. Spin up the Prototype! (Runs npm install, then node server.js)
        // 7. Spin up the Prototype on a dynamic port!
        console.log("Installing dependencies and booting prototype...");

        prototypePort++; // Increase the port number so it never clashes
        const currentPort = prototypePort;

        const buildProcess = exec(`npm install && node server.js`, {
            cwd: prototypeDir,
            env: { ...process.env, PORT: currentPort }
        });

        buildProcess.stdout.on('data', (data) => console.log(`[Prototype]: ${data}`));
        buildProcess.stderr.on('data', (data) => console.error(`[Prototype Error]: ${data}`));

        // 8. Tell the React UI that it's ready on the NEW port
        setTimeout(() => {
            res.status(200).json({
                message: "Prototype built and running!",
                url: `http://localhost:${currentPort}`
            });
        }, 3000);

    } catch (error) {
        console.error("Error during prototype build:", error);
        res.status(500).json({ error: "Failed to build prototype." });
    }
});
app.listen(port, () => {
    console.log(`Rapid Prototype Backend running on http://localhost:${port}`);
});