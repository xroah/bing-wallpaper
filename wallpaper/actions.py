import sys

from PySide6.QtGui import QAction
from PySide6.QtWidgets import QMenu

from wallpaper.Settings import settings


def get_quit_action(menu: QMenu) -> QAction:
    a = menu.addAction("退出")
    a.triggered.connect(lambda: sys.exit(0))

    return a


def get_refresh_action(menu: QMenu) -> QAction:
    a = menu.addAction("每日壁纸刷新")

    a.setCheckable(True)
    a.setChecked(settings.get())
    a.triggered.connect(lambda: settings.set(a.isChecked()))

    return a
