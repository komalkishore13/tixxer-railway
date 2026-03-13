const { connectToDatabase } = require('../lib/mongodb');

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('bookings');

    if (req.method === 'POST') {
      const booking = req.body;

      if (!booking || !booking.pnr) {
        res.status(400).json({ error: 'Invalid booking data: pnr is required' });
        return;
      }

      booking.createdAt = new Date();

      const result = await collection.insertOne(booking);

      res.status(201).json({
        success: true,
        insertedId: result.insertedId
      });

    } else if (req.method === 'GET') {
      const bookings = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      res.status(200).json(bookings);

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
