(async () => {
    const axios = require('axios')
    const config = {
        "type": "function",
        "function": {
            "name": "search_real_estate_listings",
            "description":
            "Search for real estate listings based on various parameters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type":
                        "string",
                        "description":
                        "Location to search (city, zip code, or address)."
                    },
                    "offset": {
                        "type": "number",
                        "description": "Offset results. Default is 0."
                    },
                    "limit": {
                        "type": "number",
                        "description":
                        "Number of results to return. Default is 50."
                    },
                    "beds": {
                        "type":
                        "integer",
                        "description":
                        "Number of bedrooms. Sets both minimum and maximum."
                    },
                    "baths": {
                        "type":
                        "integer",
                        "description":
                        "Number of bathrooms. Sets both minimum and maximum."
                    },
                    "price": {
                        "type":
                        "integer",
                        "description":
                        "Price point. Adjusts for a range around the specified value."
                    },
                    "home_size": {
                        "type":
                        "integer",
                        "description":
                        "Home size in square feet. Adjusts for a range around the specified size."
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
    async function search_real_estate_listings(params) {
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
        const { beds, baths, price, home_size, location } = params;

        // filterByFormula=AND(FIND('кв. Лозенец', {Location}) > 0, AND({Beds} = '2'),  AND({Home Size} = '150 кв.м.'), AND({Price} >= 150000, {Price} <= 200000))
        // Preparing query parameters
        const data = {};
        let queryParams = [];


        if (location) {
            data["Location"] = location;
            const query = `FIND('${location}',{Location}) > 0`;
            queryParams.push(query);
        }

        if (beds) {
            data["Beds"] = beds;
            const query = `AND({Beds} = ${beds})`;
            queryParams.push(query);
        }

        if (baths) {
            data["Baths"] = baths;
            const query = `AND({Baths} = ${baths})`;
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

        if (home_size) {
            data["Home size"] = home_size
            // Calculate what is 30% of the home_size 
            const percentage_decrease = 30/100 * home_size;
            const min_home_size = home_size - percentage_decrease
            const query = `AND({Home size} >= ${min_home_size}, {Home size} <= ${price})`;
            queryParams.push(query);
        }

        // Concat the query params and close the bracket
        const query = queryParams.join() + ')'
        const URL_WITH_PARAMS = SEARCH_LISTINGS_URL + encodeURIComponent(query);

      // Send data to retrieve the properties
      try {
        const response = await axios.get(URL_WITH_PARAMS,
        {
            headers: headers
        });
        return JSON.stringify(response?.data);
      } catch (e) {
        console.log(`Failed to get properties: ${e}`);
        return 'There was an error while trying to retrieve listed properties';
      }
    }
  
    exports.search_real_estate_listings_config = config;
    exports.search_real_estate_listings = search_real_estate_listings;
  })();