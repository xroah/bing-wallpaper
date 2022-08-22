import json
import sys
import os
import re

from typing import Dict

import requests

from .DB import DB
from .utils import get_today_img

_max_retries = 10
host = "https://cn.bing.com"


def get(url: str, i=0):
    def req():
        return requests.get(
            url,
            headers={
                "referer": host,
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36 Edg/103.0.1264.77"
            },
            timeout=60
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


def download_img(
        img_url: str,
        date: str = None,
        retry=True
) -> str | None:
    if not img_url.startswith("https://"):
        img_url = host + img_url

    # uhd = re.sub(r"\d+x\d+", "UHD", img_url)
    # res = get(uhd + "&w=3840&h=2160")
    res = get(img_url)
    img_dir, img_path = get_today_img()

    if date:
        img_path = os.path.join(img_dir, f"{date}.jpg")

    if not res:
        return None

    # if res.status_code == 404:
    #     if retry:
    #         return download_img(img_url, date, False)
    #
    #     return None

    if not os.path.exists(img_dir):
        os.makedirs(img_dir)

    with open(img_path, "wb") as f:
        f.write(res.content)

    return img_path
