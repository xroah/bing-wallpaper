import {Configuration} from "webpack"
import {Configuration as ServerConf} from "webpack-dev-server"
import HTMLWebpackPlugin from "html-webpack-plugin"
import path from "path"

export default function genConf(env: {prod?: boolean}) {
    const isProd = env.prod
    const cfg: Configuration = {
        entry: "./src/client/index.ts",
        mode: isProd ? "production" : "development",
        output: {
            path: path.join(__dirname, "dist"),
            filename: "[name].[contenthash].js"
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader"
                },
                {
                    test: /\.s?css$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        "sass-loader"
                    ]
                }
            ]
        },
        plugins: [
            new HTMLWebpackPlugin({
                template: "./index.html",
                inject: "body",
                hash: true
            })
        ]
    }

    if (!isProd) {
        cfg.devServer = {
            port: 8000,
            open: true,
            hot: true
        } as ServerConf
    }

    return cfg
}