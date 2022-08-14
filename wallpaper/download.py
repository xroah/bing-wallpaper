import json
import sys
import os
import re
import time

import subprocess
from typing import Tuple

import requests

from .DB import DB

_max_retries = 10
_host = "https://cn.bing.com"


def get(url: str, i=0):
    def req():
        return requests.get(
            url,
            headers={
                "referer": f"{_host}/?FORM=BEHPTB",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36 Edg/103.0.1264.77"
            }
        )

    try:
        res = req()
    except Exception as e:
        i += 1

        if i < _max_retries:
            return req()

        print(f"Request {url} error: ", e)

        return None

    return res


def download_img(img_url: str, retry=True):
    uhd = re.sub(r"\d+x\d+", "UHD", img_url)
    res = get(uhd + "&w=3840&h=2160")

    if not res:
        return None

    if res.status_code == 404:
        if retry:
            return download_img(img_url, False)

        return None

    return res


def get_today_img() -> Tuple[str, str]:
    home = os.path.expanduser("~")
    year = time.strftime("%Y")
    mon = time.strftime("%m")
    img_dir = os.path.join(home, "Pictures", year, mon)
    name = time.strftime("%Y%m%d")
    img_path = os.path.join(img_dir, name + ".jpg")

    return img_dir, img_path


def download() -> None | str:
    img_dir, img_path = get_today_img()

    if os.path.exists(img_path):
        return img_path

    res = get(f"{_host}/hp/api/model?FORM=BEHPTB")

    if not res:
        return None

    ret = json.loads(res.text)
    img_cnt = ret["MediaContents"][0]["ImageContent"]
    img = img_cnt["Image"]
    copy_right = img_cnt["Copyright"]
    desc = img_cnt["Description"]
    headline = img_cnt["Headline"]
    title = img_cnt["Title"]
    img_url = img["Url"]
    res = download_img(img_url)

    if not res:
        return None

    if not os.path.exists(img_dir):
        os.makedirs(img_dir)

    with open(img_path, "wb") as f:
        f.write(res.content)

    with DB() as db:
        db.insert(
            title=title,
            url=res.url,
            headline=headline,
            desc=desc,
            copy_right=copy_right,
            path=img_path
        )

    return img_path


def set_wallpaper(img_path: str):
    cmd = ""

    if sys.platform == "darwin":
        cmd = [
            "osascript",
            "-e",
            f'tell application "Finder" to set desktop picture to POSIX file "{img_path}"'
        ]
    elif sys.platform == "linux":
        cmd = [
            "gsettings",
            "set",
            "org.gnome.desktop.background",
            "picture-uri",
            f"file:///{img_path}"
        ]

    if cmd:
        subprocess.run(cmd)
