const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const parseLine = line => {
  const match = /(\d+), (\d+)/.exec(line)
  return {
    x: Number(match[1]),
    y: Number(match[2])
  }
}

const parseLines = lines =>
  lines.map(parseLine)

const makeKey = (x, y) =>
  `${x}-${y}`

const manhattanDistance = ({ x: p1, y: p2 }, { x: q1, y: q2 }) =>
  Math.abs(p1 - q1) + Math.abs(p2 - q2)

const findClosest = (p, coordsList) => {
  const v1 = coordsList.map((q, id) => ({ id, d: manhattanDistance(p, q) }))
  const v2 = v1.sort((a, b) => a.d - b.d)
  const v3 = R.head(v2)
  const v4 = v2.filter(({ d }) => d === v3.d)
  return v4.length === 1 ? v3 : null
}

const calculateDimensions = coordsList => {
  const maxX = Math.max(...coordsList.map(c => c.x)) + 2
  const maxY = Math.max(...coordsList.map(c => c.y)) + 2
  const xs = R.range(0, maxX)
  const ys = R.range(0, maxY)
  const locations = R.chain(x => R.map(y => ({ x, y }), ys), xs)
  return { maxX, maxY, xs, ys, locations }
}

const makeMap = (coordsList, dimensions) => {
  const map = new Map()
  dimensions.locations.forEach(p => {
    const closest = findClosest(p, coordsList)
    if (closest) {
      const k = makeKey(p.x, p.y)
      map.set(k, closest.id)
    }
  })
  return map
}

const findInfiniteLocationIds = (map, dimensions) => {
  const xs = dimensions.xs
  const ys = dimensions.ys
  const maxX = dimensions.maxX
  const maxY = dimensions.maxY
  const idsAlongEdge = locations => {
    const locationsInMap = locations.filter(({ x, y }) => map.has(makeKey(x, y)))
    const ids = locationsInMap.map(({ x, y }) => map.get(makeKey(x, y)))
    return new Set(ids)
  }
  const firstRow = idsAlongEdge(xs.map(x => ({ x, y: 0 })))
  const lastRow = idsAlongEdge(xs.map(x => ({ x, y: maxY - 1 })))
  const firstColumn = idsAlongEdge(ys.map(y => ({ x: 0, y })))
  const lastColumn = idsAlongEdge(ys.map(y => ({ x: maxX - 1, y })))
  return Array.from(new Set([
    ...firstRow.values(),
    ...lastRow.values(),
    ...firstColumn.values(),
    ...lastColumn.values()
  ]).values())
}

const part1 = coordsList => {
  const dimensions = calculateDimensions(coordsList)
  const map = makeMap(coordsList, dimensions)
  const infiniteLocationIds = findInfiniteLocationIds(map, dimensions)
  const ids = map.values()
  const idsToGroups = R.groupBy(R.identity, ids)
  const groups = R.values(idsToGroups)
  const groupsSorted = groups.sort((a, b) => b.length - a.length)
  const notInfinite = ids => !infiniteLocationIds.includes(R.head(ids))
  const groupsFitered = groupsSorted.filter(notInfinite)
  const answer = R.head(groupsFitered).length
  console.log(`part 1 answer: ${answer}`)
}

const totalDistance = ps => q =>
  R.sum(ps.map(p => manhattanDistance(p, q)))

const part2 = (coordsList, threshold) => {
  const dimensions = calculateDimensions(coordsList)
  const totalDistances = dimensions.locations.map(totalDistance(coordsList))
  const answer = totalDistances.filter(total => total < threshold).length
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day06/input.txt', 'utf8')
  const lines = buffer.trim().split('\n')
  const coordsList = parseLines(lines)
  part1(coordsList)
  part2(coordsList, 10000)
}

main()
