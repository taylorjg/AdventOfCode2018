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

const differingCharacterPos = (id1, id2) => {
  const differingPositions = id1
    .split('')
    .map((ch, idx) => ch !== id2.charAt(idx) ? idx : -1)
    .filter(idx => idx >= 0)
  return differingPositions.length === 1 ? differingPositions[0] : -1
}

const part2 = ids => {
  let id
  let pos
  for (let index = 0; index < ids.length; index++) {
    id = ids[index]
    const otherIds = R.remove(index, 1, ids)
    for (let innerIndex = 0; innerIndex < otherIds.length; innerIndex++) {
      const otherId = otherIds[innerIndex]
      pos = differingCharacterPos(id, otherId)
      if (pos >= 0) break
    }
    if (pos >= 0) break
  }
  const answer = R.take(pos, id) + R.drop(pos + 1, id)
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile("Day02/input.txt")
  const ids = buffer.toString().split('\n').filter(R.length)
  part1(ids)
  part2(ids)
}

main()
