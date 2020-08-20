import fs from "fs"
import path from "path"
import https from "https"
import Jimp from "jimp"
import qs from "querystring"
import childProc from "child_process"

const DATE_SEP = "/"
/* 
* //image info structure:
{
    "images": [
        {
            "startdate": "20200908",
            "fullstartdate": "202009080700",
            "enddate": "20200909",
            "url": "/th?id=OHR.OttoSettembre_EN-CN4132777021_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp",
            "urlbase": "/th?id=OHR.OttoSettembre_EN-CN4132777021",
            "copyright": "Valletta, Malta (© Deejpilot/GettyImages)",
            "copyrightlink": "/search?q=valletta+malta&form=hpcapt&filters=HpDate%3a%2220200908_0700%22",
            "title": "Victory Day in Valletta",
            "caption": "Victory Day in Valletta",
            "copyrightonly": "© Deejpilot/GettyImages",
            "desc": "Today we're visiting Valletta, the capital of Malta, where the Maltese people are celebrating Victory Day. The national holiday commemorates the end of three historical sieges made on the Maltese archipelago—the Great Siege of Malta, which took place in 1565; the Siege of Valletta by the French Blockade, which ended in 1800; and the Siege of Malta during the Second World War by Italian and German forces. After nearly two and a half years of devastating air attacks, the WWII Siege of Malta finally ended in 1942. King George VI of the United Kingdom, which then ruled the island, awarded Malta the George Cross 'for the heroism and devotion of its people' during the great siege. The George Cross was incorporated into the flag of Malta in 1943 and remains there today.",
            "date": "Sep 8, 2020",
            "bsTitle": "Victory Day in Valletta",
            "quiz": "/search?q=Bing+homepage+quiz&filters=WQOskey:%22HPQuiz_20200908_OttoSettembre%22&FORM=HPQUIZ",
            "wp": true,
            "hsh": "b4e6204318b7ca6b52cbff077feeb7b2",
            "drk": 1,
            "top": 1,
            "bot": 1,
            "hs": [],
            "og": {
                "img": "https://www.bing.com/th?id=OHR.OttoSettembre_EN-CN4132777021_tmb.jpg",
                "title": "Victory Day in Valletta",
                "desc": "Today we're visiting Valletta, the capital of Malta, where the Maltese people are celebrating Victory Day. The national holiday commemorates…",
                "hash": "BlOeboNQBF+CIBNx9Q64j15nU9FKR+YKBL7km/dzgtg="
            }
        }
    ],
    "tooltips": {
        "loading": "Loading...",
        "previous": "Previous image",
        "next": "Next image",
        "walle": "This image is not available to download as wallpaper.",
        "walls": "Download this image. Use of this image is restricted to wallpaper only."
    },
    "quiz": {
        "question": "We're in the city of Valletta. It's the capital of which country?",
        "id": "HPQuiz_20200908_OttoSettembre",
        "url": "/search?q=Bing+homepage+quiz&filters=WQOskey%3A%22HPQuiz_20200908_OttoSettembre%22&FORM=HPQUIZ",
        "options": [
            {
                "text": "Maldives",
                "url": "/search?q=valletta+malta&filters=IsConversation%3A%22True%22+btrequestsource%3A%22homepage%22+WQOskey%3A%22HPQuiz_20200908_OttoSettembre%22+WQId%3A%221%22+WQQI%3A%220%22+WQCI%3A%220%22+UserChoices%3A%220%22+ShowTimesTaskPaneTrigger%3A%22false%22+WQSCORE%3A%220%22&FORM=HPQUIZ"
            },
            {
                "text": "Fiji",
                "url": "/search?q=valletta+malta&filters=IsConversation%3A%22True%22+btrequestsource%3A%22homepage%22+WQOskey%3A%22HPQuiz_20200908_OttoSettembre%22+WQId%3A%221%22+WQQI%3A%220%22+WQCI%3A%221%22+UserChoices%3A%221%22+ShowTimesTaskPaneTrigger%3A%22false%22+WQSCORE%3A%220%22&FORM=HPQUIZ"
            },
            {
                "text": "Malta",
                "url": "/search?q=valletta+malta&filters=IsConversation%3A%22True%22+btrequestsource%3A%22homepage%22+WQOskey%3A%22HPQuiz_20200908_OttoSettembre%22+WQId%3A%221%22+WQQI%3A%220%22+WQCI%3A%222%22+UserChoices%3A%222%22+ShowTimesTaskPaneTrigger%3A%22false%22+WQSCORE%3A%221%22&FORM=HPQUIZ"
            }
        ]
    }
}
*/
function handleImageInfo(info) {
    const image = info.images[0]
    const hostname = "https://cn.bing.com"
    const date = new Date()
    const year = date.getFullYear()
    const mon = date.getMonth() + 1
    const day = date.getDate()
    const convert = num => (100 + num).toString().substring(1)
    const dateStr = `${year}${DATE_SEP}${convert(mon)}${DATE_SEP}${convert(day)}`

    return {
        date: dateStr,
        copyright: image.copyright,
        copyrightUrl: `${hostname}${image.copyrightlink}`,
        url: `${hostname}${image.url}`,
        quiz: `${hostname}${image.quiz}`,
        hash: image.hsh
    }
}

