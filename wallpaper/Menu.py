from PySide6.QtGui import QShowEvent
from PySide6.QtWidgets import (
    QMenu,
    QMainWindow,
    QToolButton
)


class Menu(QMenu):
    def __init__(self, parent: QMainWindow, btn: QToolButton):
        super().__init__(parent)

        self._window = parent
        self._btn = btn

    def showEvent(self, event: QShowEvent) -> None:
        offset_y = 2
        wg = self._window.frameGeometry()
        bg = self._btn.geometry()
        x = wg.x() + bg.x() + bg.width() - self.width()
        y = wg.y() + bg.y() + bg.height() + offset_y

        self.move(x, y)
