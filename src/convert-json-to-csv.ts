const { parse } = require('json2csv')
const fs = require('fs')

import { getMarketData as getMarketDataFromAlpaca } from './alpaca/get-market-data'
import { BROKER, INSTRUMENT_TYPE } from './constants'
import { Answers } from './main'
import { getMarketData as getMarketDataFromOanda } from './oanda/get-market-data'

// const fields = ['time', 'open', 'high', 'low', 'close', 'volume', 'trades', 'volume-weighted']
const fields = ['t', 'o', 'h', 'l', 'c', 'v', 'n', 'vw']
const opts = { fields }

export type GetMarketDataParams = Answers

export type MarketData = {
  t: string
  o: number
  h: number
  l: number
  c: number
  v?: number
  n?: number
  vw?: number
}

export async function convertJsonToCsv(marketDataParams: GetMarketDataParams) {
  const data =
    marketDataParams.broker === BROKER.ALPACA
      ? await getMarketDataFromAlpaca(marketDataParams)
      : await getMarketDataFromOanda(marketDataParams)

  // END program execution if no data is returned
  if (!data) return

  try {
    console.info('Parsing data to csv...')
    const csv = parse(data, opts)
    const { instrumentType, timeframe, ticker } = marketDataParams

    const tickerName = instrumentType === INSTRUMENT_TYPE.CRYPTO ? ticker.replace('/', '') : ticker
    // directory to check if exists
    const dir = `./data/${instrumentType}/${tickerName}/${timeframe}`

    // check if directory exists
    if (!fs.existsSync(dir)) {
      console.log('Directory not found. Creating...')

      fs.mkdirSync(dir, { recursive: true })
    }

    fs.appendFile(`${dir}/${data[1]?.t}.csv`, csv, function (err) {
      if (err) throw err
      console.log(`Saved ${ticker} data - ${data[1]?.t}`)
    })
  } catch (err) {
    console.error(err)
  }
}
