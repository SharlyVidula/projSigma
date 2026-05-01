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

app.listen(port, () => {
    console.log(`Rapid Prototype Backend running on http://localhost:${port}`);
});