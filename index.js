const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    origin: ["https://cars-doctor-408d0.web.app", "https://cars-doctor-408d0.firebaseapp.com"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrfwsc1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
// Middlewars
// verify token
const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    console.log(token)
    if (!token) {//no token available
        return res.status(401).send({ message: "Unauthorized Access" })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Unauthorized Access" })
        }
        req.user = decoded;
        // console.log(decoded)
        next();
    })
}
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const serviceCollection = client.db('cars-doctors').collection('services');
        const bookingCollection = client.db('cars-doctors').collection('bookings');
        // auth related apis
        app.post("/jwt", async (req, res) => {
            const userEmail = req.body;
            // console.log(userEmail)
            const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN, { expiresIn: "1h" })
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: "none"
            }).send(token)
        })

        // remove cookies after logout
        app.post("/logout", async (req, res) => {
            res.clearCookie("token", { maxAge: 0 })
                .send({ success: true })
        })

        // service related apis
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                // Include only the `title` and `imdb` fields in the returned document
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };

            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })

        // bookings 
        app.get('/bookings', verifyToken, async (req, res) => {
            // console.log("cookies", req.cookies)
            // console.log("token owner", tokenOwnerInfo)
            if (req.user?.email !== req.query?.email) {
                return res.status(403).send({ message: "Request forbidden" })
            }
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            // console.log(updatedBooking);
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('doctor is running')
})

app.listen(port, () => {
    console.log(`Car Doctor Server is running on port ${port}`)
})