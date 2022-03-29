import schedule from "node-schedule"
import {Document, OptionalId} from "mongodb"
import {
    downloadImage,
    HOST,
    parse,
    request
} from "./download-image"
import {coll} from "./db"

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
    try {
        await coll.insertOne(data)

        return false
    } catch (error) {
        return true
    }
}

function execTask() {
    let count = 0
    let saveCount = 0
    let s = async (v: OptionalId<Document>) => {
        const ret = await save(v)

        if (!ret) {
            saveCount++

            if (saveCount <= MAX_RETRIES) {
                await s(v)
            }
        }
    }
    let d = async () => {
        let info = await download()

        if (info) {
            await s(info)
        } else {
            count++

            if (count <= MAX_RETRIES) {
                d()
            }
        }
    }

    d()
}

export function start() {
    schedule.scheduleJob("00 00 06 * * *", execTask)
}
