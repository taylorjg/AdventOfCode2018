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
  const answer = 0
  console.log(`part 1 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile("Day03/input.txt")
  const lines = buffer.toString().split('\n').filter(R.length)
  const claims = parseLines(lines)
  part1(claims)
}

main()
