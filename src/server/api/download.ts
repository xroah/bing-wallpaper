import express from "express"
import fs from "fs"
import path from "path"
import {BASE_DIR} from "../download-image"

const router = express.Router()

router.get("/", (_, res) => {
    res.send("Download")
})

router.get("/image", (req, res, next) => {
    const {query} = req
    const img = query["img"]

    if (!img) {
        res.json({
            code: 1,
            msg: "参数错误"
        })

        return
    }

    const imgPath = path.join(BASE_DIR, img as string)

    if (!fs.existsSync(imgPath)) {
        res.json({
            code: 404,
            msg: "文件不存在"
        })

        return
    }

    const {base: filename} = path.parse(imgPath)

    res.download(
        imgPath,
        filename,
        err => {
            if (err) {
                return next(err)
            }

            res.end()
        }
    )
})

export default router