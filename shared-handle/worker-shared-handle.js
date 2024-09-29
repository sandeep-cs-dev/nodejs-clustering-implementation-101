const net = require('net');

process.on('message', (message, serverHandle) => {
    if (message === 'server') {
        createServerAndListen(serverHandle);
    }
});

function createServerAndListen(serverHandle) {
    const server = net.createServer(handleConenction);
    server.listen(serverHandle, () => {
        console.log("listening at ", serverHandle.fd);
    })
}

function handleConenction(socket) {
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

console.log(`Worker ${process.pid} started`);
