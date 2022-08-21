import sys

from PySide6.QtGui import QIcon
from PySide6.QtWidgets import QApplication, QSystemTrayIcon

from .Window import Window
from .ContextMenu import ContextMenu


class App(QApplication):
    def __init__(self):
        super().__init__()

        self.tray = QSystemTrayIcon(QIcon(":/logo.png"), self)

        if sys.platform == "darwin":
            self.win = Window()
            self.tray.activated.connect(self.tray_activated)
        elif sys.platform == "linux":
            self.tray.setContextMenu(ContextMenu())

        self.tray.setToolTip("必应壁纸")
        self.tray.show()

    def tray_activated(self, reason):
        if not self.win:
            return
        size = self.win.size()
        tray_geo = self.tray.geometry()
        screen = QApplication.primaryScreen()
        screen_size = screen.size()
        x = tray_geo.x() + tray_geo.width() / 2
        y = tray_geo.height() + 2

        if size.width() + x >= screen_size.width():
            x -= size.width()

        self.win.showNormal()
        self.win.move(x, y)
        self.activeWindow()
        self.win.raise_()
