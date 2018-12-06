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

const makeMap = coordsList => {
  const maxX = Math.max(...coordsList.map(c => c.x)) + 2
  const maxY = Math.max(...coordsList.map(c => c.y)) + 2
  const xs = R.range(0, maxX)
  const ys = R.range(0, maxY)
  const locations = R.chain(x => R.map(y => ({ x, y }), ys), xs)
  const map = new Map()
  locations.forEach(p => {
    const closest = findClosest(p, coordsList)
    if (closest) {
      const k = makeKey(p.x, p.y)
      map.set(k, closest.id)
    }
  })
  // dumpMap(map, maxX, maxY)
  return map
}

const dumpMap = (map, maxX, maxY) => {
  const xs = R.range(0, maxX)
  const ys = R.range(0, maxY)
  ys.forEach(y => {
    const chs = xs.map(x => {
      const k = makeKey(x, y)
      if (map.has(k)) return map.get(k).toString()
      return '.'
    })
    const row = chs.join('')
    console.log(row)
  })
}

const findInfiniteLocations = (map, maxX, maxY) => {
  console.log(`maxX: ${maxX}; maxY: ${maxY}`)
  const xs = R.range(0, maxX + 1)
  const ys = R.range(0, maxY + 1)
  const findIdsAtLocations = locations => {
    const locationsInMap = locations.filter(({ x, y }) => map.has(makeKey(x, y)))
    const ids = locationsInMap.map(({ x, y }) => map.get(makeKey(x, y)))
    return ids
  }
  const firstRow = new Set(findIdsAtLocations(xs.map(x => ({ x, y: 0 }))))
  const lastRow = new Set(findIdsAtLocations(xs.map(x => ({ x, y: maxY - 1 }))))
  const firstColumn = new Set(findIdsAtLocations(ys.map(y => ({ x: 0, y }))))
  const lastColumn = new Set(findIdsAtLocations(ys.map(y => ({ x: maxX - 1, y }))))
  const infiniteLocations = Array.from(new Set([
    ...firstRow.values(),
    ...lastRow.values(),
    ...firstColumn.values(),
    ...lastColumn.values()
  ]).values())
  // console.log(`infiniteLocations: ${infiniteLocations.toString()}`)
  return infiniteLocations
}

const part1 = coordsList => {
  const maxX = Math.max(...coordsList.map(c => c.x)) + 2
  const maxY = Math.max(...coordsList.map(c => c.y)) + 2
  const map = makeMap(coordsList)
  const infiniteLocations = findInfiniteLocations(map, maxX, maxY)
  const v1 = map.values()
  const v2 = R.groupBy(R.identity, v1)
  const v3 = R.values(v2)
  const v4 = v3.sort((a, b) => b.length - a.length)
  const v5 = v4.filter(l => !infiniteLocations.includes(l[0]))
  const v6 = v5.map(v => `${v[0]}: ${v.length}`)
  const answer = v5[0].length
  console.log(`part 1 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day06/input.txt', 'utf8')
  // const buffer = await readFile('Day06/test.txt', 'utf8')
  const lines = buffer.trim().split('\n')
  const coordsList = parseLines(lines)
  part1(coordsList)
}

main()
