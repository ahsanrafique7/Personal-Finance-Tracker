// const mongoose = require('mongoose');

// // Fix for Windows OpenSSL TLS negotiation issue with MongoDB Atlas
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// const connectDB = async (retries = 5) => {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       console.log(`⏳ MongoDB connection attempt ${attempt}/${retries}...`);
//       const conn = await mongoose.connect(process.env.MONGO_URI, {
//         ssl: true,
//         tls: true,
//         tlsAllowInvalidCertificates: true,
//         tlsAllowInvalidHostnames: true,
//         serverSelectionTimeoutMS: 30000,
//         socketTimeoutMS: 45000,
//         family: 4, // Force IPv4 — avoids common Windows DNS issues
//       });
//       console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//       return; // Success — exit the loop
//     } catch (error) {
//       console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
//       if (attempt < retries) {
//         const wait = attempt * 3000; // 3s, 6s, 9s...
//         console.log(`   Retrying in ${wait / 1000}s...`);
//         await new Promise((r) => setTimeout(r, wait));
//       } else {
//         console.error('❌ All connection attempts failed. Please check your internet/DNS.');
//         process.exit(1);
//       }
//     }
//   }
// };

// module.exports = connectDB;





const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;