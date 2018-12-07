const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

// Step C must be finished before step A can begin.
const parseLine = line => {
  const match = /Step ([A-Z]) must be finished before step ([A-Z]) can begin./.exec(line)
  return {
    id1: match[1],
    id2: match[2]
  }
}

const parseLines = lines =>
  lines.map(parseLine)

const part1 = steps => {
  steps.forEach(step => console.log(`${step.id1} before ${step.id2}`))
  const answer = '?'
  console.log(`part 1 answer: ${answer}`)
}
const main = async () => {
  // const buffer = await readFile('Day07/input.txt', 'utf8')
  const buffer = await readFile('Day07/test.txt', 'utf8')
  const lines = buffer.trim().split('\n')
  const steps = parseLines(lines)
  part1(steps)
}

main()
