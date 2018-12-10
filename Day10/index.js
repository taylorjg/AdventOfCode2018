const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const parseLine = line => {
  const match = /position=<\s*(-?\d+),\s+(-?\d+)> velocity=<\s*(-?\d+),\s+(-?\d+)>/.exec(line)
  return {
    p: {
      x: Number(match[1]),
      y: Number(match[2])
    },
    v: {
      x: Number(match[3]),
      y: Number(match[4])
    }
  }
}

const parseLines = lines =>
  lines.map(parseLine)

const drawLights = (points, dimensions) => {
  const makeKey = (x, y) => `${x}-${y}`
  const makePair = point => [makeKey(point.p.x, point.p.y), point]
  const map = new Map(points.map(makePair))
  for (y of R.range(dimensions.minY, dimensions.maxY + 1)) {
    const row = R.range(dimensions.minX, dimensions.maxX + 1)
      .map(x => map.has(makeKey(x, y)) ? '#' : '.')
    console.log(row.join(''))
  }
  console.log()
}

const moveLights = points => {
  points.forEach(point => {
    point.p.x += point.v.x    
    point.p.y += point.v.y
  })
}

const waitForKeyPress = () => {
  const fd = fs.openSync('/dev/stdin', 'rs')
  const buffer = new Buffer(1)
  fs.readSync(fd, buffer, 0, 1)
  fs.closeSync(fd)
  return buffer.toString()
}

const part1 = points => {
  const minX = Math.min(...points.map(point => point.p.x))
  const maxX = Math.max(...points.map(point => point.p.x))
  const minY = Math.min(...points.map(point => point.p.y))
  const maxY = Math.max(...points.map(point => point.p.y))
  const dimensions = { minX, maxX, minY, maxY }
  console.dir(dimensions)
  console.log()
  for (;;) {
    drawLights(points, dimensions)
    if (waitForKeyPress() === 'q') break
    moveLights(points)
  }
}

const main = async () => {
  // const buffer = await readFile('Day10/input.txt', 'utf8')
  const buffer = await readFile('Day10/test.txt', 'utf8')
  const lines = buffer.trim().split('\n')
  const points = parseLines(lines)
  part1(points)
}

main()
