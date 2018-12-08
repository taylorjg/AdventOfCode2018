const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const readNode = (numbers, index) => {
  const numChildNodes = numbers[index]
  const numMetadataEntries = numbers[index + 1]
  const reducer = (acc, _) => {
    const [childNode, length] = readNode(numbers, acc.index)
    return {
      index: acc.index + length,
      childNodes: [...acc.childNodes, childNode]
    }
  }
  const init = {
    index: index + 2,
    childNodes: []
  }
  const { index: idx1, childNodes } = R.range(0, numChildNodes).reduce(reducer, init)
  const idx2 = idx1 + numMetadataEntries
  const metadataEntries = numbers.slice(idx1, idx2)
  const node = {
    childNodes,
    metadataEntries
  }
  return [node, idx2 - index]
}

const part1 = numbers => {
  const [root] = readNode(numbers, 0)
  const sumMetadataEntries = n =>
    R.sum(n.metadataEntries) + R.sum(n.childNodes.map(sumMetadataEntries))
  const answer = sumMetadataEntries(root)
  console.log(`part 1 answer: ${answer}`)
}

const part2 = numbers => {
  const [root] = readNode(numbers, 0)
  const nodeValue = n => {
    if (n.childNodes.length === 0) return R.sum(n.metadataEntries)
    const validChildRefs = R.range(1, n.childNodes.length + 1)
    const childRefIndices = n.metadataEntries
      .filter(childRef => validChildRefs.includes(childRef))
      .map(childRef => childRef - 1)
    return R.sum(childRefIndices.map(index => nodeValue(n.childNodes[index])))
  }
  const answer = nodeValue(root)
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day08/input.txt', 'utf8')
  // const buffer = await readFile('Day08/test.txt', 'utf8')
  const numbers = buffer.trim().split(/\s+/).map(s => parseInt(s, 10))
  part1(numbers)
  part2(numbers)
}

main()
