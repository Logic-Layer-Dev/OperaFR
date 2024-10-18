require("dotenv").config();

const jwt = require("jsonwebtoken");
const defaultResponse = require("./defaultResponse");
const prisma = require("../../config/prisma.config");

module.exports = async (token) => {
  if (!token) {
    return defaultResponse(401, "Token not send.", null);
  }

  let is_api_token = await prisma.user.findFirst({
    where: {
      api_token: token,
    },
  });

  if (is_api_token) {
    if (!is_api_token.active)
      return defaultResponse(401, "User is inactive.", null);

    let limit = is_api_token.api_expires_at;
    let now = new Date();

    if (now > limit) return defaultResponse(401, "Token expired.", null);
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        reject(defaultResponse(401, "Token not valid (1).", null));
      } else {
        try {
          let user_active = await prisma.user.findFirst({
            where: {
              id: decoded.id,
            },
          });

          if (!user_active) {
            reject(
              defaultResponse(
                401,
                "Current user not found. Go to login route and reauth",
                null
              )
            );
          } else if (!user_active.active) {
            reject(defaultResponse(401, "User is inactive.", null));
          } else {
            resolve(defaultResponse(200, "Token valid (2).", null));
          }
        } catch (error) {
          reject(defaultResponse(500, "Internal server error", error));
        }
      }
    });
  });
};
