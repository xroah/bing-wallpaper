from PySide6.QtGui import QGuiApplication
from PySide6.QtCore import Qt

from wallpaper.App import App
import wallpaper.icons


if __name__ == "__main__":
    QGuiApplication.setAttribute(Qt.AA_ShareOpenGLContexts)

    app = App()
    app.exec()
