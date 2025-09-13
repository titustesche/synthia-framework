import databaseRoute from "./routes/database";
import {AppDataSource} from "./database/data-source";
import actionRoute from "./routes/actions";
import conversationRoute from "./routes/conversation";
import chatRoute from "./routes/chat";
import userRoute from "./routes/user";
import {authMiddleware} from "./routes/auth/authMiddleware";
// !IMPORTANT! - Do not change these to import, it will break
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const cors = require("cors");
const Express = require("express");

dotenv.config();

const app = Express();
app.set('trust proxy', 1);
app.use(Express.json());
app.use(cors({
    // To be changed with production release
}));
app.use(cookieParser());
app.use(userRoute);
app.use(authMiddleware);
app.use(databaseRoute);
app.use(actionRoute);
app.use(conversationRoute);
app.use(chatRoute);

const port = 3000;

AppDataSource.initialize().then(() => {
    console.log("Data source initialized");
    app.listen(port, () => {
        console.log(`App listening on ${port}`);
    });
}).catch((err) => {
    console.error(err);
});
