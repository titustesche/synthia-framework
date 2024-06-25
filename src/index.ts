import userRoute from "./routes/outgoing";
import Express from 'express';

const app = Express();
app.use(Express.json());
app.use(userRoute)


const port = 3000;

app.listen(port, () => {
    console.log(`App listening on ${port}`);
});