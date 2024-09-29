const net = require('net');

const server = net.createServer((socket) => {
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
   
});

// Listen for the message from the primary process
process.on('message', (msg, clientHandle) => {

    const self = server;
    if (msg === 'new-conn' && clientHandle) {
        console.log("Received new connection handle in worker");

        // Create a socket from the received handle
        const socket = new net.Socket({
            handle:clientHandle,
            allowHalfOpen: self.allowHalfOpen,
            pauseOnCreate: self.pauseOnConnect,
            readable: true,
            writable: true,
            readableHighWaterMark: self.highWaterMark,
            writableHighWaterMark: self.highWaterMark,
          });

        // Attach server properties to the socket
        socket.server = server;
        socket._server = server;
        // Handle connection
        server.emit('connection',socket); 
    }
});

// Handle worker shutdown
process.on('SIGINT', () => {
    server.close();
});

console.log(`Worker ${process.pid} started`);
