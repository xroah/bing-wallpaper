import os
from typing import cast

from PySide6.QtCore import Qt
from PySide6.QtGui import QPixmap
from PySide6.QtWidgets import (
    QMainWindow,
    QLabel, QPushButton, QStyle
)
from PySide6.QtUiTools import QUiLoader


class Window(QMainWindow):
    def __init__(self):
        super().__init__()

        loader = QUiLoader()
        cwd = os.getcwd()
        ui_file = os.path.join(cwd, "assets/window.ui")
        style = os.path.join(cwd, "assets/window.css")
        widget = loader.load(ui_file)
        self.prev = cast(
            QPushButton,
            widget.findChild(QPushButton, "prev")
        )
        self.thumbnail = cast(
            QLabel,
            widget.findChild(QLabel, "thumbnail")
        )
        self.logo = cast(
            QLabel,
            widget.findChild(QLabel, "logo")
        )

        self.setCentralWidget(widget)
        self.setFixedSize(360, 200)
        self.setWindowFlags(
            Qt.FramelessWindowHint |
            Qt.WindowStaysOnTopHint
        )
        self.init()

        with open(style, "r") as f:
            self.setStyleSheet(f.read())

    def init(self):
        self.thumbnail.setFixedSize(96, 54)
        self.logo.setPixmap(QPixmap(":/logo.png"))
        self.logo.setFixedSize(30, 30)
        self.logo.setScaledContents(True)
