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

const claimToSquaresList = claim => {
  const xs = R.range(claim.x, claim.x + claim.w)
  const ys = R.range(claim.y, claim.y + claim.h)
  return R.chain(x => R.map(y => [x, y], ys), xs)
}

const makeMap = claims => {
  const claimToSquaresData = claim =>
    claimToSquaresList(claim).map(([x, y]) => ({
      key: makeKey(x, y),
      id: claim.id
    }))
  const pipe = R.pipe(
    R.chain(claimToSquaresData),
    R.groupBy(e => e.key),
    R.toPairs,
    pairs => new Map(pairs))
  return pipe(claims)
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
  const countOverlaps = claim => R.reduce(
    (acc, [x, y]) =>
      map.get(makeKey(x, y)).length > 1 ? acc + 1 : acc,
    0,
    claimToSquaresList(claim))
  const overlapCounts = claims.map(claim => ({
    id: claim.id,
    overlaps: countOverlaps(claim)
  }))
  const { id: answer } = overlapCounts.find(({ overlaps }) => overlaps === 0)
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day03/input.txt', 'utf8')
  const lines = buffer.split('\n').filter(R.length)
  const claims = parseLines(lines)
  part1(claims)
  part2(claims)
}

main()
