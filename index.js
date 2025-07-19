const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3moahdm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db('fresh-harvests');
    const userCollection = db.collection('users');
    const categoryCollection = db.collection('categories');
    const blogsCollection = db.collection('blogs');
    const cattegoryCollection = db.collection('cattegories');

    // Save user (POST /users)
    app.post('/users', async (req, res) => {
      const user = req.body;
      try {
        const result = await userCollection.insertOne(user);
        res.send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        res.status(500).send({ success: false, message: 'Failed to store user', error });
      }
    });

    // related-products?category=fruits
app.get('/related-products', async (req, res) => {
  const { category } = req.query;
  try {
    const related = await categoryCollection.find({ category, status: 'active' }).limit(4).toArray();
    res.send({ success: true, data: related });
  } catch (err) {
    res.status(500).send({ success: false, message: 'Failed to fetch related products' });
  }
});

   
// getting categories data 

    app.get('/categories', async (req, res) => {
  try {
    const items = await categoryCollection.find({ status: 'active' }).toArray();
    res.send({ success: true, data: items });
  } catch (error) {
    res.status(500).send({ success: false, error: 'Failed to fetch items' });
  }
});


app.get('/categories/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await categoryCollection.findOne(query);
    res.send({ success: true, data: result });
  } catch (error) {
    res.status(500).send({ success: false, error: 'Item not found' });
  }
});
    

// getting blogs data 

app.get('/blogs', async (req, res) => {
  try {
    const items = await blogsCollection.find({}).toArray(); // Fetch all blogs
    res.send({ success: true, data: items });
  } catch (error) {
    res.status(500).send({ success: false, error: 'Failed to fetch items' });
  }
});
app.get('/blogs/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await blogsCollection.findOne(query);
    res.send({ success: true, data: result });
  } catch (error) {
    res.status(500).send({ success: false, error: 'Item not found' });
  }
});

  } catch (error) {
    console.error(' MongoDB connection failed:', error);
  }
}

run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
  res.send(' Fresh Harvest Server is Running!');
});

app.listen(port, () => {
  console.log(` Server is listening on port ${port}`);
});
