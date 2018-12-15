const I = require('immutable')
const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const WALL = '#'
const ELF = 'E'
const GOBLIN = 'G'
const OPEN_SPACE = '.'

const makeKey = ({ x, y }) => `${x}-${y}`

const parseInput = lines => {
  const wallKeys = []
  const units = []
  const maxX = lines[0].length
  const maxY = lines.length
  const xs = R.range(0, maxX)
  const ys = R.range(0, maxY)
  const locations = R.chain(x => R.map(y => ({ x, y }), ys), xs)
  locations.forEach(location => {
    const { x, y } = location
    const ch = lines[y][x]
    switch (ch) {

      case WALL:
        wallKeys.push(makeKey(location))
        break

      case ELF:
      case GOBLIN:
        units.push({ type: ch, location, hp: 200, ap: 3 })
        break

      case OPEN_SPACE:
        break

      default:
        throw new Error(`Enexpected character, "${ch}".`)
    }
  })
  return [I.Set(wallKeys), units]
}

const readingOrder = (things, fn) =>
  things.sort((t1, t2) => {
    const l1 = fn(t1)
    const l2 = fn(t2)
    return l1.y !== l2.y ? l1.y - l2.y : l1.x - l2.x
  })

const sameLocations = (l1, l2) => l1.x === l2.x && l1.y === l2.y

const distance = (l1, l2) => {
  const dx = l1.x - l2.x
  const dy = l1.y - l2.y
  return Math.hypot(dx, dy)
}

const makeNode = (location, goal, parent) => {
  const g = parent ? parent.g + distance(parent.location, location) : 0
  const h = distance(location, goal)
  const f = g + h
  return { location, parent, g, h, f }
}

const path = node => {
  const pathLocations = []
  for (; ;) {
    node.parent && pathLocations.push(node.location)
    node = node.parent
    if (!node) break
  }
  return pathLocations.reverse()
}

const getNeighbourLocations = l => [
  { x: l.x, y: l.y - 1 },
  { x: l.x, y: l.y + 1 },
  { x: l.x - 1, y: l.y },
  { x: l.x + 1, y: l.y }
]

const getOpenSquareNeighbourLocations = (walls, units, l) =>
  getNeighbourLocations(l)
    .filter(l => !walls.has(makeKey(l)))
    .filter(l => !units.find(u => sameLocations(l, u.location)))

const minBy = (xs, f) => xs.reduce((acc, x) => f(x) < f(acc) ? x : acc)

// (This requires knowing when there is more than one shortest path
//  so that you can consider the first step of each such path.)
// TODO: findShortestPaths
const findShortestPath = (walls, units, goal, openSet, closedSet) => {

  // console.log(`goal: ${JSON.stringify(goal)}`)
  // console.log('openSet:')
  // Array.from(openSet.values()).forEach(n => console.log(JSON.stringify(n.location)))
  // console.log('closedSet:')
  // Array.from(closedSet.values()).forEach(n => console.log(JSON.stringify(n.location)))

  if (openSet.isEmpty()) return
  const currentNode = minBy(Array.from(openSet.values()), x => x.f)
  // console.log(`currentNode: ${JSON.stringify(currentNode)}`)
  const openSet2 = openSet.delete(currentNode)
  const closedSet2 = closedSet.add(currentNode)
  if (sameLocations(goal, currentNode.location)) return currentNode
  const nls = getOpenSquareNeighbourLocations(walls, units, currentNode.location)
  const nns = nls.map(nl => makeNode(nl, goal, currentNode))
  const matchingNode = nn => n => sameLocations(nn.location, n.location)
  const nnsFiltered = nns.filter(nn =>
    !openSet2.find(matchingNode(nn)) &&
    !closedSet2.find(matchingNode(nn)))
  const openSet3 = openSet2.union(I.Set(nnsFiltered))
  return findShortestPath(walls, units, goal, openSet3, closedSet2)
}

const findOpenSquaresInRange = (walls, units, targets) =>
  R.chain(target => getOpenSquareNeighbourLocations(walls, units, target), targets)

const findTargets = (units, unit) => units.filter(u => u.type !== unit.type)

const part1 = async fileName => {
  const buffer = await readFile(fileName, 'utf8')
  const lines = buffer.trim().split('\n')
  const parseResult = parseInput(lines)
  const [walls] = parseResult
  let [, units] = parseResult

  const orderedUnits = readingOrder(units, u => u.location)
  // console.dir(orderedUnits)

  const targets = findTargets(orderedUnits, orderedUnits[0]).map(u => u.location)
  // console.dir(targets)

  const inRange = findOpenSquaresInRange(walls, units, targets)
  // console.dir(inRange)

  // const goal = inRange[0]
  // const startNode = makeNode(orderedUnits[0].location, goal)
  // const shortestPath = findShortestPath(walls, units, goal, I.Set.of(startNode), I.Set())
  // console.dir(path(shortestPath))

  // const startNode2 = makeNode({ x: 5, y: 1 }, goal)
  // const shortestPath2 = findShortestPath(walls, units, goal, I.Set.of(startNode2), I.Set())
  // console.dir(shortestPath2)

  const v1 = inRange.map(goal => {
    const startNode = makeNode(orderedUnits[0].location, goal)
    return findShortestPath(walls, units, goal, I.Set.of(startNode), I.Set())
  })
  const v2 = v1.filter(R.identity)
  v2.forEach(node => console.log(path(node)))
}

part1('Day15/test1.txt')
