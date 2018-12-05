const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const react = p => {
  const findReactingUnits = s => {
    for (let idx = 0; idx < s.length - 1; idx++) {
      const a = s.codePointAt(idx)
      const b = s.codePointAt(idx + 1)
      if (Math.abs(a - b) === 32) return idx
    }
    return -1
  }
  for (;;) {
    const pos = findReactingUnits(p)
    if (pos < 0) break
    p = R.take(pos, p) + R.drop(pos + 2, p)
  }
  return p
}

const part1 = polymer => {
  const answer = react(polymer).length
  console.log(`part 1 answer: ${answer}`)
}

const part2 = polymer => {
  const removeUnitAndReact = unit => {
    const polymerWithUnitRemoved = polymer.replace(new RegExp(unit, 'ig'), '')
    return react(polymerWithUnitRemoved).length
  }
  const a = "a".codePointAt(0)
  const z = "z".codePointAt(0) + 1
  const letters = R.range(a, z).map(n => String.fromCodePoint(n))
  const lengths = R.map(removeUnitAndReact, letters)
  const lengthsSortedAsc = R.sort((a, b) => a - b, lengths)
  const answer = R.head(lengthsSortedAsc)
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day05/input.txt', 'utf8')
  const polymer = buffer.split('\n')[0]
  part1(polymer)
  part2(polymer)
}

main()
