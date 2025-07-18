const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    console.log("✅ Connected to MongoDB");

    const db = client.db('fresh-harvests');
    const userCollection = db.collection('users');
    const categoryCollection = db.collection('categories');

    // POST: Save a new user
    app.post('/users', async (req, res) => {
      const user = req.body;
      try {
        const result = await userCollection.insertOne(user);
        res.send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        res.status(500).send({ success: false, message: 'Failed to store user', error });
      }
    });

    // GET: Flattened categories
    app.get('/categories', async (req, res) => {
      try {
        const categories = await categoryCollection.find().toArray();

        const allItems = categories.flatMap(cat =>
          Array.isArray(cat.items)
            ? cat.items.map(item => ({
                ...item,
                categoryName: cat.categoryName
              }))
            : []
        );

        res.send({ success: true, data: allItems });
      } catch (error) {
        res.status(500).send({ success: false, error: 'Failed to fetch categories' });
      }
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('🌱 Fresh Harvest Server is Running!');
});

app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
