require("dotenv").config();

const zmq = require("zeromq");
const fs = require("fs");
const path = require("path");
const logger = require("../config/logger.config");

const uploadsDir = "uploads";

const runZeroMqTopic = async () => {
  try {
    const sock = new zmq.Pull();

    sock.connect(`tcp://localhost:${process.env.ZMQ_PUSH_PORT}`);
    console.log(
      `ZeroMQ server (Publisher-Subscriber) listening on port ${process.env.ZMQ_PUSH_PORT}...`
    );

    for await (const [msg] of sock) {
      const message = JSON.parse(msg.toString());
      const { bin, current_chunk, system_filename } = message;

      const filePath = path.join(uploadsDir, system_filename);
      const buffer = Buffer.from(bin, "base64");

      const fileMode = current_chunk === 1 ? "w" : "a";
      fs.writeFileSync(filePath, buffer, { flag: fileMode });
    }
  } catch (error) {
    console.error("Error on ZeroMQ Server (Publisher-Subscriber):", error);
    logger.error(`Error on ZeroMQ Server (Publisher-Subscriber): ${error}`);
  }
};

module.exports = runZeroMqTopic;
