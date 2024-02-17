(async () => {
    const axios = require('axios');

    const config =  {
        "type": "function",
        "function": {
            "name": "capture_lead",
            "description": "Collects and stores dentist patient lead information in Airtable.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Name of the lead."
                    },
                    "phone": {
                        "type": "string",
                        "description": "Phone number of the lead.",
                    },
                    "email": {
                        "type": "string",
                        "description": "Email address of the lead.",
                        "format": "email"
                    },
                    "question": {
                        "type": "string",
                        "description":
                        "Details of the lead's inquiry"
                    }
                },
                "required": ["name", "phone", "email", "question"]
            }
        }
    }

    function validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    // Validate phone number format (E.164 format)
    function validatePhone(phone) {
        var re = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
        return re.test(phone);
    }

    // # The callback function (Adds lead to Airtable)
    async function capture_lead(params)   {
        // Extracting information from arguments
        const {name, phone, email, question} = params;

        if (!name || !phone || !email || !question) {
            return "Missing required information. Please provide name, phone, email, and question";
        }

        if (!validateEmail(email)) {
            return "Invalid email format. Please provide a valid email address.";
        }

        if (!validatePhone(phone)) {
            return "Invalid phone number format. Please provide a valid phone number.";
        }

        // Environment variable for Airtable API URL
        const URL = "https://api.airtable.com/v0/appcCp0kEPX0JDzAN/Leads" // TODO: maybe this should be taken from secrets
        const AIRTABLE_API_KEY = 'patxVGfNB9sqx3MQJ.8cfd28f4b7c282f41eca5a50b21b87187e91c782eae9189e8b7a9f98c8dc93f0'; // TODO: take the api key

        // headers
        const headers = {
            "Authorization": `Bearer ${AIRTABLE_API_KEY}`, 
            "Content-Type": "application/json"
        }

        // Data payload for the API request
        const data = {
            "records": [{
                "fields": {
                    "Name": name,
                    "Phone": phone,
                    "Email": email,
                    "Question": question
                }
            }]
        }

        // Making the API request with error handling
        try {
            const response = await axios.post(URL, data, 
            {
                headers: headers
            });
            if ([200, 201].includes(response.status)) {
                return "Lead stored successfully."
            } else {
                const error = `Error storing a lead: ${response.text}`
                return error;
            }
        } catch(e) {
            console.log(`Failed to store lead: ${e}`)
        }
    }

    exports.capture_lead_config = config;
    exports.capture_lead = capture_lead;
})();