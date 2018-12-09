const I = require('immutable')
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

const makeMesh = steps => {
  const reducer = (map, step) => map
    .update(step.id1, (deps = I.List()) => deps)
    .update(step.id2, (deps = I.List()) => deps.push(step.id1))
  return steps.reduce(reducer, I.Map())
}

const orderMesh = mesh => {
  const loop = acc => {
    const isNewlyCompleted = (deps, id) => {
      const alreadyCompleted = acc.includes(id)
      const allDepsCompleted = deps.every(dep => acc.includes(dep))
      return !alreadyCompleted && allDepsCompleted
    }
    const newlyCompletedSteps = mesh.filter(isNewlyCompleted)
    if (newlyCompletedSteps.size === 0) return acc
    const nextId = newlyCompletedSteps.keySeq().sort().first()
    return loop(acc + nextId)
  }
  return loop('')
}

const part1 = steps => {
  const mesh = makeMesh(steps)
  const answer = orderMesh(mesh)
  console.log(`part 1 answer: ${answer}`)
}

const orderMeshWithWorkers = (mesh, numWorkers, baseDuration) => {

  const findExecutingTask = (workers, id) =>
    workers.find(worker => worker.currentTask && worker.currentTask.id === id)

  const allWorkersIdle = workers =>
    workers.every(worker => !worker.currentTask)

  const allWorkersBusy = workers =>
    workers.every(worker => !!worker.currentTask)

  const isTaskReadyToStart = (acc, workers) => (deps, id) => {
    const alreadyCompleted = acc.includes(id)
    const alreadyExecuting = !!findExecutingTask(workers, id)
    const allDepsCompleted = deps.every(dep => acc.includes(dep))
    return !alreadyCompleted && !alreadyExecuting && allDepsCompleted
  }

  const duration = id =>
    baseDuration + (id.charCodeAt(0) - 'A'.charCodeAt(0) + 1)

  const advanceWorkers = workers => {
    const advanceWorker = worker => ({
      currentTask: {
        id: worker.currentTask.id,
        remainingTime: worker.currentTask.remainingTime - 1
      }
    })
    const reducer = (acc, worker) => {
      const currentTask = worker.currentTask
      if (!currentTask) return { ...acc, workers2: acc.workers2.push(worker) }
      if (currentTask.remainingTime === 1) {
        return {
          workers2: acc.workers2.push(makeIdleWorker()),
          completedTasksIds: acc.completedTasksIds.push(currentTask.id)
        }
      }
      return { ...acc, workers2: acc.workers2.push(advanceWorker(worker)) }
    }
    const init = {
      workers2: I.List(),
      completedTasksIds: I.List()
    }
    return workers.reduce(reducer, init)
  }

  const makeIdleWorker = () => ({
    currentTask: null
  })

  const makeBusyWorker = id => ({
    currentTask: {
      id,
      remainingTime: duration(id)
    }
  })

  const startTasks = (workers, taskIds) => {
    const reducer = (acc, taskId) => {
      const availableWorkerIndex = acc.findIndex(worker => !worker.currentTask)
      return availableWorkerIndex >= 0
        ? acc.set(availableWorkerIndex, makeBusyWorker(taskId))
        : acc
    }
    return taskIds.reduce(reducer, I.List(workers))
  }

  const loop = (acc, seconds, workers) => {
    const { workers2, completedTasksIds } = advanceWorkers(workers)
    const acc2 = acc + completedTasksIds
    const tasksIdsReadyToStart = mesh.filter(isTaskReadyToStart(acc2, workers2)).keySeq()
    if (tasksIdsReadyToStart.size === 0 && allWorkersIdle(workers2)) {
      return seconds
    }
    if (tasksIdsReadyToStart.size === 0 || allWorkersBusy(workers2)) {
      return loop(acc2, seconds + 1, workers2)
    }
    return loop(acc2, seconds + 1, startTasks(workers2, tasksIdsReadyToStart))
  }

  const workers = I.List(R.range(0, numWorkers)).map(makeIdleWorker)
  return loop('', 0, workers)
}

const part2 = (steps, numWorkers, baseSeconds) => {
  const mesh = makeMesh(steps)
  const answer = orderMeshWithWorkers(mesh, numWorkers, baseSeconds)
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day07/input.txt', 'utf8')
  // const buffer = await readFile('Day07/test.txt', 'utf8')
  const lines = buffer.trim().split('\n')
  const steps = parseLines(lines)
  part1(steps)
  part2(steps, 5, 60)
}

main()
