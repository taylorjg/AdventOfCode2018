const B = require('bilby')
const I = require('immutable')
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

const main = async () => {
  const buffer = await readFile("Day02/input.txt")
  const ids = buffer.toString().split('\n').filter(R.length)
  part1(ids)
}

main()
