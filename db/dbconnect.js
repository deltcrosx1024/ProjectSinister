const { MongoClient, ServerApiVersion } = require('mongodb');
const { mongodb_uri } = require('../config.json');

const Client = new MongoClient(mongodb_uri, {
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