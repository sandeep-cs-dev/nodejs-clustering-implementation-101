const { fork } = require('child_process');
const net = require('net');
const os = require('os');
const numCPUs = os.cpus().length;
const workers = [];
let workerIndex = 0;

// Fork workers 
for (let i = 8; i <=numCPUs; i++) {
    const worker = fork('worker-round-robin-policy.js'); // Fork the worker process
    workers.push(worker);
}

// Create the server in the primary process
let server = net.createServer();
let handle;

// Start listening on the server
server.listen({ port: 8080 });

// Once the server starts listening, get the handle for the server
server.once('listening', () => {
    handle = server._handle;
    console.log("Server listening on port 8080, server handle fd:", handle.fd);   
    // Start accepting new connections
    acceptConnection();
});

// Function to handle new connections
function acceptConnection() {
    // The server handle will receive new connections
    handle.onconnection = (err, clientHandle) => {
        if (err) {
            console.error("Error receiving new connection:", err);
            return;
        }
        console.log("New connection received, handle fd:", clientHandle.fd);
        // Distribute the connection to the workers
        distribute(clientHandle);
    };
}

// Function to distribute connections to workers
function distribute(clientHandle) {
    workerIndex = (workerIndex + 1) % workers.length;
    const worker = workers[workerIndex];
    worker.send("new-conn", clientHandle);  // Passing the handle properly to the worker
}
