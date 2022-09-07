import os
from typing import cast

from PySide6.QtCore import Qt
from PySide6.QtGui import (
    QPixmap,
    QIcon,
    QFocusEvent,
    QFontMetrics
)
from PySide6.QtWidgets import (
    QMainWindow,
    QLabel,
    QPushButton,
    QToolButton,
    QWidget
)
from PySide6.QtUiTools import QUiLoader

from .Menu import Menu
from .actions import get_quit_action, get_refresh_action
from .Manager import Manager


class Window(QMainWindow):
    def __init__(self):
        super().__init__()

        loader = QUiLoader()
        cwd = os.getcwd()
        ui_file = os.path.join(cwd, "assets/window.ui")
        style = os.path.join(cwd, "assets/window.css")
        widget = loader.load(ui_file)
        summary = cast(
            QWidget,
            widget.findChild(QWidget, "summary")
        )
        self.prev_btn = cast(
            QPushButton,
            widget.findChild(QPushButton, "prev")
        )
        self.next_btn = cast(
            QPushButton,
            widget.findChild(QPushButton, "next")
        )
        self.thumbnail_label = cast(
            QLabel,
            widget.findChild(QLabel, "thumbnail")
        )
        self.logo_label = cast(
            QLabel,
            widget.findChild(QLabel, "logo")
        )
        self.date_label = cast(
            QLabel,
            widget.findChild(QLabel, "date")
        )
        self.title_label = cast(
            QLabel,
            widget.findChild(QLabel, "title")
        )
        self.copyright_label = cast(
            QLabel,
            widget.findChild(QLabel, "copyright")
        )
        self.settings_btn = cast(
            QToolButton,
            widget.findChild(QToolButton, "settings")
        )
        self.min_btn = cast(
            QToolButton,
            widget.findChild(QToolButton, "minimize")
        )
        self.m = Manager()

        summary.layout().setAlignment(Qt.AlignTop)
        self.setWindowFlag(Qt.FramelessWindowHint)
        self.setCentralWidget(widget)
        self.setFixedSize(360, 180)
        self.setFocusPolicy(Qt.StrongFocus)
        self.init()

        self.next_btn.clicked.connect(self.next)
        self.prev_btn.clicked.connect(self.prev)
        self.m.change_sig.connect(self.set_status)

        with open(style, "r") as f:
            self.setStyleSheet(f.read())

    def set_status(self):
        info = self.m.get_current_info()

        if info:
            t_fm = QFontMetrics(self.title_label.font())
            c_fm = QFontMetrics(self.copyright_label.font())
            title = t_fm.elidedText(
                info["title"],
                Qt.ElideRight,
                self.title_label.width()
            )
            cr = c_fm.elidedText(
                info["copyright"],
                Qt.ElideRight,
                self.copyright_label.width()
            )

            self.title_label.setText(title)
            self.title_label.setToolTip(info["title"])
            self.copyright_label.setText(cr)
            self.copyright_label.setToolTip(info["copyright"])
            self.date_label.setText(info["date"])
            self.thumbnail_label.setPixmap(QPixmap(info["path"]))

        self.next_btn.setEnabled(self.m.index != 6)
        self.prev_btn.setEnabled(self.m.index != 0)

    def prev(self):
        self.m.prev()
        self.set_status()

    def next(self):
        self.m.next()
        self.set_status()

    @staticmethod
    def get_icon(name: str):
        return QIcon(f":/{name}.png")

    def init(self):
        self.thumbnail_label.setFixedSize(96, 54)
        self.thumbnail_label.setScaledContents(True)
        self.logo_label.setText("必应壁纸")
        self.min_btn.setIcon(self.get_icon("minus"))
        self.settings_btn.setIcon(self.get_icon("settings"))
        self.settings_btn.setPopupMode(QToolButton.InstantPopup)
        self.settings_btn.setMenu(self.get_menu())
        self.prev_btn.setIcon(self.get_icon("chevron-left"))
        self.next_btn.setIcon(self.get_icon("chevron-right"))
        self.next_btn.setLayoutDirection(Qt.RightToLeft)
        self.title_label.setWordWrap(True)
        self.copyright_label.setWordWrap(True)

        self.min_btn.clicked.connect(self.hide)

    def get_menu(self):
        menu = Menu(self, self.settings_btn)
        refresh_action = get_refresh_action(menu)
        get_quit_action(menu)
        refresh_action.setCheckable(True)
        menu.setAttribute(Qt.WA_TranslucentBackground)
        menu.setWindowFlag(Qt.FramelessWindowHint)

        return menu

    def focusOutEvent(self, event: QFocusEvent) -> None:
        if event.reason() != Qt.PopupFocusReason:
            self.hide()

    def showEvent(self, e) -> None:
        self.set_status()
