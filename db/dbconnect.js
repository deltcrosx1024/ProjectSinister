const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoURI = process.env.MONGODB;

const Client = new MongoClient(mongoURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await Client.connect();
        await Client.db("aibotcontainer");
        console.log("Connected to Database");
    } finally {
        await Client.close();
    }
}

run().catch(console.dir);