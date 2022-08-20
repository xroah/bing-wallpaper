import datetime
import os.path
import sched
import time
from threading import Thread

from PySide6.QtCore import Signal, QObject
from .DB import DB
from .download import (
    download_img,
    get,
    host
)
from .utils import set_wallpaper
from .Settings import settings


class Manager(QObject):
    change_sig = Signal()

    def __init__(self):
        super().__init__()

        days = []
        today = datetime.date.today()
        self.sched = sched.scheduler(time.time, time.sleep)
        self.event = None
        self.days = days
        self.index = 6
        self.wallpapers = {}
        self.model = {}
        self.check_t: Thread | None = None

        for i in range(6, -1, -1):
            day = today + datetime.timedelta(days=-i)
            days.append(str(day))

        self.init_data()
        self.set_wallpaper()
        self.start_check()

        settings.change_sig.connect(self.settings_change)

    def settings_change(self):
        if not settings.refresh:
            if self.event:
                self.sched.cancel(self.event)
                self.check_t = None
                self.event = None
        else:
            if not self.check_t:
                self.start_check()

    def start_check(self):
        if not settings.refresh:
            return

        t = Thread(target=self.sched.run)
        t.daemon = True
        self.check_t = t

        self.check()
        t.start()

    def update(self):
        today = str(datetime.date.today())

        print("check result", today in self.days)

        if today not in self.days:
            first = self.days[0]
            self.days = self.days[1:]
            self.days.append(today)
            self.index = 6

            if first in self.wallpapers:
                del self.wallpapers[first]

            self.get_model()
            self.set_wallpaper()
            self.change_sig.emit()

        self.check()

    def check(self):
        # check every 10 minutes
        self.event = self.sched.enter(10, 1, self.update)

    def init_data(self):
        with DB() as db:
            wallpapers = db.query()

            for w in wallpapers:
                self.wallpapers[w["date"]] = {
                    "copyright": w["copyright"],
                    "path": w["path"],
                    "title": w["title"],
                    "date": w["date"]
                }

    def get_model(self):
        res = get(f"{host}/hp/api/model?FORM=BEHPTB")

        if res is not None:
            self.model.clear()
            data = res.json()
            contents = data["MediaContents"]
            days = list(reversed(self.days))

            for i, c in enumerate(contents):
                img_cnt = c["ImageContent"]
                self.model[days[i]] = {
                        "copyright": img_cnt["Copyright"],
                        "title": img_cnt["Title"],
                        "headline": img_cnt["Headline"],
                        "url": img_cnt["Image"]["Url"],
                        "desc": img_cnt["Description"]
                    }

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
        if date not in self.model:
            self.model.clear()
            self.get_model()

        if not len(self.model.keys()):
            return

        d = self.model[date]
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

        d = self.model[date]

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
            "copyright": d["copyright"],
            "date": date
        }

        return img_path
