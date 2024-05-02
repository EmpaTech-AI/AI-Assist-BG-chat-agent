(async () => {
  const axios = require('axios')
  const config = {
    "type": "function",
    "function": {
      "name": "fetch_properties_sofia",
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
          "rooms": {
            "type":
              "integer",
            "description":
              "Number of rooms."
          },
          "status": {
            "type":
              "string",
            "description":
              "Status of the listing (for example, 'For Sale', 'For Rent')."
          },
          "url": {
            "type":
              "string",
            "description":
              "URL for the real estate listing."
          },
          "price": {
            "type":
              "integer",
            "description":
              "Price point. Adjusts for a range around the specified value."
          },
          "size": {
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
  async function fetch_properties_sofia(params) {
    // Environment variables
    const SEARCH_LISTINGS_URL = process.env['SEARCH_LISTINGS_URL'] + 'Sofia?filterByFormula=AND(';
    const AIRTABLE_API_KEY = process.env['PROPERTIES_AIRTABLE_API_KEY'];

    if (!SEARCH_LISTINGS_URL) {
      return 'missing SEARCH_LISTINGS_URL environment variable'
    }

    // headers
    const headers = {
      "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
    }

    // Extracting information from arguments
    const { rooms, price, status, size, location } = params;

    // filterByFormula=AND(FIND('кв. Лозенец', {Location}) > 0, AND({Beds} = '2'),  AND({Home Size} = '150 кв.м.'), AND({Price} >= 150000, {Price} <= 200000))
    // Preparing query parameters
    const data = {};
    let queryParams = [];

    if (location) {
      data["Location"] = location;
      const query = `FIND('${location}',{Location}) > 0`;
      queryParams.push(query);
    }

    if (rooms) {
      data["Rooms"] = rooms;
      const query = `AND({Rooms} = ${rooms})`;
      queryParams.push(query);
    }

    if (status) {
      data["Status"] = status;
      const query = 'AND({Status} = ${status})';
      queryParams.push(query);
    }

    if (price) {
      data["Price"] = price;
      // Calculate what is 30% of the price 
      const percentage_decrease = 30 / 100 * price;
      const min_price = price - percentage_decrease
      const query = `AND({Price} >= ${min_price}, {Price} <= ${price})`;
      queryParams.push(query);
    }

    if (size) {
      data["Size"] = size;
      // Calculate what is 20% of the size
      const percentage_buffer = 20 / 100 * size;
      const min_home_size = size - percentage_buffer;
      const max_home_size = size + percentage_buffer;
      const query = `AND({Size} >= ${min_home_size}, {Size} <= ${max_home_size})`;
      queryParams.push(query);
    }

    // Concat the query params and close the bracket
    const query = queryParams.join() + ')'
    const URL_WITH_PARAMS = SEARCH_LISTINGS_URL + encodeURIComponent(query);
    console.log(URL_WITH_PARAMS + '--- query -> ' + query)

    // Send data to retrieve the properties
    try {
      const response = await axios.get(URL_WITH_PARAMS,
        {
          headers: headers
        });
      console.log(JSON.stringify(response?.data));
      return JSON.stringify(response?.data);
    } catch (e) {
      console.log(`Failed to get properties: ${e}`);
      return 'There was an error while trying to retrieve listed properties';
    }
  }

  exports.fetch_properties_sofia_config = config;
  exports.fetch_properties_sofia = fetch_properties_sofia;
})();
