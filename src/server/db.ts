import {Collection, Db, MongoClient} from "mongodb"

export let db!: Db
export let coll!: Collection

interface Callback {
    (db: Db, coll: Collection, close: () => Promise<void>) : void
}

export function connect(callback?: Callback) {
    const client = new MongoClient("mongodb://localhost:27017")

    client.connect(
        (err, conn) => {
            if (err) {
                throw err
            }

            const close = () => client.close()
            db = conn!.db("bing-pic")
            coll = db.collection("images")
            

            if (callback) {
                callback(db, coll, close)
            }
        }
    )
}
