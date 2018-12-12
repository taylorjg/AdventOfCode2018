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

const spread = (initialState, rules, numGenerations) => {
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
  const finalState = R.range(0, numGenerations).reduce(reducer, init)
  return R.sum(getPotsWithPlants(finalState))
}

const part1 = (initialState, rules) => {
  const answer = spread(initialState, rules, 20)
  console.log(`part 1 answer: ${answer}`)
}

const part2 = (/* initialState, rules */) => {
  // numGenerations: 90; sum: 7260
  // numGenerations: 91; sum: 7290
  // numGenerations: 92; sum: 7400
  // numGenerations: 93; sum: 7446
  // numGenerations: 94; sum: 7544
  // numGenerations: 95; sum: 7603
  // numGenerations: 96; sum: 7692
  // numGenerations: 97; sum: 7761
  // numGenerations: 98; sum: 7844
  // numGenerations: 99; sum: 7920
  // numGenerations: 100; sum: 8000
  // numGenerations: 101; sum: 8080
  // numGenerations: 102; sum: 8160
  // numGenerations: 103; sum: 8240
  // numGenerations: 104; sum: 8320
  // numGenerations: 105; sum: 8400
  // numGenerations: 106; sum: 8480
  // numGenerations: 107; sum: 8560
  // numGenerations: 108; sum: 8640
  // numGenerations: 109; sum: 8720
  // numGenerations: 110; sum: 8800
  // numGenerations: 111; sum: 8880

  // Goes up by 80 each time beyond 99
  const answer = 7920 + ((50000000000 - 99) * 80)
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day12/input.txt', 'utf8')
  const lines = buffer.trim().split('\n')
  const initialState = parseInitialState(lines[0])
  const rules = parseRules(lines.slice(2))
  part1(initialState, rules)
  part2(initialState, rules)
}

main()
