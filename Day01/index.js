const B = require('bilby')
const I = require('immutable')
const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const part1 = frequencies => {
  const answer = R.sum(frequencies)
  console.log(`part 1 answer: ${answer}`)
}

const part2 = frequencies => {
  const numFrequencies = frequencies.length
  const loop = (index, prevSubtotal, subtotals) => {
    const f = frequencies[index % numFrequencies]
    const nextSubtotal = prevSubtotal + f
    if (subtotals.has(nextSubtotal)) return B.done(nextSubtotal)
    const newSubtotals = subtotals.add(nextSubtotal)
    return B.cont(() => loop(index + 1, nextSubtotal, newSubtotals))
  }
  const answer = B.trampoline(loop(0, 0, I.Set()))
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile("Day01/input.txt")
  const lines = buffer.toString().split('\n').filter(R.length)
  const frequencies = lines.map(s => parseInt(s, 10))
  part1(frequencies)
  part2(frequencies)
}

main()
