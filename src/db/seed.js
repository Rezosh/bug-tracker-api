const mongoose = require("mongoose");
const User = require("../models/User");

mongoose
  .connect("mongodb://localhost:27017/bugTrackerTest", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error:", err.message);
  });

// const users = [
//   {
//     firstName: "John",
//     lastName: "Doe",
//     email: "johndoe@email.com",
//     password: "password",
//     role: "admin",
//   },
//   {
//     firstName: "Jane",
//     lastName: "Doe",
//     email: "janedoe@email.com",
//     password: "password",
//     role: "user",
//   },
//   {
//     firstName: "John",
//     lastName: "Smith",
//     email: "johnsmith@email.com",
//     password: "password",
//     role: "user",
//   },
// ];

const seed = async () => {
  try {
    await User.deleteMany({});
    // await User.insertMany(users);
  } catch (err) {
    console.log(err);
  }
};

seed()
  .then(() => {
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log(err);
  });
