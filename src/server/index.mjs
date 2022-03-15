import fs from "fs"
import path from "path"
import https from "https"
import qs from "querystring"
import childProc from "child_process"

const DATE_SEP = "/"
const MAX_RETRIES = 5

function getCurrentDay() {
    const convert = n => n < 10 ? `0${n}` : n.toString()
    const date = new Date()
    const year = date.getFullYear()
    const mon = convert(date.getMonth() + 1)
    const day = convert(date.getDate())

    return `${year}${DATE_SEP}${mon}${DATE_SEP}${day}`
}

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

    return {
        date: getCurrentDay(),
        copyright: image.copyright,
        copyrightUrl: `${hostname}${image.copyrightlink}`,
        url: `${hostname}${image.url}`,
        quiz: `${hostname}${image.quiz}`,
        hash: image.hsh
    }
}

function fetchImage() {
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
        https
            .request(
                {
                    hostname: "cn.bing.com",
                    path: `${p}?${params}`
                },
                handleResponse
            )
            .on(
                "error",
                err => {
                    if ((count++) < MAX_RETRIES) {
                        return setTimeout(request, 300)
                    }

                    throw err
                }
            )
            .end()
    }

    request()
}

function handleResponse(res) {
    let ret = Buffer.from("")

    res
        .on(
            "data",
            chunk => ret = Buffer.concat([ret, chunk])
        )
        .on(
            "end",
            () => {
                ret = JSON.parse(ret.toString())

                downloadImage(
                    handleImageInfo(ret)
                )
            }
        )
}

function downloadImage(imageInfo) {
    https
        .request(
            {
                hostname: "cn.bing.com",
                path: imageInfo.url
            },
            res => writeImage(res, imageInfo)
        )
        .end()
}

function writeImage(res, imageInfo) {
    const url = imageInfo.url.split("?")[1]
    const id = qs.parse(url).id//xxxx.jpg
    const mon = path.dirname(imageInfo.date)
    let dest = path.join(
        process.platform === "win32" ?
            "C:" : process.env.HOME,
        `/BingWallpaper/${mon}`
    )
    const date = imageInfo.date.replace(/\//g, "-")

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(
            dest,
            {
                recursive: true
            }
        )
    }

    const imgPath = path.join(dest, id)
    const img = fs.createWriteStream(imgPath)

    res.pipe(img)
    res.on(
        "end",
        () => img.close()
    )

    //write image info
    fs.writeFileSync(
        `${dest}/${date}.json`,
        JSON.stringify(imageInfo, null, 4)
    )
}

fetchImage()