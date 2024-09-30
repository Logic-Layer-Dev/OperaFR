const operaUploaderLib = require("operafr");

async function main() {
    const operaUploader = await operaUploaderLib.instantiate({
        serverUrl: "localhost",
        token: "<token>",
        requestPort: 5555,
        publishPort: 5556,
    })

    const initialParams = await operaUploader.allocate("<filepath>", { 
        publicUrl: false,
        folderId: 4 // Example folderId
    });

    await operaUploader.upload(initialParams.systemFilename, "<filepath>", {chunckSize: (1024 * 1024) * 4}); // 4MB example
}

main();