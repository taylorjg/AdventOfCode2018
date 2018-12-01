const { promisify } = require('util')
const fs = require('fs')
const R = require('ramda')
const bilby = require('bilby')
const { OrderedSet } = require('immutable')
const readFile = promisify(fs.readFile)

const part1 = frequencies => {
  const answer = R.sum(frequencies)
  console.log(`part 1 answer: ${answer}`)
}

const part2 = frequencies => {
  const loop = subtotals => {
    const f = frequencies[subtotals.size % frequencies.length]
    const prevSubtotal = subtotals.isEmpty() ? 0 : subtotals.last()
    const nextSubtotal = prevSubtotal + f
    if (subtotals.has(nextSubtotal)) return bilby.done(nextSubtotal)
    return bilby.cont(() => loop(subtotals.add(nextSubtotal)))
  }
  const answer = bilby.trampoline(loop(OrderedSet()))
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
