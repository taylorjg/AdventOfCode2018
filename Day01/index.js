const { promisify } = require('util')
const fs = require('fs')
const readFile = promisify(fs.readFile)
const R = require('ramda')

const part1 = frequencies => {
  const total = R.sum(frequencies)
  console.log(`part 1 answer: ${total}`)
}

const part2 = frequencies => {
  const repeatedFrequencies = [].concat(...R.repeat(frequencies, 200))
  const subtotals = R.scan((acc, f) => f + acc, 0, repeatedFrequencies)
  const indices = R.range(0, subtotals.length)
  const subtotalsWithIndices = R.zipWith(R.pair, subtotals, indices)
  const groupedSubtotals = R.groupBy(([x]) => x, subtotalsWithIndices)
  const filtered = R.values(groupedSubtotals).filter(vs => vs.length > 1)
  const comparator = (vs1, vs2) => vs1[1][1] - vs2[1][1]
  const sorted = R.sort(comparator, filtered)
  console.log(`part 2 answer: ${sorted[0][0][0]}`)
}

const main = async () => {
  const buffer = await readFile("Day01/input.txt")
  const lines = buffer.toString().split('\n').filter(s => s.length > 0)
  const frequencies = lines.map(s => parseInt(s, 10))
  part1(frequencies)
  part2(frequencies)
}

main()
