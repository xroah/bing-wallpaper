import json
import os

from PySide6.QtCore import QObject, Signal


class Settings(QObject):
    change_sig = Signal()

    def __init__(self):
        super().__init__()

        self.refresh = self.get()

    @staticmethod
    def get_data_dir() -> str:
        home = os.path.expanduser("~")
        data_dir = os.path.join(home, ".bing")

        if not os.path.exists(data_dir):
            os.makedirs(data_dir)

        return data_dir

    def get(self) -> bool:
        data_dir = self.get_data_dir()
        file = os.path.join(data_dir, "settings.json")

        if not os.path.exists(file):
            return True

        try:
            with open(file, "r") as f:
                settings = json.load(f)

            return settings["refresh"]
        except:
            return True

    def set(self, refresh: bool):
        if self.refresh == refresh:
            return

        self.refresh = refresh
        data_dir = self.get_data_dir()
        file = os.path.join(data_dir, "settings.json")

        self.change_sig.emit()

        with open(file, "w") as f:
            json.dump({"refresh": refresh}, f)


settings = Settings()
