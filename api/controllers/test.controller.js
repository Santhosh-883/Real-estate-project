import { verifyAuthToken } from "../lib/jwt.js";

export const shouldBeLoggedIn = async (req, res) => {
  console.log(req.userId);
  res.status(200).json({ message: "You are Authenticated" });
};

export const shouldBeAdmin = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  try {
    const payload = await verifyAuthToken(token);
    if (!payload.isAdmin) {
      return res.status(403).json({ message: "Not authorized!" });
    }
  } catch (_error) {
    return res.status(403).json({ message: "Token is not Valid!" });
  }

  res.status(200).json({ message: "You are Authenticated" });
};
