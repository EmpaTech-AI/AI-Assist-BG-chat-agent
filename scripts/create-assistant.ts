(async () => {
    const OpenAI = require("openai");
    const fsPromises = require("fs").promises;
    const fs = require("fs");
    const assistantFilePath = "./assistant/assistant.json";
    const { schedule_appointment_config } = require('../src/tools/schedule-appointment.ts');
    const { capture_lead_config } = require('../src/tools/capture-lead.ts');

    require('dotenv').config();

    const OPENAI_API_KEY = process.env['OPENAI_API_KEY'];

    const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    });

    const assistantConfig = {
        name: "AI Assist BG Assistant NEW - GPT 4o",
        instructions: "",
        model: "gpt-4o",
        tools: [
            { "type": "code_interpreter" },
            { "type": "file_search" },
            schedule_appointment_config,
            capture_lead_config,
        ],
        tool_resources: {
            "file_search": {
                "vector_store_ids": []
            },
            "code_interpreter": {
                "file_ids": []
            }
        }
    };

    async function createNewAssistant() {
        console.log('Creating a new assistant process initiated');

        // Read all files from the resources directory and upload them
        const files =  await fsPromises.readdir('./resources');
        const filteredFiles = files.filter(name => name !== '.DS_Store');

        const uploadPromises = filteredFiles.map(async (fileName) => {
            const filePath = `./resources/${fileName}`;
            // Upload the file
            try {
                const file = await openai.files.create({
                    file: fs.createReadStream(filePath),
                    purpose: "assistants",
                });
                return file.id;
            } catch(e) {
                return null
            }
        });

        const fileIds = await Promise.all(uploadPromises);
        const filteredFileIds = fileIds.filter(id => id);

        const instructionsFilePath = './instructions/instructions.txt';
        const assistantInstructions = await fsPromises.readFile(instructionsFilePath, "utf8");

        assistantConfig.tool_resources.code_interpreter.file_ids = filteredFileIds;
        assistantConfig.instructions = assistantInstructions;

        const assistant = await openai.beta.assistants.create(assistantConfig);
        const assistantDetails = { assistantId: assistant.id, ...assistantConfig };
        console.log('new assistant created');

        await fsPromises.writeFile(
        assistantFilePath,
        JSON.stringify(assistantDetails, null, 2)
        );
        console.log('assistants file created');
    }

    createNewAssistant();
})();