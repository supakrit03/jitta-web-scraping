const express = require("express");

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).send("test");
});

router.get("/foo", (req, res) => {
  res.status(200).send("foo route 123");
});

app.use("/api", router);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
