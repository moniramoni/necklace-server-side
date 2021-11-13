// require express, mongodb, objectId, cors, dotenv
const express = require('express');
const { MongoClient } =require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// database access credentials & secure from .env file  & client create
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hpa1s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })


// async function
async function run() {
    try{
        await client.connect();
        const ProductsCollection = client.db("necklace").collection("Products");
        const orderCollection = client.db("necklace").collection("orders");
        const reviewsCollection = client.db("necklace").collection("reviews");
        const usersCollection = client.db("necklace").collection("users");



        // add Products
        app.post("/addProducts", async (req, res) => {
            const result = await ProductsCollection.insertOne(req.body);
            console.log(result);
            res.send(result);
        });

        // get Products
        app.get("/addProducts", async (req, res) => {
            const cursor = ProductsCollection.find({})
            const services = await cursor.toArray();
            res.send(services);
        });

        // get singleProduct
        app.get("/singleProduct/:id", (req, res) => {
            ProductsCollection
            .findOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send(result)
            })
        });

        // -----------------------------------------

        // delete Products
        app.delete('/singleProduct/:id', async (req, res) => {
            console.log('id: ', req.params.id)
            const result = await ProductsCollection.deleteOne({_id:ObjectId(req.params.id)})
            res.send(result)
        })

        // -----------------------------------------

        // add myOrder 
        app.post('/myOrders', async (req, res) => {
            const result = await orderCollection.insertOne(req.body);
            res.send(result)
        })

        // get myOrder
        app.get("/myOrders/:email", async (req, res) => {
            const email = req.params.email;
            const result = await orderCollection.find({ email }).toArray();
            res.send(result);
        });

        
        // delete myOrders
        app.delete('/deleteMyOrders/:id', async (req, res) => {
            console.log('id: ', req.params.id)
            const result = await orderCollection.deleteOne({_id:ObjectId(req.params.id)})
            res.send(result)
        })

        // get manageOrders
        app.get("/manageOrders", async (req, res) => {
            const cursor = orderCollection.find({})
            const services = await cursor.toArray();
            res.send(services);
        });

        // delete manageOrders
        app.delete('/deleteManageOrders/:id', async (req, res) => {
            console.log('id: ', req.params.id)
            const result = await orderCollection.deleteOne({_id:ObjectId(req.params.id)})
            res.send(result)
        })


        // manageOrders Approve Status /(Update)
        app.put("/manageOrderUpdate/:id", async (req, res) => {
            const updateId = req.params.id;
            const updatedStatus = req.body;
            console.log(updatedStatus);
            const filter = { _id: ObjectId(updateId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedStatus.status,
                },
            };
            const approved = await orderCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            // console.log(result);
            res.json(approved);
        });

        
         // review
        app.post('/reviews', async (req, res) => {
            const result = await reviewsCollection.insertOne(req.body);
            res.send(result)
        })


         // user
        app.post('/users', async (req, res) => {
            const result = await usersCollection.insertOne(req.body);
            res.send(result)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        // user put
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        // make admin
        app.put("/makeAdmin", async (req, res) => {
            const filter = { email: req.body.email };
            const result = await usersCollection.find(filter).toArray();
            if (result) {
              const documents = await usersCollection.updateOne(filter, {
                $set: { role: "admin" },
              });
              console.log(documents);
              console.log(result)
            }
        });
        


    }
    finally{
        // await client.close()
    }
}
run().catch(console.dir);


// default node express route api setup
app.get('/', (req,res) => {
    res.send('hello node necklace is here')
})

app.listen(port, () => {
    console.log('running port on port', port)
})