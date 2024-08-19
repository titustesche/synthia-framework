import {Router} from "express";
import {z} from "zod";
import {processRequestBody} from "zod-express-middleware";
import * as path from "node:path";
const fs = require('fs');
const spawn = require('child_process').spawn;

const actionRoute = Router();

const receiveSchema = z.object({
    query: z.string(),
})

actionRoute.post('/action', processRequestBody(receiveSchema), async (req, res) => {
    let filepath = path.resolve('tmp/script.py');
    let script = "import os\nimport webbrowser\nimport time\nimport random\nimport tkinter as tk\n" + req.body.query;
    fs.writeFile(filepath, script, (err: any) => {
        if (err) {
            console.error(err);
            return res.status(500).json({"error": err.message});
        }

        else
        {
            const pythonProcess = spawn('python', [filepath], { stdio: 'inherit' });
            pythonProcess.on('error', (e: { message: any; }) => {
                return res.status(500).json({"error": e.message});
            })
            pythonProcess.on('data', (data: any) => {
                res.status(200).json(data);
            });
            pythonProcess.on('close', (e: any) => {
                return res.status(200).json(e);
            });
        }
    })
})

export default actionRoute;