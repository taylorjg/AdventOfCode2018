const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const hasLetterAppearing = count => id => {
  const grouped = R.groupBy(R.identity, id)
  const filtered = R.values(grouped).filter(vs => vs.length === count)
  return filtered.length > 0
}

const part1 = ids => {
  const exactlyTwosCount = ids.filter(hasLetterAppearing(2)).length
  const exactlyThreesCount = ids.filter(hasLetterAppearing(3)).length
  const answer = exactlyTwosCount * exactlyThreesCount
  console.log(`part 1 answer: ${answer}`)
}

const differingPos = (id1, id2) => {
  const differingPositions = id1
    .split('')
    .map((ch, idx) => ch !== id2.charAt(idx) ? idx : -1)
    .filter(idx => idx >= 0)
  return differingPositions.length === 1 ? differingPositions[0] : -1
}

const part2 = ids => {
  const pred = acc => acc.pos < 0
  const innerReducer = (acc, id) =>
    ({ ...acc, pos: differingPos(acc.id, id) })
  const outerReducer = (_, id) =>
    R.reduceWhile(pred, innerReducer, { id, pos: -1 }, ids)
  const { id, pos } = R.reduceWhile(pred, outerReducer, { pos: -1 }, ids)
  const answer = R.take(pos, id) + R.drop(pos + 1, id)
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day02/input.txt', 'utf8')
  const ids = buffer.split('\n').filter(R.length)
  part1(ids)
  part2(ids)
}

main()
