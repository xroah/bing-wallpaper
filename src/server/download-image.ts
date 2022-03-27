import https from "https"
import {load} from "cheerio"
import fs from "fs"
import path from "path"

export const HOST = "https://cn.bing.com"
export const BASE_DIR = process.env["HOME"] || "/"
export const IMAGE_DIR = "/BingPic"

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

function getDir() {
    const date = new Date()
    const dateDir = `/${date.getFullYear()}/${padZero(date.getMonth() + 1)}`
    const relDir = `${IMAGE_DIR}${dateDir}`
    const imgDir = path.join(BASE_DIR, relDir)

    return {
        imgDir,
        relDir
    }
}

export function parse(html: string) {
    const reg = /\d+x\d+/g
    const THUMBNAIL_RESOLUTION = "400x240"
    const IMG_RESOLUTION = "1920x1200"
    const $ = load(html)
    const card = $(".musCard")
    const downloadLink = card.
        find(".downloadLink").
        attr("href")!.
        replace(reg, IMG_RESOLUTION)
    const title = card.find(".title").text()
    const copyright = card.find(".copyright").text()
    const headline = card.find(".headline .text").text()
    const imageLink = `${HOST}${downloadLink}`
    const urlObj = new URL(imageLink)
    const imageName = urlObj.searchParams.get("id")!
    const thumbnailName = imageName.replace(reg, THUMBNAIL_RESOLUTION)
    const {imgDir, relDir} = getDir()
    const dateString = getDateString()

    return {
        imageLink,
        imageName,
        thumbnailName,
        thumbnailLink: imageLink.replace(reg, THUMBNAIL_RESOLUTION),
        imagePath: `${relDir}/${imageName}`,
        thumbnailPath: `${relDir}/${thumbnailName}`,
        imageDownloadPath: `${imgDir}/${imageName}`,
        thumbnailDownloadPath: `${imgDir}/${thumbnailName}`,
        title: `${title} (${copyright})`,
        headline,
        date: dateString,
        timestamp: new Date(`${dateString} 00:00:00`).getTime()
    }
}

export async function downloadImage(url: string, filePath: string) {
    const {dir} = path.parse(filePath)

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true})
    }
    try {
        let data = await request(url)

        fs.writeFileSync(filePath, data)
    } catch (error) {
        return false
    }

    return true
}