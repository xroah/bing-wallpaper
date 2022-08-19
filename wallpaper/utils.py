import os
import subprocess
import sys
import time
from typing import Tuple


def get_today_img() -> Tuple[str, str]:
    home = os.path.expanduser("~")
    year = time.strftime("%Y")
    mon = time.strftime("%m")
    img_dir = os.path.join(home, "Pictures", year, mon)
    name = time.strftime("%Y-%m-%d")
    img_path = os.path.join(img_dir, name + ".jpg")

    return img_dir, img_path


def set_wallpaper(img_path: str):
    cmd = []
    plat = sys.platform

    if plat == "darwin":
        cmd = [
            "osascript",
            "-e",
            f'tell application "Finder" to set desktop picture to POSIX file "{img_path}"'
        ]
    elif plat == "linux":
        cmd = [
            "gsettings",
            "set",
            "org.gnome.desktop.background",
            "picture-uri",
            f"file:///{img_path}"
        ]

    if len(cmd):
        subprocess.run(cmd)
