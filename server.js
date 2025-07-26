const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const PORT = 3000;

dotenv.config();

app.use(cors());

const admin = require('./firebaseadmin');

const db = admin.firestore();

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

app.get("/", (req, res) => {
    res.set('Content-Type', 'text/html');
    res.status(200).send("<h1>Hello Rehaan!</h1>");
})

app.post('/add-document', async (req, res) => {
    const { data } = req.body;
    const collection = data.collection;

    try {
        await db.collection(collection).doc().set(data);
        res.status(200).send('Document added successfully');
    } catch (error) {
        const errMsg = "failed to add to " + collection + ": " + error;
        console.log(errMsg);
        res.status(1).send(errMsg);
    }
});
