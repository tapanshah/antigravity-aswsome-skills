// Minimal CJS Netlify Function v1 test
exports.handler = async function (event, context) {
    return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, type: "CJS_V1" }),
        headers: { "content-type": "application/json" }
    };
};
