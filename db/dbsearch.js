const connectToMongo = require('./dbconnect.js');
const Joi = require('joi');

const searchSchema = Joi.object({
    dbname: Joi.string().min(1).required(),
    collectionName: Joi.string().min(1).required(),
    query: Joi.object().default({}),
    options: Joi.object().default({})
})

async function searchInDatabase(input) {

    const { error, value } = searchSchema.validate(input);
    if(error) {
        return { success: false, error: 'Validation Error: ' + error.message };
    }

    const { dbName, collectionName, query, options } = value;

    try {
        const client = await connectToMongo(); // Reuse the existing connection
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const results = await collection.find(query, options).toArray();

    return { success: true, data: results };
    } catch (err) {
        console.error('Search error:', err);
        return { success: false, error: err.message };
    }
}

module.exports = searchInDatabase;