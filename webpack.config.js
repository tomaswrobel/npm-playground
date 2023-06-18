const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoEditorWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = /** @type {import("webpack").Configuration} */ ({
    entry: "./src/components/code-editor.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.txt$/,
                type: "asset/source"
            },
            {
                test: /\.woff$/,
                type: "asset/resource"
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    plugins: [
        new MonacoEditorWebpackPlugin({
            languages: [
                "css",
                "javascript",
                "typescript"
            ]
        }),
        new HtmlWebpackPlugin({
            title: "NPM Playground"
        })
    ]
})