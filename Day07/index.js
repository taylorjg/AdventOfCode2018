const B = require('bilby')
const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const parseLine = line => {
  const match = /Step ([A-Z]) must be finished before step ([A-Z]) can begin./.exec(line)
  return {
    id1: match[1],
    id2: match[2]
  }
}

const parseLines = lines =>
  lines.map(parseLine)

// TODO: mutates 'mesh' and 'entry2.deps'
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
  const loop = acc => {
    const justCompleted = e => {
      const alreadyCompleted = acc.includes(e.id)
      const allDepsCompleted = e.deps.every(dep => acc.includes(dep))
      return !alreadyCompleted && allDepsCompleted
    }
    const v1 = mesh.filter(justCompleted)
    if (v1.length === 0) return acc
    const v2 = v1.map(e => e.id)
    const v3 = v2.sort()
    const id = R.head(v3)
    const acc2 = acc + id
    return loop(acc2)
  }
  return loop('')
}

const part1 = steps => {
  const mesh = makeMesh(steps)
  const answer = orderMesh(mesh)
  console.log(`part 1 answer: ${answer}`)
}

const orderMeshWithWorkers = (mesh, numWorkers, baseSeconds) => {

  const loop = (acc, seconds, workers) => {

    const isReadyToStart = (acc2, workers2) => e => {
      const findTask = id =>
        workers2.find(w => w.currentTask && w.currentTask.id === id)
      const alreadyCompleted = acc2.includes(e.id)
      const alreadyExecuting = findTask(e.id)
      const allDepsCompleted = e.deps.every(dep => acc2.includes(dep))
      return !alreadyCompleted && !alreadyExecuting && allDepsCompleted
    }

    // TODO: mutates 'completedTasks'
    const tickWorkers = () => {
      const completedTasks = []
      const workers2 = workers.map(worker => {
        const currentTask = worker.currentTask
        if (!currentTask) return worker
        if (currentTask.remainingTime === 1) {
          completedTasks.push(currentTask.id)
          return { currentTask: null }
        }
        return {
          currentTask: {
            ...currentTask,
            remainingTime: currentTask.remainingTime - 1
          }
        }
      })
      return [workers2, completedTasks.join('')]
    }

    const getDuration = id =>
      baseSeconds + (id.charCodeAt(0) - 'A'.charCodeAt(0) + 1)

    // TODO: mutates 'workers'
    const startTasks = (workers, ids) => {
      for (const id of ids) {
        const availableWorker = workers.find(w => !w.currentTask)
        if (!availableWorker) break
        availableWorker.currentTask = {
          id,
          remainingTime: getDuration(id)
        }
      }
    }

    const allWorkersIdle = workers =>
      workers.every(worker => !worker.currentTask)

    const allWorkersBusy = workers =>
      workers.every(worker => !!worker.currentTask)

    const seconds2 = seconds + 1
    const [workers2, completedTasks] = tickWorkers()
    const acc2 = acc + completedTasks

    const readyToStartEntries = mesh.filter(isReadyToStart(acc2, workers2))

    if (readyToStartEntries.length === 0 && allWorkersIdle(workers2)) return B.done(seconds)
    if (readyToStartEntries.length === 0) return B.cont(() => loop(acc2, seconds2, workers2))
    if (allWorkersBusy(workers2)) return B.cont(() => loop(acc2, seconds2, workers2))

    const idsToStart = readyToStartEntries.map(e => e.id)
    const idsToStartSorted = idsToStart.sort()
    startTasks(workers2, idsToStartSorted)
    return B.cont(() => loop(acc2, seconds2, workers2))
  }

  const workers = R.range(0, numWorkers).map(_ => ({ currentTask: null }))
  return B.trampoline(loop('', 0, workers))
}

const part2 = (steps, numWorkers, baseSeconds) => {
  const mesh = makeMesh(steps)
  const answer = orderMeshWithWorkers(mesh, numWorkers, baseSeconds)
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day07/input.txt', 'utf8')
  const lines = buffer.trim().split('\n')
  const steps = parseLines(lines)
  part1(steps)
  part2(steps, 5, 60)
}

main()
