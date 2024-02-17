(async () => {
    const OpenAI = require("openai");
    const fsPromises = require("fs").promises;
    const fs = require("fs");
    const assistantFilePath = "./assistant/assistant.json";
    const ASSISTANT_CONFIGURATION = require('../assistant/assistant.json');
    const { schedule_dental_visit_config } = require('../src/tools/schedule-dental-visit.ts');
    const { capture_lead_config } = require('../src/tools/capture-lead.ts');

    const secretKey = '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';
    const openai = new OpenAI({
    apiKey: secretKey,
    });

    
    const assistantConfig = {
        name: "",
        // This will be populated in the updateAssistant call
        instructions: "",
        model: "",
        // dynamically import the tools here
        tools: [
            { "type": "retrieval" },
            { "type": "code_interpreter" },
            schedule_dental_visit_config,
            capture_lead_config
        ],
        // This will be populated in the updateAssistant call
        file_ids: []
    };

    async function updateAssistant() {
        if (!ASSISTANT_CONFIGURATION.assistantId) {
            console.log('Missing assistantId, please provide it !');
            return;
        }

        console.log('Updating an existing assistant process initiated');

        // Prepare the new configuration

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

        // // Gather the assistant instructions
        const instructionsFilePath =  './instructions/instructions.txt';
        const assistantInstructions = await fsPromises.readFile(
            instructionsFilePath,
            "utf8"
        );

        // Update the assistant config with the newly obtained data fileds
        // Put the newly provided name
        assistantConfig.name = ASSISTANT_CONFIGURATION.name;
        // Update the instructions
        assistantConfig.instructions = assistantInstructions;
        // Put the newly provided model
        assistantConfig.model = ASSISTANT_CONFIGURATION.model;
        // Update the filed ids
        assistantConfig.file_ids = filteredFileIds;
        // The tools are provided in the basic config creation on row 15


        await openai.beta.assistants.update(ASSISTANT_CONFIGURATION.assistantId, {
            ...assistantConfig
          });

        console.log(`Assistant with id ${ASSISTANT_CONFIGURATION.assistantId} is updated sucessfully`);


        // Save the UPDATED assistant details to assistant.json
        await fsPromises.writeFile(
            assistantFilePath,
            JSON.stringify({
                assistantId: ASSISTANT_CONFIGURATION.assistantId,
                ...assistantConfig
            }, null, 2)
        );
        console.log('Assistants file updated');
    }

    updateAssistant();
})();