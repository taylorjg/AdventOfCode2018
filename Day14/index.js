const R = require('ramda')

const part1 = numRecipes => {
  let elf1Index = 0
  let elf2Index = 1
  let scores = []
  scores[elf1Index] = 3
  scores[elf2Index] = 7
  let len = 2
  const moveTo = (elfIndexOld) => {
    const numMoves = 1 + scores[elfIndexOld]
    const elfIndexNew = (elfIndexOld + numMoves) % len
    return elfIndexNew
  }
  for (; ;) {
    const total = scores[elf1Index] + scores[elf2Index]
    const totalChars = [...total.toString()]
    const totalNumbers = totalChars.map(ch => parseInt(ch, 10))
    for (idx of R.range(0, totalNumbers.length)) {
      scores[len + idx] = totalNumbers[idx]
    }
    len += totalNumbers.length
    if (len >= numRecipes + 10) break
    elf1Index = moveTo(elf1Index)
    elf2Index = moveTo(elf2Index)
  }
  const answer = scores.slice(numRecipes, numRecipes + 10).join('')
  console.log(`part 1 answer: ${answer}`)
}

const part2 = scoreSequence => {
  const scoreSequenceLen = scoreSequence.length
  const minLen = scoreSequenceLen + 2
  let elf1Index = 0
  let elf2Index = 1
  let scores = []
  scores[elf1Index] = 3
  scores[elf2Index] = 7
  let len = 2
  let pos
  const moveTo = (elfIndexOld) => {
    const numMoves = 1 + scores[elfIndexOld]
    const elfIndexNew = (elfIndexOld + numMoves) % len
    return elfIndexNew
  }
  for (; ;) {
    const total = scores[elf1Index] + scores[elf2Index]
    const totalChars = [...total.toString()]
    const totalNumbers = totalChars.map(ch => parseInt(ch, 10))
    for (idx of R.range(0, totalNumbers.length)) {
      scores[len + idx] = totalNumbers[idx]
    }
    len += totalNumbers.length
    // If scores is long enough, keep checking a string made from the last few numbers.
    if (len >= minLen) {
      const s = scores.slice(-minLen).join('')
      pos = s.indexOf(scoreSequence)
      if (pos >= 0) break
    }
    elf1Index = moveTo(elf1Index)
    elf2Index = moveTo(elf2Index)
  }
  const answer = len - minLen + pos
  console.log(`part 2 answer: ${answer}`)
}

part1(9)
part1(5)
part1(18)
part1(2018)
part1(513401)

part2("51589")
part2("01245")
part2("92510")
part2("59414")
part2("513401")
