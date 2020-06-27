"use strict"

const fs = require("fs");
const path = require("path");
const https = require("https");
const Jimp = require("jimp");
const qs = require("querystring");
const childProc = require("child_process");

const DATE_SEP = "/";

function handleImageInfo(info) {
    const image = info.images[0];
    const hostname = "https://cn.bing.com";
    const date = new Date();
    const year = date.getFullYear();
    const mon = date.getMonth() + 1;
    const day = date.getDate();
    const convert = num => (100 + num).toString().substring(1);
    const dateStr = `${year}${DATE_SEP}${convert(mon)}${DATE_SEP}${convert(day)}`;

    return {
        date: dateStr,
        copyright: image.copyright,
        copyrightUrl: `${hostname}${image.copyrightlink}`,
        url: `${hostname}${image.url}`,
        quiz: `${hostname}${image.quiz}`,
        hash: image.hsh
    };
}

const MAX_RETRIES = 5;

function fetchImgInfo(callback) {
    let count = 0;
    const now = Date.now();
    const p = "/HPImageArchive.aspx";
    const params = [
        "format=js",
        "idx=0",
        "n=1",
        "nc=" + now,
        "pid=hp"
    ];
    const request = () => {
        const req = https.request(
            {
                hostname: "cn.bing.com",
                path: `${p}?${params.join("&")}`
            },
            res => {
                let ret = "";

                res.on("data", chunk => ret += chunk);
                res.on("end", () => {
                    callback(ret, handleImageInfo(JSON.parse(ret)));
                });
            }
        );

        req.on("error", err => {
            if ((count++) < MAX_RETRIES) {
                setTimeout(request, 500);

                return;
            }

            throw err;
        });
        req.end();
    };

    if (typeof callback !== "function") {
        callback = a => a;
    }

    request();
}

function setWallpaper(img) {
    const platform = process.platform;

    if (platform === "win32") {
        //windows api only accepts .bmp img
        const imgObj = path.parse(img);
        const bmp = path.join(imgObj.dir, `${imgObj.name}.bmp`);

        Jimp
            .read(img)
            .then(data => {
                //convert to  bmp img
                return data.write(bmp);
            })
            .then(() => {
                //remove the original image
                fs.unlinkSync(img);
                childProc.execFile(
                    path.normalize(`${__dirname}/widnows/Wallpaper/bin/Wallpaper.exe`),
                    [path.normalize(bmp)],
                    err => {
                        if (err) throw err;
                    }
                );
            })
            .catch(err => console.log(err));
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
    const id = qs.parse(url.split("?")[1]).id;
    const mon = path.dirname(date);
    let dest;
    if (process.platform === "win32") {
        dest = path.join("C:/BingWallpaper", mon);
    } else {
        dest = path.join(process.env.HOME, "/BingWallpaper", mon);
    }

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const imgPath = path.join(dest, id);
    const img = fs.createWriteStream(imgPath);

    res.on("end", () => {
        img.close();
        setWallpaper(imgPath);
    });
    res.pipe(img);
}

function downloadImage(info, handled) {
    const url = JSON.parse(info).images[0].url;
    const req = https.request(
        {
            hostname: "cn.bing.com",
            path: url
        },
        res => {
            writeImage(res, url, handled.date);
        }
    );

    req.end();
}

fetchImgInfo((raw, handled) => {
    downloadImage(raw, handled);
});