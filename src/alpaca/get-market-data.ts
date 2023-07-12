import { INSTRUMENT_TYPE } from '../constants'
import { MarketData } from '../convert-json-to-csv'
import { GetMarketDataParams } from '../get-market-data'
import { toRfcTime } from '../lib/to-time'

require('dotenv').config()
const axios = require('axios')

export async function getMarketDataFromAlpaca(marketDataParams: GetMarketDataParams): Promise<MarketData[]> {
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

function toAlpacaMarketDataEndpoint({ startDate, endDate, ticker, timeframe, instrumentType }: GetMarketDataParams) {
  const endpoint = 'https://data.alpaca.markets'

  const from = `start=${toRfcTime(startDate)}`
  const to = `end=${toRfcTime(endDate)}`

  const granularity = `timeframe=${timeframe}`

  // Alpaca's api endpoints are different for crypto and stocks
  const cryptoUrl = `${endpoint}/v1beta2/crypto/bars?symbols=${ticker}&${granularity}&${from}&${to}`
  const stocksUrl = `${endpoint}/v2/stocks/${ticker}/bars?${from}&${to}&${granularity}`

  return instrumentType === 'stocks' ? stocksUrl : cryptoUrl
}
