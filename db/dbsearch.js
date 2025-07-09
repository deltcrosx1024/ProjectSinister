import mongoose from 'mongoose'; // Import mongoose for database operations
import Joi from 'joi'; // Import Joi for input validation
import dbconnect from './dbconnect.js' // Mongoose connection module

const searchSchema = Joi.object({
  collectionName: Joi.string().min(1).required(),
  query: Joi.object().default({}),
  options: Joi.object().default({})
});

const dbsearch = async (input) => {
  const { error, value } = searchSchema.validate(input);
  if (error) {
    return { success: false, error: 'Validation Error: ' + error.message} && console.error('Validation Error:', error.message);
  }

  const { collectionName, query, options } = value;

  try {
    await dbconnect(); // Ensure mongoose is connected

    // Dynamically create or retrieve a basic schema-based model for the collection
    let model;
    if (mongoose.models[collectionName]) {
      model = mongoose.model(collectionName);
    } else {
      const genericSchema = new mongoose.Schema({}, { strict: false });
      model = mongoose.model(collectionName, genericSchema, collectionName);
    }

    const results = await model.find(query, null, options).lean();

    return { success: true, data: results } && console.log(`Search successful in collection ${collectionName}`, results);
  } catch (err) {
    console.error('Search error:', err);
    return { success: false, error: err.message } && console.error('Error during search:', err.message);
  }
};

export default dbsearch;