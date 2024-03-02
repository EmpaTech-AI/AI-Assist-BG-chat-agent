(async () => {
    const axios = require('axios')
    const config = {
        "type": "function",
        "function": {
            "name": "database_search",
            "description":
            "Search in the database based on the provided query parameters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type":
                        "string",
                        "description":
                        "Location to search (city, zip code, or address)."
                    },
                    "destination": {
                        "type":
                        "string",
                        "description":
                        "Location where the order should be delivered. (city, zip code, or address)."
                    },
                    "type_of_cargo": {
                        "type":
                        "string",
                        "description":
                        "Type of the cargo."
                    },
                    "price": {
                        "type":
                        "integer",
                        "description":
                        "Price point. Adjusts for a range around the specified value."
                    },
                    
                },
                "required": ["location"]
            }
        }
    }
    
    /**
        Search for real estate listings using desired api url
        :param arguments: dict, Contains the search parameters.
        :return: dict or str, Response from the API or error message.
    */
    async function database_search(params) {
        // Environment variables
        const SEARCH_LISTINGS_URL = process.env['SEARCH_LISTINGS_URL'];
        const AIRTABLE_API_KEY = process.env['AIRTABLE_API_KEY'];
  
        if (!SEARCH_LISTINGS_URL) {
            return 'missing SEARCH_LISTINGS_URL environment variable'
        }
    
        // headers
          const headers = {
            "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
          }

        // Extracting information from arguments
        const { price, location, destination, type_of_cargo } = params;

        // filterByFormula=AND(FIND('кв. Лозенец', {Location}) > 0, AND({Beds} = '2'),  AND({Home Size} = '150 кв.м.'), AND({Price} >= 150000, {Price} <= 200000))
        // Preparing query parameters
        const data = {};
        let queryParams = [];


        if (location) {
            data["Location"] = location;
            const query = `FIND('${location}',{Location}) > 0`;
            queryParams.push(query);
        }
        if (destination) {
            data["Destination"] = destination;
            const query = `FIND('${destination}',{Destination}) > 0`;
            queryParams.push(query);
        }
        if (type_of_cargo) {
            data["Type of cargo"] = type_of_cargo;
            const query = `FIND('${type_of_cargo}',{Type of cargo}) > 0`;
            queryParams.push(query);
        }
        if (price) {
            data["Price"] = price;
            // Calculate what is 50% of the price 
            const percentage_decrease = 50/100 * price;
            const min_price = price - percentage_decrease
            const query = `AND({Price} >= ${min_price}, {Price} <= ${price})`;
            queryParams.push(query);
        }

        // Concat the query params and close the bracket
        const query = queryParams.join() + ')'
        const URL_WITH_PARAMS = SEARCH_LISTINGS_URL + encodeURIComponent(query);



      // Send data to retrieve the properties
      try {
        console.log(`Sending request for data with params: ${query}`);
        const response = await axios.get(URL_WITH_PARAMS,
        {
            headers: headers
        });
        console.log(`Data is received: ${JSON.stringify(response?.data)}`);
        return JSON.stringify(response?.data);
      } catch (e) {
        console.log(`Failed to get items: ${e}`);
        return 'There was an error while trying to retrieve items from the database';
      }
    }
  
    exports.database_search_config = config;
    exports.database_search = database_search;
  })();