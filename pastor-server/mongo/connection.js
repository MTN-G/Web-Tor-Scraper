const mongoose = require("mongoose");

const url = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@cluster0.wqqcx.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`
const connectDb = () => {
    return mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
};

module.exports = connectDb;