require("dotenv").config();

const zmq = require("zeromq");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const logger = require("../config/logger.config");
const FileService = require("../src/services/file.services");

const uploadsDir = "uploads";
fs.mkdirSync(uploadsDir, { recursive: true });

const runZeroMqReply = async () => {
  const repSock = new zmq.Reply();
  await repSock.bind(`tcp://*:${process.env.ZMQ_REPLY_PORT}`);

  console.log(
    `ZeroMQ server (Request-Reply) listening on port ${process.env.ZMQ_REPLY_PORT}...`
  );

  const fileStreams = new Map();

  try {
    for await (const [msg] of repSock) {
      try {
        const data = JSON.parse(msg.toString());
        const { filename } = data;

        const uniqueFilename = uuidv4() + path.extname(filename);
        const fileResponse = await FileService.uploadFile({
          file: { originalname: filename, filename: uniqueFilename },
          body: { folder_id: 1, public_url: 1 }
        });        

        await repSock.send(
          JSON.stringify({
            status: fileResponse.status,
            message: fileResponse.message,
            system_filename: uniqueFilename,
          })
        );
      } catch (error) {
        logger.error(`Error on ZeroMQ Server (Request-Reply): ${error}`);
        await repSock.send(
          JSON.stringify({
            status: 400,
            message: error.message,
          })
        );
      }
    }
  } catch (error) {
    console.error("Error on ZeroMQ Server (Request-Reply):", error);
    logger.error(`Error on ZeroMQ Server (Request-Reply): ${error}`);
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
