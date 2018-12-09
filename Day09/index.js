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

const part2 = (numPlayers, lastMarble) => {
  const scores = new Map()
  const makeSelfNode = value => {
    const node = { value }
    node.prev = node
    node.next = node
    return node
  }
  const makeNode = (value, prev, next) => ({ value, prev, next })
  const cw = (node, count) => count >= 0 ? cw(node.next, count - 1) : node
  const ccw = (node, count) => count >= 0? cw(node.prev, count - 1) : node
  let currentNode = makeSelfNode(0)
  const turns = R.range(0, lastMarble)
  turns.forEach(turn => {
    const elf = 1 + turn % numPlayers
    const currentMarble = turn + 1
    if (currentMarble % 23 == 0) {
      const currentScore = scores.has(elf) ? scores.get(elf) : 0
      const seventhCcwNode = ccw(currentNode, 7)
      scores.set(elf, currentScore + currentMarble + seventhCcwNode.value)
      seventhCcwNode.prev.next = seventhCcwNode.next
      seventhCcwNode.next.prev = seventhCcwNode.prev
      currentNode = seventhCcwNode.next
    } else {
      const prev = cw(currentNode, 1)
      const next = cw(prev, 1)
      const newNode = makeNode(currentMarble, prev, next)
    }
  })
  const answer = Math.max(...scores.values())
  console.log(`part 2 answer: ${answer}`)
}

part1(9, 25)
part1(10, 1618)
part1(13, 7999)
part1(17, 1104)
part1(21, 6111)
part1(30, 5807)
// part1(410, 72059)

part2(9, 25)
part2(10, 1618)
part2(13, 7999)
part2(17, 1104)
part2(21, 6111)
part2(30, 5807)
part2(410, 72059)
part2(410, 72059 * 100)
