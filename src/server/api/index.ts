import express from "express"
import {Filter, Document} from "mongodb"
import {coll} from "../db"

const app = express()
const DEFAULT_SIZE = 12
const DEFAULT_PAGE = 1

function getPositiveInt(v: string, defaultValue?: number) {
    const intV = Number.parseInt(v)

    if (intV < 0 || !intV) {
        return defaultValue || 1
    }

    return intV
}

/**
 * query:
 * 
 * page: current page
 * size: page size
 * startDate: start date
 * endDate: end date
 */
app.get("/images", async (req, res, next) => {
    const {query} = req
    let page = getPositiveInt(
        query["page"] as string,
        DEFAULT_PAGE
    )
    const size = getPositiveInt(
        query["size"] as string,
        DEFAULT_SIZE
    )
    let $and: Filter<Document>[] = []
    let filter: Filter<Document> = {}
        
    if (query["startDate"]) {
        $and.push({
            date: {$gte: query["startDate"]}
        })
    }

    if (query["endDate"]) {
        $and.push({
            date: {$lte: query["endDate"]}
        })
    }

    if ($and.length === 1) {
        filter = $and[0]!
    } else if ($and.length === 2) {
        filter = {$and}
    }

    try {
        const count = await coll.countDocuments(filter)
        const pages = Math.ceil(count / size)

        if (pages > 0 && page > pages) {
            page = pages
        }

        const list = await coll
            .find(filter)
            .skip((page - 1) * size)
            .limit(size)
            .toArray()

        res.json({
            code: 0,
            data: {
                count,
                pages,
                list
            }
        })
    } catch (error) {
        next(error)
    }
})

export default app