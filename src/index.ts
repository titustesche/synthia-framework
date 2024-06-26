import userRoute from "./routes/outgoing";
import {AppDataSource} from "./database/data-source";
const Express = require("express");

const app = Express();
app.use(Express.json());
app.use(userRoute)


const port = 3000;

AppDataSource.initialize().then(() => {
    console.log("Data source initialized");
    app.listen(port, () => {
        console.log(`App listening on ${port}`);
    });
}).catch((err) => {
    console.error(err);
});
