import  express from "express";

const app = express();
app.use(express.json());


app.use("/backend",userrouter)


app.listen(3000);