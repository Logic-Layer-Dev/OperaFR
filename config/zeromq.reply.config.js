require("dotenv").config();

const zmq = require("zeromq");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const logger = require("../config/logger.config");
const FileService = require("../src/services/file.services");
const validToken = require("../src/utils/validToken");

const uploadsDir = "uploads";
fs.mkdirSync(uploadsDir, { recursive: true });

const runZeroMqReply = async () => {
  const repSock = new zmq.Reply();
  await repSock.bind(`tcp://*:${process.env.ZMQ_REPLY_PORT}`);

  console.log(
    `ZeroMQ server (Request-Reply) listening on port ${process.env.ZMQ_REPLY_PORT}...`
  );

  try {
    for await (const [msg] of repSock) {
      try {
        const data = JSON.parse(msg.toString());
        const { filename, folder_id, token = null, public = false } = data;

        const auth = await validToken(token);

        if (auth.status == 401) {
          await repSock.send(
            JSON.stringify({
              status: 401,
              message: "Token not valid.",
            })
          );
        } else {
          const uniqueFilename = uuidv4() + path.extname(filename);
          const fileResponse = await FileService.uploadFile({
            file: { originalname: filename, filename: uniqueFilename },
            body: { folder_id: folder_id, public_url: public ? 1 : 0 },
          });
  
          await repSock.send(
            JSON.stringify({
              status: fileResponse.status,
              message: fileResponse.message,
              system_filename: uniqueFilename,
              public_url: fileResponse.content.public_url || null,
            })
          );
        }
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
  }
};

module.exports = runZeroMqReply;
