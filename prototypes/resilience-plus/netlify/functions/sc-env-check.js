// Check environment version
exports.handler = async () => {
    return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            node: process.version,
            hasFetch: typeof fetch !== "undefined",
            env: Object.keys(process.env).filter(k => k.includes("NETLIFY"))
        })
    };
};
