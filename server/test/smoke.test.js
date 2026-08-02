require("module-alias/register");

const { test, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

const app = require("@/app");

let server;
let baseUrl;

before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test("App boots: app là Express app và mount router /api", () => {
    assert.strictEqual(typeof app, "function", "app phải là Express app");
    assert.strictEqual(typeof app.use, "function", "app phải có middleware .use");
});

test("Route public đã đăng ký: GET /api/public/settings/thesis-info trả khác 404", async () => {
    const res = await fetch(`${baseUrl}/api/public/settings/thesis-info`);
    assert.notStrictEqual(res.status, 404, "Route thesis-info chưa được đăng ký");
});

test("Route không tồn tại trả về 404", async () => {
    const res = await fetch(`${baseUrl}/api/path-khong-ton-tai`);
    assert.strictEqual(res.status, 404, "Phải trả 404 cho route không tồn tại");
});

test("Route yêu cầu xác thực chặn khi thiếu token: GET /api/auth/me -> 401", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(res.status, 401, "Phải trả 401 khi thiếu token");
});
