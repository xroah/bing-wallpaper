import datetime
import os.path

from .DB import DB
from .download import (
    download_img,
    get,
    host
)
from .utils import set_wallpaper


class Manager:
    def __init__(self):
        days = []
        today = datetime.date.today()
        self.days = days
        self.index = 6
        self.wallpapers = {}
        self.model = []

        for i in range(6, -1, -1):
            day = today + datetime.timedelta(days=-i)
            days.append(str(day))

        self.init_data()
        self.set_wallpaper()

    def init_data(self):
        with DB() as db:
            wallpapers = db.query()

            for w in wallpapers:
                self.wallpapers[w["date"]] = {
                    "copyright": w["copyright"],
                    "path": w["path"],
                    "title": w["title"]
                }

    def get_model(self):
        res = get(f"{host}/hp/api/model?FORM=BEHPTB")

        if res is not None:
            self.model = []
            data = res.json()
            contents = data["MediaContents"]

            for c in contents:
                img_cnt = c["ImageContent"]
                self.model.insert(
                    0,
                    {
                        "copyright": img_cnt["Copyright"],
                        "title": img_cnt["Title"],
                        "headline": img_cnt["Headline"],
                        "url": img_cnt["Image"]["Url"],
                        "desc": img_cnt["Description"]
                    }
                )

    def get_current_info(self):
        date = self.days[self.index]

        if date in self.wallpapers:
            return self.wallpapers[date]

        return None

    def prev(self):
        if self.index > 0:
            self.index -= 1
            self.set_wallpaper()

    def next(self):
        if self.index < 6:
            self.index += 1
            self.set_wallpaper()

    def set_wallpaper(self):
        date = self.days[self.index]

        if date not in self.wallpapers:
            img_path = self.download_img(date)
        else:
            img_path = self.wallpapers[date]["path"]

        if img_path:
            set_wallpaper(img_path)

    def download(self, date):
        if not len(self.model):
            self.get_model()

        if not len(self.model):
            return

        d = self.model[self.index]
        img_path = download_img(d["url"], date)

        if not img_path:
            return None

        return img_path

    def download_img(self, date: str) -> str | None:
        if date in self.wallpapers:
            if not os.path.exists(self.wallpapers["date"]["path"]):
                return self.download(date)

        img_path = self.download(date)

        if not img_path:
            return None

        d = self.model[self.index]

        with DB() as db:
            db.insert(
                title=d["title"],
                copy_right=d["copyright"],
                headline=d["headline"],
                desc=d["desc"],
                path=img_path,
                url="",
                date=date
            )

        self.wallpapers[date] = {
            "title": d["title"],
            "path": img_path,
            "copyright": d["copyright"]
        }

        return img_path

