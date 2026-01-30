require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const schoolMangeRoutes = require("./routes/scoolManage");
const teacherRoutes = require("./routes/teacherRoutes");
const authRoutes = require("./routes/auth");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
const ejsMate = require("ejs-mate");
const {locals} = require("./middlewares");
const flash = require("connect-flash");
const session = require("express-session");
const School = require("./models/school");

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use(locals);

 /****************Routes***************/
app.use("/school", schoolMangeRoutes);
app.use("/teacher", teacherRoutes);
app.use("/auth", authRoutes);



  
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
connectDB();

// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   limit: 20,
//   message: "Too many requests, please try again later.",
//   standardHeaders: 'draft-7',
//   legacyHeaders: false,
// });

// app.use("/", limiter);

app.get("/", (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    res.render("error", { error: error.message });
  }
});

app.get('/learn-more', (req, res) => {
  res.render('learnMore');
});

app.get('/contact',(req, res) => {
  try {
    res.render('contact');
  } catch (error) {
    res.render("error", { error: error.message });
  }
});
app.listen(PORT, () => {
  console.log("app runnig port is : " + PORT);
});
