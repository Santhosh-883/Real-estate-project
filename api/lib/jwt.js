import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  if (!process.env.JWT_SECRET_KEY) {
    console.error("JWT_SECRET_KEY is missing!");
    return new TextEncoder().encode("fallback_secret_key_change_me");
  }
  return new TextEncoder().encode(process.env.JWT_SECRET_KEY);
};

export const signAuthToken = async (payload, expiresIn = "7d") => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
};

export const verifyAuthToken = async (token) => {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
};
