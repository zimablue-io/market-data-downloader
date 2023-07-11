import { INSTRUMENT_TYPE } from '../constants'
import { GetMarketDataParams, MarketData } from '../convert-json-to-csv'
import { toRfcTime, toUnixTime } from '../lib/to-time'

require('dotenv').config()
const axios = require('axios')
const moment = require('moment')

type AlpacaMarketData = {
  t: string
  o: number
  h: number
  l: number
  c: number
  v: number
  n: number
  vw: number
}

function toAlpacaMarketDataEndpoint({
  startDate: selectedDate,
  ticker,
  days,
  timeframe,
  instrumentType,
}: GetMarketDataParams) {
  const timestamp = toUnixTime(selectedDate)
  // TODO extract moment logic to lib
  const shouldOffset = moment.unix(timestamp).isBefore(moment().subtract(days, 'days'))

  const startDate = `start=${toRfcTime(timestamp)}`
  const endDate = shouldOffset ? `&end=${toRfcTime(timestamp, days)}` : ''

  const endpoint = 'https://data.alpaca.markets'

  const cryptoUrl = `${endpoint}/v1beta2/crypto/bars?symbols=${ticker}&timeframe=${timeframe}&${startDate}${endDate}`
  const stocksUrl = `${endpoint}/v2/stocks/${ticker}/bars?${startDate}${endDate}&timeframe=${timeframe}`

  return instrumentType === 'stocks' ? stocksUrl : cryptoUrl
}

export async function getMarketData(marketDataParams: GetMarketDataParams): Promise<MarketData[]> {
  console.log('Getting market data...')

  const url = toAlpacaMarketDataEndpoint(marketDataParams)

  try {
    const response = await axios({
      method: 'GET',
      url,
      headers: {
        'APCA-API-KEY-ID': `${process.env.ALPACA_API_KEY}`,
        'APCA-API-SECRET-KEY': `${process.env.ALPACA_API_SECRET}`,
      },
    })

    // console.info('Got market data.', response.data)

    return marketDataParams.instrumentType === INSTRUMENT_TYPE.STOCKS
      ? response.data?.bars
      : response.data?.bars[marketDataParams.ticker]
  } catch (err) {
    if (err.response?.status === 422) {
      console.log(`\nERROR: ${err.message}`)
      console.log('Try a different input combination, e.g. different startDate and/or days.\n')
    } else {
      console.log(err.message)
    }
  }
}
