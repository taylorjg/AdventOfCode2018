const R = require('ramda')

const part1 = numRecipes => {
  let elf1Index = 0
  let elf2Index = 1
  let scores = Array(numRecipes + 10)
  scores[elf1Index] = 3
  scores[elf2Index] = 7
  let len = 2
  const moveTo = (elfIndexOld) => {
    const numMoves = 1 + scores[elfIndexOld]
    const elfIndexNew = (elfIndexOld + numMoves) % len
    return elfIndexNew
  }
  for (;;) {
    // console.log(`${JSON.stringify(scores)}; ${elf1Index}; ${elf2Index}`)
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

part1(9) // 5158916779
part1(5) // 0124515891
part1(18) // 9251071085
part1(2018) // 5941429882
part1(513401) // 5371393113
