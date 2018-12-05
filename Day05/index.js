const B = require('bilby')
const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const findReactingUnits = p => {
  const reducer = (_, idx) => {
    const a = p.codePointAt(idx)
    const b = p.codePointAt(idx + 1)
    return Math.abs(a - b) === 32 ? idx : -1
  }
  return R.reduceWhile(pos => pos < 0, reducer, -1, R.range(0, p.length - 1))
}

const react = p => {
  const pos = findReactingUnits(p)
  return pos >= 0
    ? B.cont(() => react(R.take(pos, p) + R.drop(pos + 2, p)))
    : B.done(p)
}

const part1 = polymer => {
  const answer = B.trampoline(react(polymer)).length
  console.log(`part 1 answer: ${answer}`)
}

const part2 = polymer => {
  const removeUnitAndReact = unit => {
    const polymerWithUnitRemoved = polymer.replace(new RegExp(unit, 'ig'), '')
    return B.trampoline(react(polymerWithUnitRemoved)).length
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
