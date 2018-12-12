const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const parseInitialState = line => line.substring(15)

const parseRules = lines => lines.map(parseRule)

const parseRule = line => {
  const match = /([.#]{5}) => ([.#])/.exec(line)
  return {
    left: match[1],
    right: match[2]
  }
}

const tryApplyRule = (m, pot, rule) => {
  const pots = R.range(pot - 2, pot + 3)
  const LLCRR = pots.map(p => m.has(p) ? m.get(p) : '.').join('')
  if (LLCRR === rule.left) {
    return [pot, rule.right]
  }
  return null
}

const tryApplyRules = (m, pot, rules) => {
  return R.reduceWhile(
    kvp => !kvp,
    (_, rule) => tryApplyRule(m, pot, rule),
    null,
    rules) || [pot, '.']
}

const getPotsWithPlants = m => Array.from(m.entries())
  .filter(([, ch]) => ch === '#')
  .map(([pot]) => pot)

const part1 = (initialState, rules) => {
  const reducer = m => {
    const pots = Array.from(m.keys())
    const min = Math.min(...pots)
    const max = Math.max(...pots)
    const extendedPots = [min - 2, min - 1, ...pots, max + 1, max + 2]
    const kvps = extendedPots.map(pot => tryApplyRules(m, pot, rules))
    const m2 = new Map(kvps)
    return m2
  }
  const init = new Map(initialState.split('').map((ch, index) => [index, ch]))
  const finalState = R.range(0, 20).reduce(reducer, init)
  const answer = R.sum(getPotsWithPlants(finalState))
  console.log(`part 1 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day12/input.txt', 'utf8')
  const lines = buffer.trim().split('\n')
  const initialState = parseInitialState(lines[0])
  const rules = parseRules(lines.slice(2))
  part1(initialState, rules)
}

main()
