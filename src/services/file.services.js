require("dotenv").config();
const prisma = require("../../config/prisma.config");

const checkFolderPermission = require("../utils/checkFolderPermission");
const defaultResponse = require("../utils/defaultResponse");
const createLog = require("../utils/createLog");
const removeFile = require("../utils/removeFile");

const sha256 = require("sha256");
const fs = require("fs");
const path = require("path");

class FileServices {
  async uploadFile(req) {
    let originalName = req.file.originalname;
    let filename = req.file.filename;
    let logic_path = req.body.folder_id || null;
    let have_public_url = req.body.public_url == 0 ? false : true;

    if (!filename) return defaultResponse(400, `File is required`, null);
    if (!logic_path) return defaultResponse(400, `Folder is required`, null);
    if (!(await checkFolderPermission(file.id, logic_path, "insert_file")))
      return defaultResponse(401, `Unauthorized`, null);
    let folder_exists = await prisma.folder.findFirst({
      where: {
        id: parseInt(logic_path),
      },
    });

    if (!folder_exists) {
      fs.unlink(
        path.join(__dirname, "..", "..", "uploads", filename),
        (err) => {
          if (err) {
            console.error(`[DELETE FILE OUT OF PRISMA: ${filename}] ${err}]`);
            return;
          }
        }
      );

      return defaultResponse(404, `Folder not found`, null);
    }

    let same_name_exists = await prisma.file.findFirst({
      where: {
        AND: [
          {
            name: originalName,
            folderId: parseInt(logic_path),
          },
        ],
      },
    });

    if (same_name_exists) {
      let current_extension = originalName.split(".").pop();
      let file_name = originalName.split(".").slice(0, -1).join(".");
      originalName = `${file_name}-${Date.now()}.${current_extension}`;
    }

    let public_url = "";
    if (have_public_url) {
      public_url = sha256(Date.now().toString() + "_" + filename);
    }

    let file_insert = await prisma.file.create({
      data: {
        name: originalName,
        path: filename,
        folderId: parseInt(logic_path),
        public_url: public_url,
      },
    });

    return defaultResponse(201, `File created successfully`, file_insert);
  }

  async getFileByUrl(req) {
    let valid_origins = JSON.parse(process.env.VALID_ORIGIN_PUBLIC_URL);

    if (
      !valid_origins.includes(req.ip) &&
      !valid_origins.includes(req.headers.host) &&
      !valid_origins.includes("*")
    )
      return defaultResponse(401, `Unauthorized`, null);

    let hash = req.params.hash;

    let file = await prisma.file.findFirst({
      where: {
        public_url: hash,
      },
    });

    if (!file) return defaultResponse(404, `File not found`, null);

    const file_path = path.join(__dirname, "..", "..", "uploads", file.path);
    return file_path;
  }

  async getFile(req) {
    let {
      file_id = null,
      file_name = null,
      folder_id = null,
      render = false,
    } = req.query;

    if (!file_id && !file_name && !folder_id)
      return res
        .status(400)
        .json(
          defaultResponse(
            400,
            `file_id, file_name or folder_id is required`,
            null
          )
        );

    if (folder_id && file_name) {
      let file = await prisma.file.findFirst({
        where: {
          AND: [
            {
              name: file_name,
              folderId: parseInt(folder_id),
            },
          ],
        },
      });

      if (!file)
        return res
          .status(404)
          .json(defaultResponse(404, `File not found`, null));

      if (render) {
        const file_path = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          file.path
        );

        return res.sendFile(file_path);
      } else {
        return res.status(200).json(defaultResponse(200, `File found`, file));
      }
    }

    if (file_id) {
      let file = await prisma.file.findFirst({
        where: {
          id: parseInt(file_id),
        },
      });

      if (!file)
        return res
          .status(404)
          .json(defaultResponse(404, `File not found`, null));

      if (render) {
        const file_path = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          file.path
        );

        return file_path;
      } else {
        return defaultResponse(200, `File found`, file);
      }
    }

    if (folder_id) {
      let files = await prisma.file.findMany({
        where: {
          folderId: parseInt(folder_id),
        },
      });

      if (!files)
        return defaultResponse(404, `Files not found in this folder`, null);

      return defaultResponse(200, `Files found`, files);
    }

    return defaultResponse(
      400,
      `You need to use file_name and folder_id when searching by file_name`,
      null
    );
  }

  async deleteFile(req) {
    let { file_id = null, file_name = null, folder_id = null } = req.query;

    if (!file_id && !file_name && !folder_id)
      return defaultResponse(
        400,
        `file_id, file_name or folder_id is required`,
        null
      );

    if (file_id) {
      const file = await prisma.file.findFirst({
        where: {
          id: parseInt(file_id),
        },
      });

      if (!file) defaultResponse(404, `File not found`, null);

      const delete_file = await prisma.file.delete({
        where: {
          id: parseInt(file_id),
        },
      });

      removeFile(file.path);
      await createLog(req.id, "delete_file", delete_file);

      return defaultResponse(200, `File deleted`, delete_file);
    }

    if (file_name && folder_id) {
      const file = await prisma.file.findFirst({
        where: {
          AND: [
            {
              name: file_name,
              folderId: parseInt(folder_id),
            },
          ],
        },
      });

      if (!file) defaultResponse(404, `File not found`, null);

      const delete_file = await prisma.file.delete({
        where: {
          AND: [
            {
              name: file_name,
              folderId: parseInt(folder_id),
            },
          ],
        },
      });
      removeFile(file.path);

      return defaultResponse(200, `File deleted`, delete_file);
    }
  }

  async createPublicUrl(req) {
    let {
        file_id = null
    } = req.body

    if(!file_id) return defaultResponse(400, `file_id is required`, null)

    let file = await prisma.file.findFirst({
        where: {
            id: parseInt(file_id)
        }
    })

    if(!file) return defaultResponse(404, `File not found`, null)

    let public_url = sha256(Date.now().toString() + "_" + file.name)

    let file_update = await prisma.file.update({
        where: {
            id: parseInt(file_id)
        },
        data: {
            public_url: public_url
        }
    })

    return defaultResponse(200, `Public url created`, file_update)
  }

  async deletePublicUrl(req) {
    let {
        file_id = null
    } = req.body

    if(!file_id) return defaultResponse(400, `file_id is required`, null)

    let file = await prisma.file.findFirst({
        where: {
            id: parseInt(file_id)
        }
    })

    if(!file) return defaultResponse(404, `File not found`, null)

    let file_update = await prisma.file.update({
        where: {
            id: parseInt(file_id)
        },
        data: {
            public_url: ""
        }
    })

    return defaultResponse(200, `Public url deleted`, file_update)
  }
}

module.exports = new FileServices();
