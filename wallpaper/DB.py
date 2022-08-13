import sqlite3
import os


class DB:
    def __init__(self):
        home = os.path.expanduser("~")
        data_dir = os.path.join(home, ".bing")

        if not os.path.exists(data_dir):
            os.makedirs(data_dir)

        self._conn = sqlite3.connect(f"{data_dir}/data.db")
        self._cursor = self._conn.cursor()

        self.create_table()

    def __enter__(self):
        return self

    def __exit__(self, t, v, tb):
        self._conn.commit()
        self._conn.close()

        if t is not None:
            return False

    def create_table(self):
        self._cursor.execute("""
            CREATE TABLE IF NOT EXISTS images(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                create_time DATETIME,
                title VARCHAR(200),
                desc VARCHAR(1000),
                headline VARCHAR(100),
                copyright VARCHAR(100),
                url VARCHAR(200),
                path VARCHAR(500)
            );
        """)

    def insert(
            self,
            *,
            title: str,
            desc: str,
            headline: str,
            copy_right: str,
            url: str,
            path: str
    ):

        self._cursor.execute(f"""
            INSERT INTO images(title, desc, headline, copyright,
            url, path, create_time) VALUES('{title}', '{desc}',
            '{headline}', '{copy_right}', '{url}', '{path}', 
            datetime('now', 'localtime'));
        """)

    def query(self):
        return self._cursor.execute("SELECT * FROM images").fetchall()
