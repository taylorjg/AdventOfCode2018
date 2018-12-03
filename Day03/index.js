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

const part1 = claims => {
  const map = new Map()
  const makeKey = (x, y) => `${x}-${y}`
  const addSquaresToMap = claim => {
    const xs = R.range(claim.x, claim.x + claim.w)
    const ys = R.range(claim.y, claim.y + claim.h)
    xs.forEach(x => ys.forEach(y => {
      const key = makeKey(x, y)
      const v = map.get(key) || 0
      map.set(key, v + 1)
    }))
  }
  claims.forEach(addSquaresToMap)
  const answer = Array.from(map.values()).filter(v => v > 1).length
  console.log(`part 1 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile("Day03/input.txt")
  const lines = buffer.toString().split('\n').filter(R.length)
  const claims = parseLines(lines)
  part1(claims)
}

main()
