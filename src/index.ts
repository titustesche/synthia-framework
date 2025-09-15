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

// Set CORS options
const corsOptions = {
    // Get allowed origins from .env
    origin: function(origin, callback) {
        if (!origin || process.env.CORS_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    // Yes, we want cookies - thank you very much
    credentials: true,
    // Only methods needed
    methods: ["GET", "POST", "DELETE", "PATCH"],
    // Only headers used
    allowedHeaders: ["Content-Type"],
}

// Bunch of stuff our express Server should know
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(userRoute);
app.use(authMiddleware);
app.use(databaseRoute);
app.use(actionRoute);
app.use(conversationRoute);
app.use(chatRoute);

// Port to listen on
const port = 3000;

// Try to init the Data Source
AppDataSource.initialize().then(() => {
    // If successful, notify in the console
    console.log("Data source initialized");
    // Initialize Express
    app.listen(port, () => {
        // If successful, notify in the console
        console.log(`App listening on ${port}`);
    });
    // If anything went wrong
    }).catch((err) => {
        // Log that error
        console.error(err);
    });
