import  express from "express";
import { userrouter } from "./routes/route";

const app = express();
app.use(express.json());


app.use("/backend",userrouter)


app.listen(3001);