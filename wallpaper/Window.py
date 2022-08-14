import os
import sys
from typing import cast

from PySide6.QtCore import Qt
from PySide6.QtGui import QPixmap, QIcon, QFocusEvent
from PySide6.QtWidgets import (
    QMainWindow,
    QLabel,
    QPushButton,
    QToolButton
)
from PySide6.QtUiTools import QUiLoader

from .Menu import Menu


class Window(QMainWindow):
    def __init__(self):
        super().__init__()

        loader = QUiLoader()
        cwd = os.getcwd()
        ui_file = os.path.join(cwd, "assets/window.ui")
        style = os.path.join(cwd, "assets/window.css")
        widget = loader.load(ui_file)
        self.prev_btn = cast(
            QPushButton,
            widget.findChild(QPushButton, "prev")
        )
        self.thumbnail_label = cast(
            QLabel,
            widget.findChild(QLabel, "thumbnail")
        )
        self.logo_label = cast(
            QLabel,
            widget.findChild(QLabel, "logo")
        )
        self.settings_btn = cast(
            QToolButton,
            widget.findChild(QToolButton, "settings")
        )
        self.min_btn = cast(
            QToolButton,
            widget.findChild(QToolButton, "minimize")
        )

        self.setWindowFlag(Qt.FramelessWindowHint)
        self.setCentralWidget(widget)
        self.setFixedSize(360, 200)
        self.setFocusPolicy(Qt.StrongFocus)
        self.init()

        with open(style, "r") as f:
            self.setStyleSheet(f.read())

    def init(self):
        self.thumbnail_label.setFixedSize(96, 54)
        self.logo_label.setPixmap(QPixmap(":/logo.png"))
        self.logo_label.setFixedSize(30, 30)
        self.logo_label.setScaledContents(True)
        self.min_btn.setIcon(QIcon(":/minus.png"))
        self.settings_btn.setIcon(QIcon(":/settings.png"))
        self.settings_btn.setPopupMode(QToolButton.InstantPopup)
        self.settings_btn.setMenu(self.get_menu())
        self.min_btn.clicked.connect(self.hide)

    def get_menu(self):
        menu = Menu(self, self.settings_btn)
        refresh_action = menu.addAction("每日壁纸刷新")
        quit_action = menu.addAction("退出")
        refresh_action.setCheckable(True)
        quit_action.triggered.connect(
            lambda: sys.exit(0)
        )
        menu.setAttribute(Qt.WA_TranslucentBackground)
        menu.setWindowFlag(Qt.FramelessWindowHint)

        return menu

    def focusOutEvent(self, event: QFocusEvent) -> None:
        if event.reason() != Qt.PopupFocusReason:
            self.hide()
