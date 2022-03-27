import express,
{
    Response,
    NextFunction
} from "express"
import fs from "fs"
import path from "path"
import {BASE_DIR} from "../download-image"

const router = express.Router()

router.get("/", (_, res) => {
    res.send("Download")
})

function downloadImage(
    img: string,
    res: Response,
    next: NextFunction
) {
    if (!img) {
        res.json({
            code: 1,
            msg: "参数错误"
        })

        return
    }

    const imgPath = path.join(BASE_DIR, img as string)

    if (
        !fs.existsSync(imgPath) ||
        fs.statSync(imgPath).isDirectory()
    ) {
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
}

router.get("/image", (req, res, next) => {
    downloadImage(
        req.query["img"] as string,
        res,
        next
    )
})

export default router