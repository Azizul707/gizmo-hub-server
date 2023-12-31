const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

app.use( cors() );

app.use( express.json() );
require('dotenv').config();





app.get("/", (req, res) => {
  res.send("GizmoHub is running for sell the product");
});

app.listen(port, () => {
  console.log(`app is running on port:${port}`);
} );




const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hg5h0d4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
      await client.connect();

    const productsCollection = client.db( 'productsDB' ).collection( 'product' );
    const addToCartCollection = client.db('productsDB').collection('addToCart')
    
   
    app.post( '/products', async ( req, res ) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne( newProduct );
      res.send( result );
    } );

    app.post( '/cart', async ( req, res ) => {
      const product = req.body
      const result = await addToCartCollection.insertOne( product );
      res.send( result );
    } );

    app.delete( '/cart/:id', async ( req, res ) => {

      const id = req.params.id;
      const query = { _id: new ObjectId( id ) };
      const result = await addToCartCollection.deleteOne( query );
      res.send( result );
    } );
    
    app.get( '/updateProduct/:id', async ( req, res ) => {
      const id = req.params.id;
      const query = { _id: new ObjectId( id ) };
      const result = await productsCollection.findOne( query );
      res.send( result );
    })

    
    app.get( '/products', async ( req, res ) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send( result );
    } );
    
    app.get( '/cart', async ( req, res ) => {
      const cursor = addToCartCollection.find();
      const result = await cursor.toArray();
      res.send( result );
    } );


    app.get( '/products/select/:brand', async ( req, res ) => {
      const brand = req.params.brand;
      const query = { brandname: brand };
      const cursor = productsCollection.find( query );
      const result = await cursor.toArray();
      res.send( result );
    } );


    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const products = {
        $set: {
          name: updatedProduct.name,
          image: updatedProduct.image,
          type: updatedProduct.category,
          price: updatedProduct.price,
          shortdescription: updatedProduct.description,
          rating: updatedProduct.rating,
        },
      };
      const result = await productsCollection.updateOne(filter, products, options);
      res.send(result);
    });
    

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
