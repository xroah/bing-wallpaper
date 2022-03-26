import express, {NextFunction, Request, Response} from "express"
import {start as startTask} from "./task"
import ApiApp from "./api"
import {connect} from "./db"

connect(
    () => {
        const app = express()

        app.get("/", (_, res) => {
            res.send("Hello")
        })

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