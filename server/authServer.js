require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors")
const jwt = require("jsonwebtoken");

const users = [
  {
    name: "Kyle",
    password: "kyle123pass",
  },
  {
    name: "Jim",
    password: "jim456pass",
  },
];

app.use(express.json());
app.use(cors())

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
  next();
});

let refreshTokens = [];

app.post("/nrtoken", (req, res) => {
  console.log("THIS ROUTE WH");
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken : accessToken });
  });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post("/login", (req, res) => {
  // Authenticate User
  console.log("checking being done", req.body.username, req.body.password);
  for (let i = 0; i < users.length; i++) {
    if (
      users[i].name == req.body.username &&
      users[i].password == req.body.password
    ) {
      console.log("credentials correct");
      break;
    }
    console.log("i hit this");
    return res.sendStatus(404);
  }
  console.log("values exist");
  console.log("logging req body", req.body.username);
  console.log("JJJJJ", JSON.stringify(req.body));

  const username = req.body.username;
  const user = { name: username };
  console.log("authServer user=>", user);

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

app.listen(4000);
