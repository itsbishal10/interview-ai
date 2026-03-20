require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")


connectToDB()


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// app.listen(3000, ()=>{
//     console.log("server is running on port 3000")
// })