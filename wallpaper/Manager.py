import datetime
import time
from threading import Thread

from .DB import DB
from .download import download


class Manager:
    def __init__(self):
        days = []
        today = datetime.date.today()
        self.days = days
        self.index = 6
        self.wallpapers = {}

        for i in range(6, -1, -1):
            day = today + datetime.timedelta(days=-i)
            days.append(str(day))

        with DB() as db:
            today = time.strftime("%Y-%m-%d")
            wallpapers = db.query()

            for w in wallpapers:
                self.wallpapers[w["date"]] = {
                    "copyright": w["copyright"],
                    "path": w["path"],
                    "title": w["title"]
                }

            if (
                    not len(wallpapers) or
                    wallpapers[0]["date"] != today
            ):
                t = Thread(target=self.download_img)
                t.daemon = True
                t.start()
            else:
                pass

    @staticmethod
    def download_img():
        img = download()
