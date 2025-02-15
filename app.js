const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const postRoutes = require("./routes/postRoute");

const app = express();
app.use(express.json());

app.use("/api/posts", postRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
