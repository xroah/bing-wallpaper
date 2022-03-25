import schedule from "node-schedule"
import {
    Document,
    MongoClient,
    OptionalId
} from "mongodb"
import {
    downloadImage,
    HOST,
    parse,
    request
} from "./download-image"

let MAX_RETRIES = 10

schedule.scheduleJob("00 00 06 * * *", () => {
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
})

async function download() {
    try {
        const html = await request(HOST)
        const info = parse(html.toString())

        await downloadImage(info.imageLink, info.imagePath)
        await downloadImage(info.thumbnailLink, info.thumbnailPath)
        console.log(info)

        return info
    } catch (error) {
        return false
    }
}

async function save(data: OptionalId<Document>) {
    const client = new MongoClient("mongodb://localhost:27017")
    let conn: MongoClient | undefined

    try {
        conn = await client.connect()

        await conn
            .db("bing-pic")
            .collection("images")
            .insertOne(data)

        await conn.close()
    } catch (error) {
        if (conn) {
            await conn.close()
        }
    }
}