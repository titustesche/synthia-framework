import databaseRoute from "./routes/database";
import {AppDataSource} from "./database/data-source";
import actionRoute from "./routes/actions";
import conversationRoute from "./routes/conversation";
import chatRoute from "./routes/chat";
// Keep these as require even if your IDE tells you otherwise, it won't work otherwise, dunno why
const cors = require("cors");
const Express = require("express");

const app = Express();
app.use(Express.json());
app.use(cors());
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
