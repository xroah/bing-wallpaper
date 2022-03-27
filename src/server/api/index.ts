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

function getTime(date: string) {
    const d = new Date(`${date} 00:00:00`)

    return d.getTime()
}

/**
 * query:
 * 
 * page: current page
 * size: page size
 * startDate: start date(like: 2022-03-26)
 * endDate: end date, same as startDate
 */
app.get("/images", async (req, res, next) => {
    const {query} = req
    const {startDate, endDate} = query as any
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

    if (startDate) {
        $and.push({
            timestamp: {
                $gte: getTime(startDate)
            }
        })
    }

    if (endDate) {
        $and.push({
            timestamp: {
                $lte: getTime(endDate)
            }
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
            .find(
                filter,
                {
                    projection: {
                        _id: 0,
                        timestamp: 0
                    }
                }
            )
            .sort({timestamp: -1})
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