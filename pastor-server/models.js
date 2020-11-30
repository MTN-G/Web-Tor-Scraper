const mongoose = require('mongoose');

const password = process.env.PASSWORD
const dbName = process.env.DBNAME

const url =
    `mongodb+srv://MTN-G:${password}@cluster0.wqqcx.mongodb.net/${dbName}?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const postSchema = new mongoose.Schema({
    Title: String,
    Content: String,
    Author: String,
    Date: Date,
});

postSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Post', postSchema);
