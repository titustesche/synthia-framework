import {Router} from "express";
import {z} from "zod";
import {processRequestBody} from "zod-express-middleware";
import * as path from "node:path";
// Same as in the index.ts, keep these as require
const fs = require('fs');
const { spawn } = require('child_process');

const actionRoute = Router();

const receiveSchema = z.object({
    query: z.string(),
})

actionRoute.post('/action', processRequestBody(receiveSchema), async (req, res) => {
    try {
        const user = req.user!;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');
        let filepath = path.resolve('src/scripts/temp.py');
        let script = "import os\nimport webbrowser\nimport time\nimport random\nimport tkinter as tk\n" + req.body.query;
        fs.writeFile(filepath, script, (err: any) => {
            if (err) {
                console.error(err);
                return res.status(500).json({"error": err.message});
            } else {
                const pythonProcess = spawn('python', ['-u', filepath]);

                // Todo: Make sure to not send two chunks of data at the same time
                //      Sometimes when there is only one output and the script closes immediately after,
                //      the output and exit code will be sent together, resulting in an invalid JSON string
                pythonProcess.stdout.on('data', async (data: any) => {
                    let chunk = data.toString('utf-8');
                    res.write(JSON.stringify({"data": chunk}));
                    res.flushHeaders();
                    // res.status(200).json(data);
                });

                pythonProcess.stderr.on('data', async (err: any) => {
                    res.write(JSON.stringify({"error": new TextDecoder().decode(err)}));
                    res.flushHeaders();
                });

                pythonProcess.on('close', (code: any) => {
                    res.write(JSON.stringify({"code": code}));
                    return res.end();
                })
            }
        });
    }

    catch (e) {
        return res.status(500).json({error: "Internal server error"});
    }
});

export default actionRoute;