const moment = require('moment')

function toRfcTime(timestamp: number, offset?: number) {
  return moment
    .unix(timestamp)
    .add(offset ?? 0, 'days')
    .toISOString()
}

function toUnixTime(date: string) {
  return moment(date).unix()
}

export { toRfcTime, toUnixTime }
