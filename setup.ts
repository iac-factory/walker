import "@jest/globals";

process.env = Object.assign(process.env, {
    MOCK: "true"
});
