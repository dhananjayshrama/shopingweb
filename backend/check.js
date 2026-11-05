require("dotenv").config();
const u = process.env.MONGO_URI || "";

console.log("length:", u.length);
console.log("starts:", JSON.stringify(u.slice(0, 14)));
console.log("has < or >:", /[<>]/.test(u));
console.log("has space or quote:", /[\s"']/.test(u));
console.log("non-ascii char:", /[^\x20-\x7E]/.test(u));
console.log("@ count:", (u.match(/@/g) || []).length);
console.log("shape:", u.replace(/:\/\/([^:]+):.*@/, "://$1:*****@"));