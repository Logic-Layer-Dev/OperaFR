const zmq = require("zeromq");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const uploadsDir = "uploads";
fs.mkdirSync(uploadsDir, { recursive: true });

const runZeroMqReply = async () => {
  const repSock = new zmq.Reply();
  await repSock.bind("tcp://*:5555");

  console.log("ZeroMQ server (Request-Reply) listening on port 5555...");

  const fileStreams = new Map();

  try {
    for await (const [msg] of repSock) {
      try {
        const data = JSON.parse(msg.toString());
        const { filename } = data;

        const uniqueFilename = uuidv4() + path.extname(filename);
        const filePath = path.join(uploadsDir, uniqueFilename);

        fs.writeFileSync(filePath, "", "utf8");

        fileStreams.set(uniqueFilename, { filePath });

        await repSock.send(
          JSON.stringify({
            status: "ok",
            system_filename: uniqueFilename,
          })
        );
      } catch (error) {
        await repSock.send(
          JSON.stringify({
            status: "error",
            message: error.message,
          })
        );
      }
    }
  } catch (error) {
    console.error("Error on ZeroMQ Server (Request-Reply):", error);
  } finally {
    repSock.close();
    console.log("ZeroMQ (Request-Reply) closed.");

    for (const { filePath } of fileStreams.values()) {
      fs.closeSync(fs.openSync(filePath, "r+")); //
    }
    fileStreams.clear();
  }
};

module.exports = runZeroMqReply;
