
from PySide6.QtWidgets import QMenu

from .actions import get_quit_action, get_refresh_action
from .Manager import Manager


class ContextMenu(QMenu):
    def __init__(self):
        super().__init__()

        self.m = Manager()
        self.refresh_action = get_refresh_action(self)
        self.prev_action = self.addAction("上一个")
        self.next_action = self.addAction("下一个")
        get_quit_action(self)
        self.refresh_action.setCheckable(True)

        self.next_action.triggered.connect(self.next)
        self.prev_action.triggered.connect(self.prev)

        self.set_status()

    def set_status(self):
        self.next_action.setEnabled(self.m.index != 6)
        self.prev_action.setEnabled(self.m.index != 0)

    def prev(self):
        self.m.prev()
        self.set_status()

    def next(self):
        self.m.next()
        self.set_status()
