import express from "express"
import {start as startTask} from "./task"

const app = express()

app.get("/", (_, res) => {
    res.send("Hello")
})

app.listen(3000)
startTask()