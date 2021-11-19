const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("server in running");
});
// vivorSwitchesUser
// O8gnWxeXEUaJpxxY
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.goxkt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("viborSwitches");
    const switch_collection = database.collection("switches");
    const userSwitchdb = client.db("user_selected_switches");
    const userSelectedSwitch = userSwitchdb.collection("users_Switches");
    const usersCollection = database.collection("existinguser");
    const usersReviewCollection = database.collection("usersReview");
    // getting all swtches
    app.get("/switches", async (req, res) => {
      const cursor = switch_collection.find({});

      const switches = await cursor.toArray();
      res.json(switches);
    });
    // deleting Switch from db
    app.delete("/switches/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await switch_collection.deleteOne(query);
      console.log(result);
      res.json(result);
    });
    // get single switch for details page
    app.get("/checkout/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const eachSwitch = await switch_collection.findOne(query);
      res.json(eachSwitch);
      console.log(id);
    });
    // posting user selected switch
    app.post("/confirmedorder", async (req, res) => {
      const result = await userSelectedSwitch.insertOne(req.body);
      res.send(result);
    });
    // get user selected switches
    app.get("/confirmedorder", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      console.log(query);
      const cursor = userSelectedSwitch.find(query);
      console.log(cursor);

      const usersswitches = await cursor.toArray();
      res.send(usersswitches);
    });
    // getting all user selected switches
    app.get("/allorders", async (req, res) => {
      const cursor = userSelectedSwitch.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });
    // deleting user selected switches
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userSelectedSwitch.deleteOne(query);
      console.log(result);
      res.json(result);
    });
    // cofirming orders
    app.put("/confirm/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = {
        $set: {
          status: "confirm",
        },
      };
      const result = await userSelectedSwitch.updateOne(query, order);
      res.json(result);
    });
    // set users
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    // set admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // finding Admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isadmin = false;
      if (user?.role === "admin") {
        isadmin = true;
      }
      res.json({ admin: isadmin });
    });
    // posting users Review
    app.post("/usersreview", async (req, res) => {
      const review = req.body;
      const result = await usersReviewCollection.insertOne(review);
      console.log(result);
      res.json(result);
    });
    // posting New Product
    app.post("/switches/add", async (req, res) => {
      const product = req.body;
      const result = await switch_collection.insertOne(product);
      console.log(result);
      res.json(result);
    });

    // getting user user review
    app.get("/usersreview", async (req, res) => {
      const cursor = usersReviewCollection.find({});

      const review = await cursor.toArray();
      res.json(review);
    });

    // replace console.dir with your callback to access individual elements
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running on the port ${port}`);
});
