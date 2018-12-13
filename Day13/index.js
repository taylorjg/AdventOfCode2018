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
  }
}

const directionAfterTurn = (direction, turn) => {
  switch (turn) {
    case TURN_CYCLE_LEFT:
      return directionAfterCurveLeft(direction)
    case TURN_CYCLE_STRAIGHT:
      return direction
    case TURN_CYCLE_RIGHT:
      return directionAfterCurveRight(direction)
  }
}

const moveCart = (track, { location, direction, turnCycle }) => {
  let location2 = location
  let direction2 = direction
  let turnCycle2 = turnCycle
  switch (direction) {
    case CART_UP:
      location2 = { x: location.x, y: location.y - 1 }
      break
    case CART_DOWN:
      location2 = { x: location.x, y: location.y + 1 }
      break
    case CART_LEFT:
      location2 = { x: location.x - 1, y: location.y }
      break
    case CART_RIGHT:
      location2 = { x: location.x + 1, y: location.y }
      break
  }
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
  }
  return {
    location: location2,
    direction: direction2,
    turnCycle: turnCycle2
  }
}

const tick = track => carts => {
  const orderedCarts = carts.sort((a, b) => {
    const ax = a.location.x
    const ay = a.location.y
    const bx = b.location.x
    const by = b.location.y
    return ay !== by ? ay - by : ax - bx
  })
  const carts2 = []
  orderedCarts.forEach(cart => {
    const cart2 = moveCart(track, cart)
    carts2.push(cart2)
  })
  const groups = R.groupBy(cart => makeKey(cart.location), carts2)
  const collisionGroup = R.values(groups).find(g => g.length > 1)
  const collisionLocation = collisionGroup ? collisionGroup[0].location : null
  if (collisionLocation) {
    console.dir(groups)
  }
  return [carts2, collisionLocation]
}

const part1 = (track, carts) => {
  // console.dir(track)
  // console.dir(carts)
  for (; ;) {
    [carts, collisionLocation] = tick(track)(carts)
    if (collisionLocation) {
      const answer = `${collisionLocation.x},${collisionLocation.y}`
      console.log(`part 1 answer: ${answer}`)
      break
    }
    // console.log()
    // console.dir(carts)
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
