(async () => {
    const OpenAI = require("openai");
    const fsPromises = require("fs").promises;
    const fs = require("fs");
    const assistantFilePath = "./assistant/assistant.json";
    const { schedule_appointment_config } = require('../src/tools/schedule-appointment.ts');
    const { capture_lead_config } = require('../src/tools/capture-lead.ts');
    const { search_real_estate_listings_config } = require('../src/tools/search-real-estate-listings.ts');
    require('dotenv').config();

    const OPENAI_API_KEY = process.env['OPENAI_API_KEY'];

    const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    });
        
    const assistantConfig = {
        name: "Real Estate Assistant",
        // This will be populated in the createNewAssistant call
        instructions: "",
        model: "gpt-4-1106-preview",
        // dynamically import the tools here
        tools: [
            { "type": "retrieval" },
            { "type": "code_interpreter" },
            schedule_appointment_config,
            capture_lead_config,
            search_real_estate_listings_config,
        ],
        // This will be populated in the createNewAssistant call
        file_ids: []
    };

    async function createNewAssistant() {
        console.log('Creating a new assistant process initiated');

        // Read all files from the resources directory and upload them
        const files =  await fsPromises.readdir('./resources');
        const filteredFiles = files.filter(name => name !== '.DS_Store');

        const uploadPromises = filteredFiles.map(async (fileName) => {
            const filePah = `./resources/${fileName}`;
            // Upload the file
            try {
                const file = await openai.files.create({
                    file: fs.createReadStream(filePah),
                    purpose: "assistants",
                });
                return file.id;
            } catch(e) {
                return null
            }
        });

        const fileIds = await Promise.all(uploadPromises);
        const filteredFileIds = fileIds.filter(id => id); // take only truthty values

        // Gather the assistant instructions
        const instructionsFilePath =  './instructions/instructions.txt';
        const assistantInstructions = await fsPromises.readFile(
            instructionsFilePath,
            "utf8"
        );

        // Update the assistant config with the newly obtained data fileds
        assistantConfig.file_ids = filteredFileIds;
        assistantConfig.instructions = assistantInstructions;

        // // @ts-ignore
        const assistant = await openai.beta.assistants.create(assistantConfig);
        const assistantDetails = { assistantId: assistant.id, ...assistantConfig };
        console.log('new assistant created');

        // Save the assistant details to assistant.json
        await fsPromises.writeFile(
        assistantFilePath,
        JSON.stringify(assistantDetails, null, 2)
        );
        console.log('assistants file created');
    }

    createNewAssistant();
})();