const R = require('ramda')

const part1 = (numPlayers, lastMarble) => {
  const scores = new Map()
  let currentMarbleIndex = 0
  let marbles = [0]
  const turns = R.range(0, lastMarble)
  turns.forEach(turn => {
    const elf = 1 + turn % numPlayers
    const length = marbles.length
    const currentMarble = turn + 1
    if (currentMarble % 23 == 0) {
      const currentScore = scores.has(elf) ? scores.get(elf) : 0
      const seventhCcwIndex = (length - (7 - currentMarbleIndex)) % length
      const seventhCcw = marbles[seventhCcwIndex]
      scores.set(elf, currentScore + currentMarble + seventhCcw)
      marbles = R.remove(seventhCcwIndex, 1, marbles)
      currentMarbleIndex = seventhCcwIndex % (length - 1)
    } else {
      currentMarbleIndex = currentMarbleIndex === length - 1 ? 1 : currentMarbleIndex + 2
      marbles = R.insert(currentMarbleIndex, currentMarble, marbles)
    }
  })
  const answer = Math.max(...scores.values())
  console.log(`part 1 answer: ${answer}`)
}

part1(9, 25)
part1(10, 1618)
part1(13, 7999)
part1(17, 1104)
part1(21, 6111)
part1(30, 5807)
part1(410, 72059)
