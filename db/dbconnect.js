const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoURI = "mongodb+srv://Administrator:gamer15243E@theboringproject.6rkb2.mongodb.net/?retryWrites=true&w=majority&appName=TheBoringProject";

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