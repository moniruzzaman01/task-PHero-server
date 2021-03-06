const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PHero task server running well.");
});
app.listen(port, () => {
  console.log("listening from", port);
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jwrz65q.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function jwtVerify(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.send("You have no token to access it.");
  }
  const token = header.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      res.send("Forbidden Access");
    } else {
      req.decode = decode;
      next();
    }
  });
}

async function run() {
  try {
    await client.connect();
    const billingCollection = client.db("PHero").collection("billing-list");
    const userCollection = client.db("PHero").collection("user-info");

    app.post("/registration", async (req, res) => {
      const data = req.body;
      const query = { email: data.email };
      const isExist = await userCollection.findOne(query);

      if (!isExist) {
        const result = await userCollection.insertOne(data);
        if (result.acknowledged === true) {
          const accessToken = jwt.sign(
            data.email,
            process.env.ACCESS_TOKEN_SECRET
          );
          return res.send({ accessToken, success: true });
        }
        return res.send({ accessToken: "", success: false });
      }
      return res.send({
        accessToken: "",
        success: false,
        message: "This Email is already taken",
      });
    });
    app.post("/login", async (req, res) => {
      const data = req.body;
      const query = { email: data.email };
      const savedUser = await userCollection.findOne(query);
      if (savedUser) {
        if (savedUser.email === data.email && savedUser.pass === data.pass) {
          const accessToken = jwt.sign(
            data.email,
            process.env.ACCESS_TOKEN_SECRET
          );
          return res.send({ accessToken, success: true });
        }
      }
      return res.send({ success: false, message: "Invalid Email or Password" });
    });
    app.get("/billing-list", jwtVerify, async (req, res) => {
      const pageNumber = parseInt(req.query.pageNumber);
      const result = await billingCollection
        .find({})
        .skip(pageNumber * 10)
        .limit(10)
        .sort("-1")
        .toArray();
      res.send(result);
    });
    app.get("/paid-total", jwtVerify, async (req, res) => {
      const result = await billingCollection.find({}).toArray();
      let total = 0;
      result.forEach((data) => {
        total += parseInt(data.bill);
      });
      res.send({ total });
    });
    app.post("/add-billing", async (req, res) => {
      const data = req.body;
      const result = await billingCollection.insertOne(data);
      res.send(result);
    });
    app.put("/update-billing/:id", jwtVerify, async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: data,
      };
      const result = await billingCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.post("/delete-billing/:id", jwtVerify, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await billingCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/numberOfData", jwtVerify, async (req, res) => {
      const number = await billingCollection.estimatedDocumentCount();
      res.send({ number });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
