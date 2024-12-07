import actionTypes from "../blueprints/actionTypes";
import {EventEmitter} from "events";

export class ActionProcessor {
    type: any;
    options: string;
    action: string;

    constructor(type: any, options: string, action: string) {
        this.type = type;
        this.options = options;
        this.action = action;
    }

    async Process(): Promise<EventEmitter> {
        const emitter = new EventEmitter();

        switch (this.type) {
            case actionTypes.databaseRead:
                console.log("Attempting Database read");

                // Handle reading

                break;

            case actionTypes.databaseWrite:
                console.log("Attempting Database write");

                // Handle writing

                break;

            case actionTypes.program:
                console.log("Attempting program execution");

                // Handle programs

                break;
        }

        return emitter;
    }
}

let processor = new ActionProcessor(actionTypes.program, "test1", "test2");