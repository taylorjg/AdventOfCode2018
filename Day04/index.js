const I = require('immutable')
const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const GUARD_BEGINS_SHIFT = 0
const GUARD_FALLS_ASLEEP = 1
const GUARD_WAKES_UP = 2

const makeTimestamp = match =>
  new Date(Date.UTC(
    2018,
    Number(match[1]) - 1,
    Number(match[2]),
    Number(match[3]),
    Number(match[4]))).getTime()

const guardBeginsShift = m => ({
  eventType: GUARD_BEGINS_SHIFT,
  timestamp: makeTimestamp(m),
  id: Number(m[5])
})

const guardFallsAsleep = m => ({
  eventType: GUARD_FALLS_ASLEEP,
  timestamp: makeTimestamp(m),
  minutes: Number(m[4]),
})

const guardGuardWakesUp = m => ({
  eventType: GUARD_WAKES_UP,
  timestamp: makeTimestamp(m),
  minutes: Number(m[4]),
})

const regexTimestamp = /\[1518-([\d]{2})-([\d]{2}) ([\d]{2}):([\d]{2})\]/
const regex1 = new RegExp(regexTimestamp.source + / Guard #(\d+) begins shift/.source)
const regex2 = new RegExp(regexTimestamp.source + / falls asleep/.source)
const regex3 = new RegExp(regexTimestamp.source + / wakes up/.source)

const PARSE_TABLE = [
  [regex1, guardBeginsShift],
  [regex2, guardFallsAsleep],
  [regex3, guardGuardWakesUp]
]

const parseLine = line => {
  for ([r, f] of PARSE_TABLE) {
    const match = r.exec(line)
    if (match) return f(match)
  }
  throw new Error(`Failed to parse line, "${line}".`)
}

const parseLines = lines =>
  lines.map(parseLine)

const addIds = events => {
  const reducer = (acc, e) =>
    e.eventType === GUARD_BEGINS_SHIFT
      ? { ...acc, currentId: e.id }
      : { ...acc, newEvents: acc.newEvents.push({ ...e, id: acc.currentId }) }
  const init = {
    currentId: undefined,
    newEvents: I.List()
  }
  const { newEvents } = R.reduce(reducer, init, events)
  return newEvents.toArray()
}

const totalSleepTime = events => {
  const eventPairs = R.splitEvery(2, events)
  const sleepDurations = eventPairs.map(([fa, wu]) => wu.minutes - fa.minutes)
  return R.sum(sleepDurations)
}

const groupMinutes = events => {
  const eventPairs = R.splitEvery(2, events)
  const minutes = R.chain(([fa, wu]) => R.range(fa.minutes, wu.minutes), eventPairs)
  return R.groupBy(R.identity, minutes)
}

const timestampAsc = (a, b) => a.timestamp - b.timestamp
const listLengthDesc = (xs1, xs2) => xs2.length - xs1.length
const kvpValueNumberDesc = ([, v1], [, v2]) => v2 - v1
const kvpValueListLengthDesc = ([, vs1], [, vs2]) => listLengthDesc(vs1, vs2)

const part1 = groupedEvents => {
  const totals = R.map(totalSleepTime, groupedEvents)
  const kvps = R.toPairs(totals)
  const kvpsSorted = R.sort(kvpValueNumberDesc, kvps)
  const [bestKey] = R.head(kvpsSorted)
  const bestEvents = groupedEvents[bestKey]
  const groupedMinutes = groupMinutes(bestEvents)
  const listsOfSameMinutes = R.values(groupedMinutes)
  const listsOfSameMinutesSortedByDescLength = R.sort(listLengthDesc, listsOfSameMinutes)
  const [bestMinute] = R.head(listsOfSameMinutesSortedByDescLength)
  const bestId = Number(bestKey)
  const answer = bestId * bestMinute
  console.log(`part 1 answer: ${answer}`)
}

const part2 = groupedEvents => {
  const idsToGroupedMinutes = R.map(groupMinutes, groupedEvents)
  const idsToListsOfMinutes = R.map(R.values, idsToGroupedMinutes)
  const idsToListsOfMinutesSortedByDescLength = R.map(R.sort(listLengthDesc), idsToListsOfMinutes)
  const idsToBestListOfMinutes = R.map(R.head, idsToListsOfMinutesSortedByDescLength)
  const kvps = R.toPairs(idsToBestListOfMinutes)
  const kvpsSortedByDescLength = R.sort(kvpValueListLengthDesc, kvps)
  const [id, minutes] = R.head(kvpsSortedByDescLength)
  const minute = R.head(minutes)
  const answer = id * minute
  console.log(`part 2 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day04/input.txt', 'utf8')
  const lines = buffer.split('\n').filter(R.length)
  const rawEvents = parseLines(lines)
  const sortedEvents = rawEvents.sort(timestampAsc)
  const sortedEventsWithIds = addIds(sortedEvents)
  const groupedEvents = R.groupBy(e => e.id, sortedEventsWithIds)
  part1(groupedEvents)
  part2(groupedEvents)
}

main()
