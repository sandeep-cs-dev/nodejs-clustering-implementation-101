const { fork } = require('child_process');
const net = require('net');
const os = require('os');
const numCPUs = os.cpus().length;

const workers = [];

// Fork workers
//const op = {execArgv: ['--inspect-brk=0']};

for (let i = 1; i <=numCPUs;i++) {
    //const worker = fork('worker-shared-handle-policy.js',op);
    const worker = fork('worker-shared-handle-policy.js');
    workers.push(worker);
}
const serverHandle = net._createServerHandle(null, 8080, 4,null,null);

    // Pass the server handle to each worker
workers.forEach(worker => {
        worker.send('server', serverHandle);
});

console.log(`Master has passed the handle to workers`);
