require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./src/routes");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// when testing, use the test db
// if node_env is not set, use the production db

if (process.env.NODE_ENV === "test") {
  mongoose.connect(process.env.MONGODB_URI_TEST, {
    authSource: "admin",
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASS,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
if (process.env.NODE_ENV === "development") {
  mongoose.connect(process.env.MONGODB_URI_DEV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
// when not testing, use the production db
else {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// static files (build of your frontend)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./client", "build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client", "build", "index.html"));
  });
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
