from PySide6.QtGui import QIcon, QCursor
from PySide6.QtWidgets import QApplication, QSystemTrayIcon

from .Window import Window


class App(QApplication):
    def __init__(self):
        super().__init__()

        self.win = Window()
        self.tray = QSystemTrayIcon(self)
        self.tray.setIcon(QIcon(":/logo.png"))
        self.tray.show()
        self.tray.activated.connect(self.tray_activated)

    def tray_activated(self, reason):
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

