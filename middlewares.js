const User = require("./models/user");
const Subject = require("./models/subject");
const School = require("./models/school");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;


const locals = (async(req, res, next) => {
  const school = await School.findOne();
  res.locals.firstName = null;
  res.locals.isAuthenticated = false;
  res.locals.role = null;
  res.locals.lastName = null;
  res.locals.email = null;
  res.locals.userId = null;
  res.locals.action = req.flash("action");
  res.locals.school = school; 

  const token = req.cookies.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, jwtSecret);

    res.locals.role = decoded.role;
    res.locals.isAuthenticated = true;
    res.locals.firstName = decoded.firstName;
    res.locals.lastName = decoded.lastName;
    res.locals.email = decoded.email;
    res.locals.userId = decoded.id;
  } catch (err) {
    res.clearCookie("token");
  }

  next();
});

const isLoggedIn =async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      req.flash("action", "notAuthenticated");
      return res.redirect("/auth/login");
    }
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id);
    req.user = {
      id: decoded.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
    next();
  } catch (err) {
    req.flash("action", "notAuthenticated");
    res.redirect("/auth/login");
  }
};

const isAdmin = (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      req.flash("action", "forbidden");
      return res.redirect("/school/user/" + user.id);
    }
    next();
  } catch (err) {
    req.flash("action", "error");
    res.redirect("/error");
  }
};

const checkAssingedClass = async(req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.assingedClass) {
      req.flash("action", "notAllowed");
      return res.redirect("/school/user/" + user.id);
    }
    if (!user.assingedClass.includes(req.params.classId)) {
      req.flash("action", "notAllowed");
      return res.redirect("/school/user/" + user.id);
    }
    next();
  } catch (err) {
    req.flash("action", "error");
    res.redirect("/error");
  }
}

const checkTeachersSubject = async(req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.subjects) {
      req.flash("action", "notAllowed");
      return res.redirect("/school/user/" + user.id);
    }
    if (!user.subjects.includes(req.params.subjectId)) {
      req.flash("action", "notAllowed");
      return res.redirect("/school/user/" + user.id);
    }
    next();
  } catch (err) {
    req.flash("action", "error");
    res.redirect("/error");
  }
}

const isItSubjectsClass = async(req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) {
      req.flash("action", "notAllowed");
      return res.redirect("/school/user/" + req.user.id);
    }
    if (!subject.class) { 
      req.flash("action", "notAllowed");
      return res.redirect("/school/user/" + req.user.id);
    }
    if (subject.class.toString() !== req.params.classId) {
      req.flash("action", "notAllowed");
      return res.redirect("/school/user/" + req.user.id);
    }
    next();
  } catch (err) {
    req.flash("action", "error");
    res.redirect("/error");
  }
}

module.exports ={
    isLoggedIn,
    isAdmin,
    checkAssingedClass,
    checkTeachersSubject,
    isItSubjectsClass,
    locals
}