const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
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
// const uri = `mongodb+srv://PHero_task_user:pwci1tkDsg2RVXZY@cluster0.jwrz65q.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const billingCollection = client.db("PHero").collection("billing-list");

    app.post("/registration", async (req, res) => {});
    app.get("/login", async (req, res) => {});
    app.get("/billing-list", async (req, res) => {});
    app.post("/add-billing", async (req, res) => {});
    app.post("/update-billing/:id", async (req, res) => {});
    app.post("/delete-billing/:id", async (req, res) => {});
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
