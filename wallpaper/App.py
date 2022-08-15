import os.path
import sys
import time
from threading import Thread

from PySide6.QtGui import QIcon, QCursor
from PySide6.QtWidgets import (
    QApplication,
    QSystemTrayIcon,
    QMenu
)

from .DB import DB
from .Window import Window
from .download import download, set_wallpaper


class App(QApplication):
    def __init__(self):
        super().__init__()

        self.tray = QSystemTrayIcon(QIcon(":/logo.png"), self)
        today = time.strftime("%Y-%m-%d")

        if sys.platform == "darwin":
            self.win = Window()
            self.tray.activated.connect(self.tray_activated)
        elif sys.platform == "linux":
            self.tray.setContextMenu(self.get_ctx_menu())

        with DB() as db:
            wps = db.query()
            if (
                    not len(wps) or
                    wps[0]["date"] != today
            ):
                t = Thread(target=self.download_img)
                t.daemon = True
                t.start()
            else:
                set_wallpaper(wps[0]["path"])

        self.tray.show()

    def tray_activated(self, reason):
        if not self.win:
            return

        size = self.win.size()
        screen = QApplication.primaryScreen()
        screen_size = screen.size()
        pos = QCursor.pos()
        x = pos.x()
        y = pos.y()

        if size.width() + x >= screen_size.width():
            x -= size.width()

        if size.height() + y >= screen_size.height():
            y -= size.height()

        self.win.showNormal()
        self.win.move(x, y)
        self.activeWindow()
        self.win.raise_()

    @staticmethod
    def download_img():
        img = download()

        if img is not None:
            set_wallpaper(img["path"])

    @staticmethod
    def get_ctx_menu():
        menu = QMenu()
        quit_action = menu.addAction("退出")

        quit_action.triggered.connect(lambda: sys.exit(0))

        return menu