const MAX_RETRIES = 5

function fetchImgInfo(callback) {
    let count = 0
    const p = "/HPImageArchive.aspx"
    const params = [
        "format=js",
        "idx=0",
        "n=1",
        "nc=" + Date.now(),
        "pid=hp"
    ].join("&")
    const request = () => {
        const req = https.request(
            {
                hostname: "cn.bing.com",
                path: `${p}?${params}`
            },
            res => {
                let ret = Buffer.from("")

                res.on("data", chunk => ret = Buffer.concat([ret, chunk]))
                res.on("end", () => {
                    callback(ret, handleImageInfo(JSON.parse(ret.toString())))
                })
            }
        )

        req.on("error", err => {
            if ((count++) < MAX_RETRIES) {
                return setTimeout(request, 300)
            }

            throw err
        })

        req.end()
    }

    if (typeof callback !== "function") {
        callback = a => a
    }

    request()
}

function setWallpaper(img) {
    const platform = process.platform

    if (platform === "win32") {
        //windows api only accepts .bmp img
        const imgObj = path.parse(img)
        const bmp = path.join(imgObj.dir, `${imgObj.name}.bmp`)

        Jimp
            .read(img)
            .then(data => {
                //convert to  bmp img
                return data.write(bmp)
            })
            .then(() => {
                //remove the original image
                fs.unlinkSync(img)
                childProc.execFile(
                    path.normalize(`${__dirname}/widnows/Wallpaper/bin/Wallpaper.exe`),
                    [path.normalize(bmp)],
                    err => {
                        if (err) throw err
                    }
                )
            })
    } else if (platform === "linux") {
        //gnome desktop
        childProc.execFile(
            "gsettings",
            [
                "set",
                "org.gnome.desktop.background",
                "picture-uri",
                `file:${img}`
            ],
            err => {
                if (err) throw err
            }
        )
    }
}

function writeImage(res, url, date) {
    const id = qs.parse(url.split("?")[1]).id
    const mon = path.dirname(date)
    let dest
    
    if (process.platform === "win32") {
        dest = path.join("C:/BingWallpaper", mon)
    } else {
        dest = path.join(process.env.HOME, "/BingWallpaper", mon)
    }

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true })
    }

    const imgPath = path.join(dest, id)
    const img = fs.createWriteStream(imgPath)
    
    res.pipe(img)
    res.on("end", () => {
        img.close()
        setWallpaper(imgPath)
    })
}

function downloadImage(info, handled) {
    const url = JSON.parse(info).images[0].url
    const req = https.request(
        {
            hostname: "cn.bing.com",
            path: url
        },
        res => {
            writeImage(res, url, handled.date)
        }
    )

    req.end()
}

fetchImgInfo((raw, handled) => {
    downloadImage(raw, handled)
})
