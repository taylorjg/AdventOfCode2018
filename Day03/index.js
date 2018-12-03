const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const parseLine = line => {
  const match = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/.exec(line)
  return {
    id: Number(match[1]),
    x: Number(match[2]),
    y: Number(match[3]),
    w: Number(match[4]),
    h: Number(match[5])
  }
}

const parseLines = lines =>
  lines.map(parseLine)

const makeKey = (x, y) =>
  `${x}-${y}`

const visitSquares = (map, claim, fn, init) => {
  const xs = R.range(claim.x, claim.x + claim.w)
  const ys = R.range(claim.y, claim.y + claim.h)
  const squares = R.chain(x => R.map(y => [x, y], ys), xs)
  const op = (acc, [x, y]) => {
    const key = makeKey(x, y)
    const ids = map.get(key) || []
    return fn(key, ids, acc)
  }
  return R.reduce(op, init, squares)
}

const makeMap = claims => {
  const map = new Map()
  const addSquaresToMap = claim =>
    visitSquares(map, claim, (key, ids) => map.set(key, [...ids, claim.id]))
  claims.forEach(addSquaresToMap)
  return map
}

const part1 = claims => {
  const map = makeMap(claims)
  const answer = Array.from(map.values())
    .filter(ids => ids.length > 1)
    .length
  console.log(`part 1 answer: ${answer}`)
}

const part2 = claims => {
  const map = makeMap(claims)
  const countOverlaps = claim => {
    const fn = (_, ids, acc) => acc + (ids.length > 1 ? 1 : 0)
    return visitSquares(map, claim, fn, 0)
  }
  const overlapCounts = claims.map(claim => ({
    id: claim.id,
    overlaps: countOverlaps(claim)
  }))
  const { id: answer } = overlapCounts.find(({ overlaps }) => overlaps === 0)
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile("Day03/input.txt")
  const lines = buffer.toString().split('\n').filter(R.length)
  const claims = parseLines(lines)
  part1(claims)
  part2(claims)
}

main()
