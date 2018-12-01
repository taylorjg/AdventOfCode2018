const { promisify } = require('util')
const fs = require('fs')
const readFile = promisify(fs.readFile)
const R = require('ramda')
const bilby  =require('bilby')

const part1 = frequencies => {
  const answer = R.sum(frequencies)
  console.log(`part 1 answer: ${answer}`)
}

const part2 = frequencies => {
  const loop = (index, subtotal, subtotals) => {
    const f = frequencies[index % frequencies.length]
    const newSubtotal = subtotal + f
    if (subtotals.has(newSubtotal)) return bilby.done(newSubtotal)
    subtotals.add(newSubtotal)
    return bilby.cont(() => loop(index + 1, newSubtotal, subtotals))
  }
  const answer = bilby.trampoline(loop(0, 0, new Set()))
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile("Day01/input.txt")
  const lines = buffer.toString().split('\n').filter(s => s.length > 0)
  const frequencies = lines.map(s => parseInt(s, 10))
  part1(frequencies)
  part2(frequencies)
}

main()
