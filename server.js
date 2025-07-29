const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const PORT = 3000;

dotenv.config();

app.use(cors());

const admin = require('./firebaseadmin');

const db = admin.firestore();

app.use(express.json());

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
    const data = req.body.data;
    const collection = data.collection;
    if (data.edit) {
      try {
        const docRef = db.collection(collection).doc(data.id);
        delete data.collection;
        delete data.id;
        delete data.edit;
        await docRef.update(data);
        res.status(200).send('Document added successfully');
        return 0;
      } catch (error) {
        console.log("Failed to edit document: " + error);
        return -1;
      }
    }
    const moreData = data.moreData;

    let addData = {};

    for (let i = 0; i < moreData.length; i++) {
        addData[Object.keys(moreData[i])[0]] = moreData[i][Object.keys(moreData[i])[0]];
    }

    try {
      await db.collection(collection).doc().set(addData);
      res.status(200).send('Document added successfully');
    } catch (error) {
        const errMsg = "failed to add to " + collection + ": " + error;
        console.log(errMsg);
        res.status(1).send(errMsg);
    }
});

app.get("/get-colls", async (req, res) => {
  const collections = await db.listCollections();
  res.send(collections.map(col => col.id));
});

app.post("/read-collection", async (req, res) => {
  try {
    const collection = req.body.toSend.collection;

    // console.log("-=-------------===")
    // console.log(collection);

    // Specify your collection name
    const collectionRef = db.collection(collection);
    
    // Fetch all documents in the collection
    const snapshot = await collectionRef.get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No documents found' });
    }
    
    // Map documents into a simple array of document data
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Return the documents as JSON
    res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents: ' + error });
  }
});

app.post("/delete-doc/", async (req, res) => {
  const deleteId = req.body.deleteId;
  const collection = req.body.collection;

  try {
    await db.collection(collection).doc(deleteId).delete();
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});