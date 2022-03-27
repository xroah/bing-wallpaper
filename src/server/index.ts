import express, {
    NextFunction,
    Request,
    Response
} from "express"
import {start as startTask} from "./task"
import ApiApp from "./api"
import {connect} from "./db"
import path from "path"
import {BASE_DIR, IMAGE_DIR} from "./download-image"

connect(
    () => {
        const app = express()
        const env = process.env

        app.get("/", (_, res) => {
            res.send("Hello")
        })

        if (env["NODE_ENV"] === "development") {
            const imgDir = path.join(BASE_DIR, IMAGE_DIR)

            app.use(`/images/${IMAGE_DIR}`, express.static(imgDir))
        }

        app.use("/api", ApiApp)
        app.use(
            (
                err: Error,
                _: Request,
                res: Response,
                __: NextFunction
            ) => {
                res.json({
                    code: 500,
                    msg: err.message
                })
            }
        )

        app.listen(3000)
        startTask()
    }
)