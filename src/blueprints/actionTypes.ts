// Types of actions the AI can perform
// Split into Database access and code execution
const actionTypes = Object.freeze({
    databaseRead: "dbread",
    databaseWrite: "dbwrite",
    program: "exec",
});

export default actionTypes;