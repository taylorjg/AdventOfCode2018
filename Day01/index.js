const { promisify } = require('util')
const fs = require('fs')
const readFile = promisify(fs.readFile)
const R = require('ramda')

const part1 = frequencies => {
  const total = R.sum(frequencies)
  console.log(`part 1 answer: ${total}`)
}

const part2 = frequencies => {
  let index = 0
  let subtotal = 0
  const subtotals = new Set()
  for (;;) {
    subtotal += frequencies[index++ % frequencies.length]
    if (subtotals.has(subtotal)) break
    subtotals.add(subtotal)
  }
  console.log(`part 2 answer: ${subtotal}`)
}

const main = async () => {
  const buffer = await readFile("Day01/input.txt")
  const lines = buffer.toString().split('\n').filter(s => s.length > 0)
  const frequencies = lines.map(s => parseInt(s, 10))
  part1(frequencies)
  part2(frequencies)
}

main()
