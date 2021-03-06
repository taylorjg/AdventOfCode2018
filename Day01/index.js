const I = require('immutable')
const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const part1 = frequencies => {
  const answer = R.sum(frequencies)
  console.log(`part 1 answer: ${answer}`)
}

// Similar to Haskell's cycle:
// cycle :: [a] -> [a]
function* cycle(xs) {
  for (; ;) {
    yield* xs
  }
}

const part2 = frequencies => {
  const { subtotal: answer } = R.reduceWhile(
    acc => !acc.done,
    (acc, f) => {
      const subtotal = acc.subtotal + f
      const done = acc.subtotals.has(subtotal)
      const subtotals = acc.subtotals.add(subtotal)
      return { subtotal, subtotals, done }
    },
    { subtotal: 0, subtotals: I.Set(), done: false },
    cycle(frequencies)
  )
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day01/input.txt', 'utf8')
  const lines = buffer.split('\n').filter(R.length)
  const frequencies = lines.map(s => parseInt(s, 10))
  part1(frequencies)
  part2(frequencies)
}

main()
