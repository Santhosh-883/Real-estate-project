import { verifyAuthToken } from "../lib/jwt.js";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  try {
    const payload = await verifyAuthToken(token);
    req.userId = payload.id;
    next();
  } catch (_error) {
    return res.status(403).json({ message: "Token is not Valid!" });
  }
};
