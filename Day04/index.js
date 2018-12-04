const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const GUARD_BEGINS_SHIFT = 0
const GUARD_WAKES_UP = 1
const GUARD_FALLS_ASLEEP = 2

const regex1 = /\[1518-([\d]{2})-([\d]{2}) ([\d]{2}):([\d]{2})\] Guard #(\d+) begins shift/
const regex2 = /\[1518-([\d]{2})-([\d]{2}) ([\d]{2}):([\d]{2})\] wakes up/
const regex3 = /\[1518-([\d]{2})-([\d]{2}) ([\d]{2}):([\d]{2})\] falls asleep/

const makeTimestamp = match =>
  new Date(Date.UTC(
    2018,
    Number(match[1]) - 1,
    Number(match[2]),
    Number(match[3]),
    Number(match[4]))).getTime()

const parseLine = line => {
  const match1 = regex1.exec(line)
  const match2 = regex2.exec(line)
  const match3 = regex3.exec(line)
  if (match1) {
    return {
      event: GUARD_BEGINS_SHIFT,
      timestamp: makeTimestamp(match1),
      id: Number(match1[5])
    }
  }
  if (match2) {
    return {
      event: GUARD_WAKES_UP,
      timestamp: makeTimestamp(match2),
      minutes: Number(match2[4]),
    }
  }
  if (match3) {
    return {
      event: GUARD_FALLS_ASLEEP,
      timestamp: makeTimestamp(match3),
      minutes: Number(match3[4]),
    }
  }
  throw new Error(`Failed to parse line ${line}.`)
}

const parseLines = lines =>
  lines.map(parseLine)

const addIds = data => {
  let id = -1
  data.forEach(d => {
    if (d.event === GUARD_BEGINS_SHIFT)
      id = d.id
    else
      d.id = id
  })
}  

const totalSleepTime = events => {
  const eventPairs = R.splitEvery(2, events)
  const sleepDurations = eventPairs.map(([fa, wu]) => wu.minutes - fa.minutes)
  return R.sum(sleepDurations)
}

const makeMinuteMap = events => {
  const eventPairs = R.splitEvery(2, events)
  const minutes = R.chain(([fa, wu]) => R.range(fa.minutes, wu.minutes), eventPairs)
  return R.groupBy(R.identity, minutes)
}

const part1 = groupedData => {
  const totals = R.map(totalSleepTime, groupedData)
  const kvps = R.toPairs(totals)
  const kvpsSorted = R.sort((a, b) => b[1] - a[1], kvps)
  const bestId = kvpsSorted[0][0]
  const bestEvents = groupedData[bestId]
  const minuteMap = makeMinuteMap(bestEvents)
  const vs1 = R.values(minuteMap)
  const vs2 = R.sort((a, b) => b.length - a.length, vs1)
  const bestMinute = vs2[0][0]
  const answer = Number(bestId) * bestMinute
  console.log(`part 1 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day04/input.txt', 'utf8')
  // const buffer = await readFile('Day04/test.txt', 'utf8')
  const lines = buffer.split('\n').filter(R.length)
  const rawData = parseLines(lines)
  const sortedData = rawData.sort((a, b) => a.timestamp - b.timestamp)
  addIds(sortedData)
  const groupedData = R.groupBy(d => d.id, sortedData.filter(d => d.event != GUARD_BEGINS_SHIFT))
  part1(groupedData)
}

main()
