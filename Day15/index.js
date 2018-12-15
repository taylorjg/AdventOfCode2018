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

const findShortestPaths = (walls, units, goal, openSet, closedSet, shortestPaths) => {
  if (openSet.isEmpty()) return shortestPaths
  const currentNode = minBy(Array.from(openSet.values()), x => x.f)
  const openSet2 = openSet.delete(currentNode)
  const closedSet2 = closedSet.add(currentNode)
  let shortestPaths2 = shortestPaths
  if (sameLocations(goal, currentNode.location)) {
    const thisPath = path(currentNode)
    if (shortestPaths.length > 0 && thisPath.length < R.head(shortestPaths).length) {
      throw new Error('This should not happen!')
    }
    if (shortestPaths.length > 0 && thisPath.length > R.head(shortestPaths).length) {
      return shortestPaths
    }
    shortestPaths2 = [...shortestPaths, thisPath]
  }
  const nls = getOpenSquareNeighbourLocations(walls, units, currentNode.location)
  const nns = nls.map(nl => makeNode(nl, goal, currentNode))
  const matchingNode = nn => n => sameLocations(nn.location, n.location)
  const nnsFiltered = nns.filter(nn => !closedSet2.find(matchingNode(nn)))
  const openSet3 = openSet2.union(I.Set(nnsFiltered))
  return findShortestPaths(walls, units, goal, openSet3, closedSet2, shortestPaths2)
}

const findOpenSquaresInRange = (walls, units, targets) =>
  R.chain(target => getOpenSquareNeighbourLocations(walls, units, target), targets)

const findTargets = (units, unit) => units.filter(u => u.type !== unit.type)

const findBestInRange = (startLocation, locations) => {
  const v1 = R.map(location => ({ location, distance: distance(startLocation, location) }), locations)
  const v2 = v1.sort((a, b) => a.distance - b.distance)
  const shortestDistance = v2[0].distance
  const v3 = v2.filter(({ distance }) => distance === shortestDistance)
  const v4 = readingOrder(v3, obj => obj.location)
  return v4[0].location
}

const findBestPath = (walls, units, startLocation, inRange) => {
  const bestGoal = findBestInRange(startLocation, inRange)
  console.log(`bestGoal: ${JSON.stringify(bestGoal)}`)
  const startNode = makeNode(startLocation, bestGoal)
  const v1 = findShortestPaths(walls, units, bestGoal, I.Set.of(startNode), I.Set(), [])
  const v2 = v1.filter(R.identity)
  const v3 = v2.sort((a, b) => a.length - b.length)
  const lengthOfShortestPath = v3[0].length
  const v4 = v3.filter(path => path.length === lengthOfShortestPath)
  const v5 = readingOrder(v4, path => path[0])
  return v5[0]
}

const part1 = async fileName => {
  const buffer = await readFile(fileName, 'utf8')
  const lines = buffer.trim().split('\n')
  const parseResult = parseInput(lines)
  const [walls] = parseResult
  let [, units] = parseResult

  const orderedUnits = readingOrder(units, u => u.location)
  const firstElf = units.find(u => u.type === ELF)
  const targets = findTargets(orderedUnits, firstElf).map(u => u.location)
  const inRange = findOpenSquaresInRange(walls, units, targets)
  const startLocation = firstElf.location
  const bestPath = findBestPath(walls, units, startLocation, inRange)
  console.log(`bestPath: ${JSON.stringify(bestPath)}`)
}

part1('Day15/test4.txt')
