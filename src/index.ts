import databaseRoute from "./routes/database";
import {AppDataSource} from "./database/data-source";
import actionRoute from "./routes/actions";
const cors = require("cors");
const Express = require("express");

const app = Express();
app.use(Express.json());
app.use(cors());
app.use(databaseRoute);
app.use(actionRoute);


const port = 3000;

AppDataSource.initialize().then(() => {
    console.log("Data source initialized");
    app.listen(port, () => {
        console.log(`App listening on ${port}`);
    });
}).catch((err) => {
    console.error(err);
});
