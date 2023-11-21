import { MongoClient, ObjectId } from 'mongodb';

const agg = [
  {
    $match: {
      product: new ObjectId('615c873ad584c748cc86e5bb'),
    },
  },
  {
    $group: {
      _id: null,
      averageRating: {
        $avg: '$rating',
      },
      numberOfReviews: {
        $sum: 1,
      },
    },
  },
];

const connectionString = ''; 
const dbName = ''; 
const collectionName = ''; 

MongoClient.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  async (connectErr, client) => {
    if (connectErr) {
      console.error('Error connecting to MongoDB:', connectErr);
      return;
    }

    try {
      const db = client.db(dbName);
      const coll = db.collection(collectionName);

      const result = await coll.aggregate(agg).toArray();
      console.log(result);
    } catch (cmdErr) {
      console.error('Error executing aggregation command:', cmdErr);
    } finally {
      client.close();
    }
  }
);
