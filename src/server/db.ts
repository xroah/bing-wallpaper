import {Collection, Db, MongoClient} from "mongodb"

export let db!: Db
export let coll!: Collection

export function connect(callback?: (db: Db) => void) {
    const client = new MongoClient("mongodb://localhost:27017")

    client.connect(
        (err, conn) => {
            if (err) {
                throw err
            }

            db = conn!.db("bing-pic")
            coll = db.collection("images")

            if (callback) {
                callback(db)
            }
        }
    )
}
