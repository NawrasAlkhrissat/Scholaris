const express = require("express");
const router = express.Router();

const User = require("../models/user");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const bcrypt = require("bcrypt");
const saltRounds = 12;
const upload = require("../utils/upload");

router.get("/signup", (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.post("/signup", upload.single("photo"), async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profile: {
        photo: "/images/" + req.file.filename,
        bio: req.body.bio,
      },
    });
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/");
    console.log(hashedPassword);
  } catch (err) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

router.get("/login", (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("action", "invalidCredentials");
      return res.redirect("/auth/login");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      req.flash("action", "invalidCredentials");
      return res.redirect("/auth/login");
    }
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true });
    req.flash("action", "authenticated");
    res.redirect(`/school/user/${user._id}`);
  } catch (err) {
    req.flash("action", "invalidCredentials");
    res.redirect("/auth/login");
  }
});

router.get("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    req.flash("action", "logout");
    res.redirect("/auth/login");
  } catch (error) {
    res.render("error", {
      error: "Ops something went wrong please try again later",
    });
  }
});

module.exports = router;
