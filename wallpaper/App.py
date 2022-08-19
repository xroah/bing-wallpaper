import sys

from PySide6.QtGui import QIcon, QCursor, QAction
from PySide6.QtWidgets import (
    QApplication,
    QSystemTrayIcon,
    QMenu
)

from .Window import Window
from .actions import get_quit_action, get_refresh_action


class App(QApplication):
    def __init__(self):
        super().__init__()

        self.refresh_action: QAction | None = None
        self.prev_action: QAction | None = None
        self.next_action: QAction | None = None
        self.tray = QSystemTrayIcon(QIcon(":/logo.png"), self)

        if sys.platform == "darwin":
            self.win = Window()
            self.tray.activated.connect(self.tray_activated)
        elif sys.platform == "linux":
            self.tray.setContextMenu(self.get_ctx_menu())

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

    def get_ctx_menu(self):
        menu = QMenu()
        self.refresh_action = get_refresh_action(menu)
        self.prev_action = menu.addAction("上一个")
        self.next_action = menu.addAction("下一个")
        get_quit_action(menu)

        self.refresh_action.setCheckable(True)

        return menu
