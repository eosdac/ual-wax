module.exports = {
    presets: ["@quasar/babel-preset-app"],
    plugins: [
        [
            "module-resolver",
            {
                root: ["./src"]
            }
        ]
    ]
};
