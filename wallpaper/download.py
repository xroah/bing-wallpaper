import sys
import os
import re
import time
from typing import Tuple

import subprocess
import requests
from bs4 import BeautifulSoup

_max_retries = 10
_host = "https://cn.bing.com"


def get(url: str, i=0):
    def req():
        return requests.get(
            url,
            headers={
                "referer": f"{_host}",
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


def get_img_info() -> Tuple[str, str]:
    res = get(_host)
    img_url = ""
    title = ""

    if res:
        soup = BeautifulSoup(res.text, "html.parser")
        preload = soup.select("#preloadBg")
        title_el = soup.select(".musCardCont .title")

        if len(preload):
            img_url = preload[0]["href"]

        if len(title_el):
            title = title_el[0].string

    return img_url, title


def download(img_url, title) -> None | str:
    if not img_url:
        return None

    uhd = re.sub(r"1920x1080", "UHD", img_url)
    res = get(uhd)

    if not res:
        return None

    if res.status_code == 404:
        res = requests.get(img_url)

        if not res:
            return None

    home = os.path.expanduser("~")
    year = time.strftime("%Y")
    mon = time.strftime("%m")
    img_dir = os.path.join(home, "Pictures", year, mon)
    name = "".join([time.strftime("%Y-%m-%d"), title])
    fullname = os.path.join(img_dir, name + ".jpg")

    if not os.path.exists(img_dir):
        os.makedirs(img_dir)

    with open(fullname, "wb") as f:
        f.write(res.content)

    return fullname


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