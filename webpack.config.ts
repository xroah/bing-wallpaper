import {Configuration} from "webpack"
import {Configuration as ServerConf} from "webpack-dev-server"
import HTMLWebpackPlugin from "html-webpack-plugin"
import MiniCSSExtractPlugin from "mini-css-extract-plugin"
import {CleanWebpackPlugin} from "clean-webpack-plugin"
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
        resolve: {
            extensions: [".js", ".ts"]
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    use: "html-loader"
                },
                {
                    test: /\.ts$/,
                    use: "ts-loader"
                },
                {
                    test: /\.s?css$/,
                    use: [
                        isProd ? MiniCSSExtractPlugin.loader : "style-loader",
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
    } else {
        cfg.plugins!.push(
            new MiniCSSExtractPlugin({
                filename: "[name].[contenthash].css"
            }),
            new CleanWebpackPlugin()
        )
    }

    return cfg
}