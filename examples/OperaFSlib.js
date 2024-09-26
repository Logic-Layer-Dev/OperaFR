const operaUploaderLib = require("operafs");

async function main() {
    const operaUploader = await operaUploaderLib.instantiate({
        serverUrl: "localhost",
        token: "<token>",
        requestPort: 5555,
        publishPort: 5556,
    })

    const initialParams = await operaUploader.allocate("package.json", { 
        publicUrl: false,
        folderId: 4
    });

    await operaUploader.upload(initialParams.systemFilename, "package.json");
}

main();