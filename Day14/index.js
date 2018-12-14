const R = require('ramda')

const part1 = numRecipes => {
  let elf1Index = 0
  let elf2Index = 1
  let scores = []
  scores[elf1Index] = 3
  scores[elf2Index] = 7
  let numScores = 2
  const moveTo = elfIndex => (elfIndex + 1 + scores[elfIndex]) % numScores
  for (; ;) {
    const total = scores[elf1Index] + scores[elf2Index]
    const digits = [...total.toString()].map(Number)
    digits.forEach((digit, index) => scores[numScores + index] = digit)
    numScores += digits.length
    if (numScores >= numRecipes + 10) break
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
  let numScores = 2
  let pos
  const moveTo = elfIndex => (elfIndex + 1 + scores[elfIndex]) % numScores
  for (; ;) {
    const total = scores[elf1Index] + scores[elf2Index]
    const digits = [...total.toString()].map(Number)
    digits.forEach((digit, index) => scores[numScores + index] = digit)
    numScores += digits.length
    // If scores is long enough, keep checking a string made from the last few numbers.
    if (numScores >= minLen) {
      const s = scores.slice(-minLen).join('')
      pos = s.indexOf(scoreSequence)
      if (pos >= 0) break
    }
    elf1Index = moveTo(elf1Index)
    elf2Index = moveTo(elf2Index)
  }
  const answer = numScores - minLen + pos
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
