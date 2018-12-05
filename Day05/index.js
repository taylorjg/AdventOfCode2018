const B = require('bilby')
const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const findReactingUnits = p => {
  for (const idx of R.range(0, p.length - 1)) {
    const codePoint1 = p.codePointAt(idx)
    const codePoint2 = p.codePointAt(idx + 1)
    if (Math.abs(codePoint1 - codePoint2) === 32) return idx
  }
  return -1
}

const destroyUnits = (p, pos) =>
  R.take(pos, p) + R.drop(pos + 2, p)

const react = polymer => {
  const loop = p => {
    const pos = findReactingUnits(p)
    return pos >= 0
      ? B.cont(() => loop(destroyUnits(p, pos)))
      : B.done(p)
  }
  return B.trampoline(loop(polymer))
}

const part1 = polymer => {
  const answer = react(polymer).length
  console.log(`part 1 answer: ${answer}`)
}

const letterRange = (ch1, ch2) => {
  const codePoint1Incl = ch1.codePointAt(0)
  const codePoint2Excl = ch2.codePointAt(0) + 1
  return String.fromCodePoint(...R.range(codePoint1Incl, codePoint2Excl))
}

const part2 = polymer => {
  const removeLetterAndReact = letter => {
    const r = new RegExp(letter, 'ig')
    const newPolymer = polymer.replace(r, '')
    return react(newPolymer).length
  }
  const lengths = R.map(removeLetterAndReact, letterRange("a", "z"))
  const lengthsSortedAsc = R.sort((a, b) => a - b, lengths)
  const answer = R.head(lengthsSortedAsc)
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day05/input.txt', 'utf8')
  const polymer = buffer.trim()
  part1(polymer)
  part2(polymer)
}

main()
