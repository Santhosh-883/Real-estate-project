import bcrypt from "bcrypt";
import { signAuthToken } from "../lib/jwt.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  const { User } = req.app.locals.models;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create user!" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const { User } = req.app.locals.models;

  try {
    const user = await User.findOne({ username }).lean();

    if (!user) return res.status(400).json({ message: "Invalid Credentials!" });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid Credentials!" });

    const age = 1000 * 60 * 60 * 24 * 7;

    const token = await signAuthToken(
      {
        id: user._id.toString(),
        isAdmin: false,
      },
      "7d"
    );

    const { password: userPassword, ...userInfo } = user;
    userInfo.id = user._id.toString();
    delete userInfo._id;

    res
      .cookie("token", token, {
        httpOnly: true,
        // secure:true,
        maxAge: age,
      })
      .status(200)
      .json(userInfo);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to login!" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};
