const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

// Step C must be finished before step A can begin.
const parseLine = line => {
  const match = /Step ([A-Z]) must be finished before step ([A-Z]) can begin./.exec(line)
  return {
    id1: match[1],
    id2: match[2]
  }
}

const parseLines = lines =>
  lines.map(parseLine)

const makeMesh = steps => {
  let mesh = []
  const findId = id => mesh.find(e => e.id === id)
  for (step of steps) {
    const entry1 = findId(step.id1)
    if (!entry1) {
      mesh.push({ id: step.id1, deps: [] })
    }
    const entry2 = findId(step.id2)
    if (entry2) {
      entry2.deps.push(step.id1)
    } else {
      mesh.push({ id: step.id2, deps: [step.id1] })
    }
  }
  return mesh
}

const orderMesh = mesh => {
  const loop = (acc, completed) => {
    const justCompleted = e => {
      const alreadyCompleted = completed.has(e.id)
      const allDepsCompleted = e.deps.every(dep => completed.has(dep))
      return !alreadyCompleted && allDepsCompleted
    }
    const v1 = mesh.filter(justCompleted)
    if (v1.length === 0) return acc
    const v2 = v1.map(e => e.id)
    const v3 = v2.sort()
    const acc2 = acc + v3.join('')

    // Mutable!
    v3.forEach(id => completed.add(id))

    return loop(acc2, completed)
  }
  return loop('', new Set())
}

const part1 = steps => {
  const mesh = makeMesh(steps)
  console.dir(mesh)
  const answer = orderMesh(mesh)
  console.log(`part 1 answer: ${answer}`)
}
const main = async () => {
  // const buffer = await readFile('Day07/input.txt', 'utf8')
  const buffer = await readFile('Day07/test.txt', 'utf8')
  const lines = buffer.trim().split('\n')
  const steps = parseLines(lines)
  part1(steps)
}

main()
