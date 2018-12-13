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

const makeKey = ({ x, y }) => `${x}-${y}`

const parseInput = lines => {
  const trackKvps = []
  const cartKvps = []
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
        cartKvps.push([makeKey(location), { direction: ch, turnCycle: 0 }])
        break

      case CART_LEFT:
      case CART_RIGHT:
        trackKvps.push([makeKey(location), TRACK_HORIZONTAL])
        cartKvps.push([makeKey(location), { direction: ch, turnCycle: 0 }])
        break
    }
  })
  return {
    track: new Map(trackKvps),
    carts: new Map(cartKvps)
  }
}

const part1 = (initialState) => {
  console.dir(initialState)
  const answer = 0
  console.log(`part 1 answer: ${answer}`)
}

const main = async () => {
  // const buffer = await readFile('Day13/input.txt', 'utf8')
  const buffer = await readFile('Day13/test.txt', 'utf8')
  const lines = buffer.split('\n').filter(R.length)
  const initialState = parseInput(lines)
  part1(initialState)
}

main()
