import schedule from "node-schedule"
import {Document, OptionalId} from "mongodb"
import {
    downloadImage,
    HOST,
    parse,
    request
} from "./download-image"
import {connect} from "./db"

let MAX_RETRIES = 10

async function download() {
    try {
        const html = await request(HOST)
        const {
            imageLink,
            thumbnailLink,
            imageDownloadPath,
            thumbnailDownloadPath,
            ...info
        } = parse(html.toString())

        await downloadImage(imageLink, imageDownloadPath)
        await downloadImage(thumbnailLink, thumbnailDownloadPath)

        return info
    } catch (error) {
        console.log(error)

        return false
    }
}

async function save(data: OptionalId<Document>) {
    connect(
        (_, c, close) => {
            c
                .insertOne(data)
                .then(close)
                .catch(close)
        }
    )
}

function execTask() {
    let count = 0
    let saveCount = 0
    let s = async (v: OptionalId<Document>) => {
        try {
            await save(v)
        } catch (error) {
            saveCount++

            if (saveCount <= MAX_RETRIES) {
                await s(v)
            }
        }
    }
    let d = async () => {
        let info: any

        try {
            info = await download()
        } catch (error) {
            count++

            if (count <= MAX_RETRIES) {
                d()
            }

            return
        }

        if (info) {
            await s(info)
        }
    }

    d()
}

export function start() {
    schedule.scheduleJob("00 00 06 * * *", execTask)
}
