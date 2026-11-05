const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const email = process.argv[2];

(async () => {
  if (!email) {
    console.log("Usage: node makeAdmin.js your@email.com");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: "admin" },
    { new: true }
  );
  console.log(user ? `${user.email} is now: ${user.role}` : "User not found");
  await mongoose.disconnect();
})();