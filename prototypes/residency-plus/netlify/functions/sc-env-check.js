// Check environment version details
exports.handler = async () => {
    return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            node: process.version,
            hasFetch: typeof fetch !== "undefined",
            globalFetch: typeof global.fetch !== "undefined",
            arch: process.arch,
            platform: process.platform,
            envKeys: Object.keys(process.env).filter(k => k.includes("NETLIFY") || k.includes("NODE"))
        }, null, 2)
    };
};
