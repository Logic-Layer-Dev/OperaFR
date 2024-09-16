const fs = require("fs");
const zmq = require("zeromq");
const path = require("path");

const CHUNK_SIZE = 1024 * 1024;

async function sendFile(filePath) {
  try {
    const stats = await fs.promises.stat(filePath);
    const fileSize = stats.size;
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

    const reqSock = new zmq.Request();
    reqSock.connect("tcp://localhost:5555");

    const pubSock = new zmq.Push();
    await pubSock.bind("tcp://localhost:5556");

    const readStream = fs.createReadStream(filePath, {
      highWaterMark: CHUNK_SIZE,
    });

    let currentChunk = 0;
    let systemFilename = null;

    readStream.on("data", async (chunk) => {
      readStream.pause();

      if (currentChunk === 0) {
        const requestMessage = {
          filename: path.basename(filePath),
        };

        await reqSock.send(JSON.stringify(requestMessage));
        const [reply] = await reqSock.receive();
        const replyData = JSON.parse(reply.toString());

        if (replyData.status === 201) {
          systemFilename = replyData.system_filename;
          console.log("Name received:", systemFilename);
        } else {
          throw new Error(`Error in server: ${replyData.message}`);
        }
      }

      const message = {
        bin: chunk.toString("base64"),
        current_chunk: currentChunk + 1,
        max_chunks: totalChunks,
        system_filename: systemFilename,
      };

      console.log(`Sending chunck ${currentChunk + 1}/${totalChunks}`);
      console.log("Size of chunk:", chunk.length);
      
      await pubSock.send([`${JSON.stringify(message)}`]);
      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })

      currentChunk++;

      if (currentChunk < totalChunks) {
        readStream.resume();
      } else {
        reqSock.close();
        pubSock.close();
        console.log("Uploaded successfully!");
      }
    });

    readStream.on("error", (error) => {
      console.error("Error on file consume:", error);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

const filePath = "LICENSE.md";
sendFile(filePath);
