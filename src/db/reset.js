// teardown test db
const mongoose = require("mongoose");

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

const reset = async () => {
  try {
    await mongoose.connection.dropDatabase();
  } catch (err) {
    console.log(err);
  }
};
reset()
  .then(() => {
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log(err);
  });
