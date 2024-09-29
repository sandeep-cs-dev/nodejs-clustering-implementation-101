const net = require('net');

const handleConenction = (socket) => {
    console.log("New connection");

    socket.on('close', () => {
        console.log('Client has disconnected');
    });

    // Handle 'data' event to process data from the client
    socket.on('data', (data) => {
        console.log(`Data received: ${data}`);

        // Write a response to the client, but check if writable first
        if (socket.writable) {
            console.log("writable");
            const responseBody = 'Hello, HTTP World!';
            const response =
                `HTTP/1.1 200 OK\r\n` +  // Status line
                `Content-Type: text/plain\r\n` +  // Content-Type header
                `Content-Length: ${responseBody.length}\r\n` +  // Content-Length header
                `Connection: close\r\n` +  // Close the connection after response
                `\r\n` +  // End of headers
                `${responseBody}`;  // Response body

            // Write the HTTP response to the socket
            socket.write(response);
            socket.end();
        }
    });

}


const server = net.createServer(handleConenction);

// Listen for the message from the primary process
process.on('message', (msg, clientHandle) => {
    if (msg === 'new-conn' && clientHandle) {
        console.log("Received new connection handle in worker");
        onconnection(clientHandle);
    }
});

function onconnection(clientHandle) {
    // Create a socket from the received handle
    const socket = new net.Socket({
        handle: clientHandle,
        allowHalfOpen: server.allowHalfOpen,
        pauseOnCreate: server.pauseOnConnect,
        readable: true,
        writable: true,
        readableHighWaterMark: server.highWaterMark,
        writableHighWaterMark: server.highWaterMark,
    });
    // Attach server properties to the socket
    socket.server = server;
    socket._server = server;
    // Handle connection
    server.emit('connection', socket);
}

// Handle worker shutdown
process.on('SIGINT', () => {
    server.close();
});

console.log(`Worker ${process.pid} started`);