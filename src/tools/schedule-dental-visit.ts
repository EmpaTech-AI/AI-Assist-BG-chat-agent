(async () => {
  const axios = require('axios')
  const config = {
    "type": "function",
    "function": {
      "name": "schedule_dental_visit",
      "description": "Schedule a dental visit for a patient",
      "parameters": {
        "type": "object",
        "properties": {
          "full_name": {
            "type": "string",
            "description": "Full name of the user."
          },
          "email": {
            "type": "string",
            "description": "Email address of the user."
          },
          "question": {
            "type": "string",
            "description": "Dental question of the user"
          },
          "date_time": {
            "type":
              "string",
            "description":
              "Preferred date and time for visit (YYYY-MM-DD HH:MM)."
          }
        },
        "required": ["full_name", "email", "question", "date_time"]
      }
    }
  }

  /**
      Schedule a dental visit and send the data to a webhook.
      :param arguments: dict, Contains information for scheduling a property viewing.
      Expected keys: full_name, email, question, date_time.
      :return: dict or str, Response from the webhook or error message.
  */
  async function schedule_dental_visit(params) {
    // Environment variable for webhook URL
    const MAKE_WEBHOOK_VISIT_SCHEDULE = process.env['MAKE_WEBHOOK_VISIT_SCHEDULE'];

    if (!MAKE_WEBHOOK_VISIT_SCHEDULE) {
      return 'missing MAKE_WEBHOOK_VISIT_SCHEDULE environment variable'
    }

    // Extracting information from arguments
    const { full_name, email, question, date_time } = params;

    function validateEmail(email) {
      var re = /\S+@\S+\.\S+/;
      return re.test(email);
    }

    if (!validateEmail(email)) {
      return "Invalid email format. Please provide a valid email address.";
    }

    // TODO:: validate the date

    // Prepare data payload for webhook
    const data = {
      "full_name": full_name,
      "email": email,
      "question": question,
      "date_time": date_time
    }

    // Send data to webhook
    try {
      const response = await axios.post(MAKE_WEBHOOK_VISIT_SCHEDULE, data);
      // @ts-ignore
      if ([200, 201].includes(response.status)) {
        return "Dental visit scheduled successfully."
      } else {
        // @ts-ignore
        const error = `Error scheduling dental visit: ${response.text}`
        return error;
      }
    } catch (e) {
      console.log(`Failed to send data to the webhook: ${e}`)
    }
  }

  exports.schedule_dental_visit_config = config;
  exports.schedule_dental_visit = schedule_dental_visit;
})();