import { isProductionEnvironment } from "..";

declare var process: any;

test("`isProductionEnvironment()` returns `false` with `process.env` not being defined", () => {
    process = {};
    expect(isProductionEnvironment()).toBe(false);
});

test("`isProductionEnvironment()` returns `true` in a production environment", () => {
    process = {
        ...process,
        env: {}
    };
    expect(isProductionEnvironment()).toBe(false);
});

test("`isProductionEnvironment()` returns `false` in a production environment", () => {
    process = {
        ...process,
        env: { NODE_ENV: "production"}
    };
    expect(isProductionEnvironment()).toBe(true);
});
