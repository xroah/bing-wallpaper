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

function fetchImgInfo(callback) {
    const now = Date.now();
    const p = "/HPImageArchive.aspx";
    const params = [
        "format=js",
        "idx=0",
        "n=1",
        "nc=" + now,
        "pid=hp"
    ];
    const req = https.request(
        {
            hostname: "cn.bing.com",
            path: `${p}?${params.join("&")}`
        },
        res => {
            let ret = "";

            res.on("data", chunk => ret += chunk);
            res.on("end", () => {
                if (typeof callback === "function") {
                    callback(ret, handleImageInfo(JSON.parse(ret)));
                }
            });
        }
    );

    req.on("error", err => console.log(err));
    req.end();
}

function setWallpaper(img) {
    if (process.platform === "win32") {
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
                    {
                        stdio: "inherit",
                        shell: true
                    },
                    err => {
                        if (err) throw err;

                        console.log("Success.");
                    }
                );
            })
            .catch(err => console.log(err));
    }
}

function gitCommit(msg) {
    childProc.execFile("git", ["add", "images"], err => {
        if (err) throw err;

        childProc.execFile("git", ["commit", "-m", msg], err => {
            if (err) throw err;

            childProc.execFile("git", ["push"], err => {
                if (err) throw err;
            });
        });
    });
}

function writeImage(res, url, date) {
    const id = qs.parse(url.split("?")[1]).id;
    const mon = path.dirname(date);
    let dest;
    if (process.platform === "win32") {
        dest = path.join("C:/BingWallpaper", mon);
    } else {
        dest = path.join("~/BingWallpaper", mon);
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

function writeImageInfo(info, date) {
    const mon = path.dirname(date);
    const name = date.replace(new RegExp(DATE_SEP, "g"), "-");
    const infoDest = path.join("images", mon);

    if (!fs.existsSync(infoDest)) {
        fs.mkdirSync(infoDest, { recursive: true });
    }

    //write the info
    fs.writeFileSync(
        path.join(
            infoDest,
            name + ".json"
        ),
        JSON.stringify(info, null, 4)
    );
    
    gitCommit(date);
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
            writeImageInfo(handled, handled.date);
        }
    );

    req.end();
}

fetchImgInfo((raw, handled) => {
    downloadImage(raw, handled);
});