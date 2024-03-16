require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const client = new MongoClient(mongoUri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db("panaderia");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

const dbPromise = connectDB();

app.get('/api/usuarios', async (req, res) => {
    const db = await dbPromise;
    const collection = db.collection("usuarios");
    const usuarios = await collection.find({}).toArray();
    res.json(usuarios);
});

app.delete('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID format.");
    }
    
    try {
        const db = await dbPromise;
        const collection = db.collection("usuarios");
        const result = await collection.deleteOne({ "_id": new ObjectId(id) });
        
        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Internal server error.");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
//cloud dinario