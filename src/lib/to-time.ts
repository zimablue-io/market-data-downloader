const moment = require('moment')

function toRfcTime(date: number) {
  const unix = moment(date).unix()
  return moment.unix(unix).toISOString()
}

function getToTimeBasedOnInstrumentType(endDate: number, instrumentType?: string) {
  // check if end date is in the future
  const to = new Date(endDate).getTime()
  const isDateInFuture = to > new Date().getTime()

  // TODO add logic for instrument type - might need to account if end date is on the weekend

  return isDateInFuture ? new Date().getTime() : endDate
}

export { toRfcTime, getToTimeBasedOnInstrumentType }
