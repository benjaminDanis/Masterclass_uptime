const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config')

const server = http.createServer((req, res) => {

});

// Start the server, listen on port 3000
server.listen(config.port, () => {
    console.log('The server is listening on port ' + config.port + ' in ' + config.envName + ' mode.');
})

// All the server logic for both the http and https
const unifiedServer = (req, res) => {

    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP Method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler the request should go to
        // If one is not found, use the not found handler
        // ** Determining which router fn will be used based on the path **
        // ** chosenHandler is called below and passed data and the callback, which takes the status code and the payload **
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            'payload': buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code called back by the handler
            // Or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler
            // Or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request path
            console.log('Returning this reponse: ', statusCode, payloadString);
        });

        
    });
}

// Define the handlers
const handlers = {}

// Sample handler
handlers.sample = (data, cb) => {
    // Callback a http status code, and a payload object
    cb(406, { 'name': 'sample handler' });
};

// Not found handler
handlers.notFound = (data, cb) => {
    cb(404);
}


// Define a request router
const router = {
    'sample': handlers.sample
};



















