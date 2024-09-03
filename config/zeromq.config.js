const zmq = require("zeromq");

const runZeroMq = async () => {
    const sock = new zmq.Reply();

    await sock.bind("tcp://*:5555");
    console.log("ZeroMQ server listening on port 5555...");

    for await (const [msg] of sock) {
        console.log("Received " + ": [" + msg.toString() + "]");
        await sock.send("ok");
    }
};

module.exports = runZeroMq;
