import  express from "express";
import { userrouter } from "./routes/route";
import cors from "cors";
const app = express();
app.use(cors({
    origin: "*",
}));

app.use(express.json());
app.use("/backend",userrouter)


app.listen(3001);