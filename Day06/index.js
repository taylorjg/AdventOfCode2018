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

const makeKey = ({ x, y }) =>
  `${x}-${y}`

const manhattanDistance = ({ x: p1, y: p2 }, { x: q1, y: q2 }) =>
  Math.abs(p1 - q1) + Math.abs(p2 - q2)

const findClosest = (p, coordsList) => {
  const distancesTo = coordsList.map((q, id) => ({ id, d: manhattanDistance(p, q) }))
  const sorted = distancesTo.sort((a, b) => a.d - b.d)
  const best = R.head(sorted)
  const tied = sorted.filter(({ d }) => d === best.d).length > 1
  return tied ? null : best
}

const calculateDimensions = coordsList => {
  const maxX = Math.max(...coordsList.map(({ x }) => x))
  const maxY = Math.max(...coordsList.map(({ y }) => y))
  const xs = R.range(0, maxX + 1)
  const ys = R.range(0, maxY + 1)
  const locations = R.chain(x => R.map(y => ({ x, y }), ys), xs)
  return { maxX, maxY, xs, ys, locations }
}

const makeMap = (coordsList, dimensions) => {
  const pairs = dimensions.locations.map(location => {
    const closest = findClosest(location, coordsList)
    return closest && [makeKey(location), closest.id]
  })
  return new Map(pairs.filter(R.identity))
}

const findInfiniteLocationIds = (map, dimensions) => {
  const xs = dimensions.xs
  const ys = dimensions.ys
  const maxX = dimensions.maxX
  const maxY = dimensions.maxY
  const idsAlongEdge = locations => new Set(locations
    .filter(location => map.has(makeKey(location)))
    .map(location => map.get(makeKey(location))))
  const firstRow = idsAlongEdge(xs.map(x => ({ x, y: 0 })))
  const lastRow = idsAlongEdge(xs.map(x => ({ x, y: maxY })))
  const firstColumn = idsAlongEdge(ys.map(y => ({ x: 0, y })))
  const lastColumn = idsAlongEdge(ys.map(y => ({ x: maxX, y })))
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
  const isFinite = ids => !infiniteLocationIds.includes(R.head(ids))
  const finiteGroups = groups.filter(isFinite)
  const sortedFiniteGroups = finiteGroups.sort((a, b) => b.length - a.length)
  const answer = R.head(sortedFiniteGroups).length
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
