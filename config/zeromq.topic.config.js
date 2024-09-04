const zmq = require("zeromq");
const fs = require("fs");
const path = require("path");

const uploadsDir = "uploads";

const runZeroMqTopic = async () => {
  const sock = new zmq.Pull();

  sock.connect("tcp://localhost:5556");
  console.log("ZeroMQ server (Publisher-Subscriber) listening on port 5556...");

  for await (const [msg] of sock) {
    const message = JSON.parse(msg.toString());
    const { bin, current_chunk, system_filename } = message;

    const filePath = path.join(uploadsDir, system_filename);
    const buffer = Buffer.from(bin, "base64");

    const fileMode = current_chunk === 1 ? 'w' : 'a'; 
    fs.writeFileSync(filePath, buffer, { flag: fileMode });
  }
};

module.exports = runZeroMqTopic;