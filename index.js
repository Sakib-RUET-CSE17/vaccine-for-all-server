const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

const port = process.env.PORT || 5000

app.use(cors())
app.use(bodyParser.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejoil.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    console.log('connection err', err)
    const vaccineCollection = client.db(process.env.DB_NAME).collection("vaccines");
    const ordersCollection = client.db(process.env.DB_NAME).collection("orders");
    const adminCollection = client.db(process.env.DB_NAME).collection("admins")

    app.get('/vaccines', (req, res) => {
        vaccineCollection.find({})
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.get('/vaccine/:id', (req, res) => {
        console.log(req.params.id)
        bikeCollection.find({ _id: ObjectID(req.params.id) })
            .toArray((err, items) => {
                res.send(items[0])
            })
    })

    app.post('/addVaccine', (req, res) => {
        const newVaccine = req.body
        console.log('adding new vaccine:', newVaccine)
        vaccineCollection.insertOne(newVaccine)
            .then(result => {
                console.log('inserted Count', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/addAdmin', (req, res) => {
        const newAdmin = req.body
        console.log('adding new admin:', newAdmin)
        adminCollection.insertOne(newAdmin)
            .then(result => {
                console.log('inserted Count', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0)

            })
    })

    app.delete('/deleteVaccine/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        console.log('delete this', id)
        vaccineCollection.findOneAndDelete({ _id: id })
            .then(documents => res.send(!!documents.value))
    })

    app.patch('/updateVaccine/:id', (req, res) => {
        console.log(req.body)
        vaccineCollection.updateOne({ _id: ObjectID(req.params.id) },
            {
                $set: { price: req.body.price }
            }
        )
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    app.post('/addOrder', (req, res) => {
        const order = req.body
        console.log(order)
        ordersCollection.insertOne(order)
            .then(result => {
                console.log(result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/orders', (req, res) => {
        const queryEmail = req.query.email
        adminCollection.find({ email: queryEmail })
            .toArray((err, admins) => {
                const filter = {}
                if (admins.length === 0) {
                    filter.email = queryEmail
                }
                ordersCollection.find(filter)
                    .toArray((err, orders) => {
                        res.send(orders)
                    })
            })
    })
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)