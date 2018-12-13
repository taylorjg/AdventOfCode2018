const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const TRACK_VERTICAL = '|'
const TRACK_HORIZONTAL = '-'
const TRACK_CURVE_LEFT = '\\'
const TRACK_CURVE_RIGHT = '/'
const TRACK_INTERSECTION = '+'

const CART_UP = '^'
const CART_DOWN = 'v'
const CART_LEFT = '<'
const CART_RIGHT = '>'

const TURN_CYCLE_LEFT = 0
const TURN_CYCLE_STRAIGHT = 1
const TURN_CYCLE_RIGHT = 2

const makeKey = ({ x, y }) => `${x}-${y}`

const parseInput = lines => {
  const trackKvps = []
  const carts = []
  const maxX = lines[0].length
  const maxY = lines.length
  const xs = R.range(0, maxX)
  const ys = R.range(0, maxY)
  const locations = R.chain(x => R.map(y => ({ x, y }), ys), xs)
  locations.forEach(location => {
    const { x, y } = location
    const ch = lines[y][x]
    switch (ch) {

      case TRACK_VERTICAL:
      case TRACK_HORIZONTAL:
      case TRACK_CURVE_LEFT:
      case TRACK_CURVE_RIGHT:
      case TRACK_INTERSECTION:
        trackKvps.push([makeKey(location), ch])
        break

      case CART_UP:
      case CART_DOWN:
        trackKvps.push([makeKey(location), TRACK_VERTICAL])
        carts.push({ location, direction: ch, turnCycle: TURN_CYCLE_LEFT })
        break

      case CART_LEFT:
      case CART_RIGHT:
        trackKvps.push([makeKey(location), TRACK_HORIZONTAL])
        carts.push({ location, direction: ch, turnCycle: TURN_CYCLE_LEFT })
        break

      case ' ':
        break

      default:
        throw new Error(`Enexpected character, "${ch}".`)
    }
  })
  return [new Map(trackKvps), carts]
}

const directionAfterCurveLeft = direction => {
  switch (direction) {
    case CART_UP:
      return CART_LEFT
    case CART_DOWN:
      return CART_RIGHT
    case CART_LEFT:
      return CART_UP
    case CART_RIGHT:
      return CART_DOWN
    default:
      throw new Error(`Unknown direction, ${direction}.`)
  }
}

const directionAfterCurveRight = direction => {
  switch (direction) {
    case CART_UP:
      return CART_RIGHT
    case CART_DOWN:
      return CART_LEFT
    case CART_LEFT:
      return CART_DOWN
    case CART_RIGHT:
      return CART_UP
    default:
      throw new Error(`Unknown direction, ${direction}.`)
  }
}

const directionAfterLeftTurn = direction => {
  switch (direction) {
    case CART_UP:
      return CART_LEFT
    case CART_DOWN:
      return CART_RIGHT
    case CART_LEFT:
      return CART_DOWN
    case CART_RIGHT:
      return CART_UP
    default:
      throw new Error(`Unknown direction, ${direction}.`)
  }
}

const directionAfterRightTurn = direction => {
  switch (direction) {
    case CART_UP:
      return CART_RIGHT
    case CART_DOWN:
      return CART_LEFT
    case CART_LEFT:
      return CART_UP
    case CART_RIGHT:
      return CART_DOWN
    default:
      throw new Error(`Unknown direction, ${direction}.`)
  }
}

const directionAfterTurn = (direction, turn) => {
  switch (turn) {
    case TURN_CYCLE_LEFT:
      return directionAfterLeftTurn(direction)
    case TURN_CYCLE_STRAIGHT:
      return direction
    case TURN_CYCLE_RIGHT:
      return directionAfterRightTurn(direction)
    default:
      throw new Error(`Unknown turn, ${turn}.`)
  }
}

const locationAfterMove = (location, direction) => {
  switch (direction) {
    case CART_UP:
      return { ...location, y: location.y - 1 }
    case CART_DOWN:
      return { ...location, y: location.y + 1 }
    case CART_LEFT:
      return { ...location, x: location.x - 1 }
    case CART_RIGHT:
      return { ...location, x: location.x + 1 }
    default:
      throw new Error(`Unknown direction, ${direction}.`)
  }
}

const moveCart = (track, { location, direction, turnCycle }) => {
  let location2 = locationAfterMove(location, direction)
  let direction2 = direction
  let turnCycle2 = turnCycle
  const trackType = track.get(makeKey(location2))
  switch (trackType) {
    case TRACK_HORIZONTAL:
    case TRACK_VERTICAL:
      break
    case TRACK_CURVE_LEFT:
      direction2 = directionAfterCurveLeft(direction)
      break
    case TRACK_CURVE_RIGHT:
      direction2 = directionAfterCurveRight(direction)
      break
    case TRACK_INTERSECTION:
      direction2 = directionAfterTurn(direction, turnCycle)
      turnCycle2 = (turnCycle + 1) % 3
      break
    default:
      throw new Error(`Unknown track type, ${trackType}.`)
  }
  return {
    location: location2,
    direction: direction2,
    turnCycle: turnCycle2
  }
}

const tryFindCollision = carts => {
  const groups = R.groupBy(cart => makeKey(cart.location), carts)
  const collidingCarts = R.values(groups).find(carts => carts.length > 1)
  return collidingCarts ? collidingCarts[0].location : null
}

const tick = track => carts => {
  const orderedCarts = carts.sort((a, b) => {
    const ax = a.location.x
    const ay = a.location.y
    const bx = b.location.x
    const by = b.location.y
    return ay !== by ? ay - by : ax - bx
  })
  const carts2 = orderedCarts.slice(0)
  let collisionLocation
  orderedCarts.forEach((cart, index) => {
    if (!collisionLocation) {
      carts2[index] = moveCart(track, cart)
      collisionLocation = tryFindCollision(carts2)
    }
  })
  return [carts2, collisionLocation]
}

const part1 = (track, carts) => {
  for (; ;) {
    [carts, collisionLocation] = tick(track)(carts)
    if (collisionLocation) {
      const answer = `${collisionLocation.x},${collisionLocation.y}`
      console.log(`part 1 answer: ${answer}`)
      return
    }
  }
}

const main = async () => {
  const buffer = await readFile('Day13/input.txt', 'utf8')
  // const buffer = await readFile('Day13/test.txt', 'utf8')
  const lines = buffer.split('\n').filter(R.length)
  const [track, carts] = parseInput(lines)
  part1(track, carts)
}

main()
