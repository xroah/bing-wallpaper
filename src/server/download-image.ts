import https from "https"
import {load} from "cheerio"
import path from "path"
import fs from "fs"

export const HOST = "https://cn.bing.com"

function padZero(n: number) {
    return String(100 + n).substring(1)
}

export function getDateString() {
    const date = new Date()
    const year = date.getFullYear()
    const mon = padZero(date.getMonth() + 1)
    const day = padZero(date.getDate())

    return `${year}-${mon}-${day}`
}

export function request(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        https.get(
            url,
            {
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36 Edg/99.0.1150.46"
                }
            },
            res => {
                let data = Buffer.from([])

                res
                    .on("data", d => {
                        data = Buffer.concat([data, d])
                    })
                    .once("end", () => {
                        resolve(data)
                    })
                    .once("error", err => {
                        reject(err)
                    })
            })
    })
}

export function parse(html: string) {
    const $ = load(html)
    const card = $(".musCard")
    const downloadLink = card.find(".downloadLink").attr("href")
    const title = card.find(".title").text()
    const copyright = card.find(".copyright").text()
    const headline = card.find(".headline .text").text()

    return {
        downloadLink: `${HOST}${downloadLink}`,
        title,
        copyright,
        headline,
        date: getDateString()
    }
}

export async function downloadImage(url: string) {
    const urlObj = new URL(url)
    const baseDir = `${process.env["HOME"] || "/"}BingPic`
    const date = new Date()
    const dateDir = `/${date.getFullYear()}/${padZero(date.getMonth() + 1)}`
    const downloadDir = path.join(baseDir, dateDir)
    const filename = urlObj.searchParams.get("id")

    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, {recursive: true})
    }

    try {
        let data = await request(url)

        fs.writeFileSync(`${downloadDir}/${filename}`, data)
    } catch (error) {
        return false
    }

    return filename
}