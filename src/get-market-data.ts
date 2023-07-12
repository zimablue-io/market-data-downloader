import { BROKER, INSTRUMENT_TYPE, TIMEFRAME, timeframeOptions } from './constants'
import { MarketData, convertJsonToCsv } from './convert-json-to-csv'

import { getMarketDataFromAlpaca } from './alpaca/get-market-data'
import { getMarketDataFromOanda } from './oanda/get-market-data'
import { Answers } from './main'
import { getToTimeBasedOnInstrumentType } from './lib/to-time'

export type GetMarketDataParams = {
  startDate: number
  endDate: number
  ticker: string
  timeframe: string
  instrumentType?: string
}

const MINUTE = 1000 * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export async function getMarketData({ broker, startDate, endDate, instrumentType, ticker, timeframe }: Answers) {
  // TODO add recursion based on start and end date
  const marketData: MarketData[] = []

  const fromTime = new Date(startDate).getTime()
  const toTime = new Date(endDate).getTime()

  const difference = toTime - fromTime

  let count = 0
  const amountOfCandles = 3000
  switch (timeframe) {
    case TIMEFRAME.D1:
      count = DAY * amountOfCandles
      break
    case TIMEFRAME.H1:
      count = HOUR * amountOfCandles
      break
    case TIMEFRAME.MIN15:
      count = MINUTE * 15 * amountOfCandles
      break
    case TIMEFRAME.MIN5:
      count = MINUTE * 5 * amountOfCandles
      break
  }

  if (broker === BROKER.OANDA) {
    console.log('Oanda has a limit of 5000 candles per request. Might need to iterate.')
  }

  let remainingTime = difference
  let from = fromTime
  let to = getToTimeBasedOnInstrumentType(toTime, instrumentType)
  let iterationCount = 1
  do {
    console.log(`Iteration ${iterationCount}. Remaining time: ${remainingTime}`)

    to = remainingTime > count ? from + count : from + remainingTime

    // update params
    const marketDataParams: GetMarketDataParams = {
      startDate: from,
      endDate: to,
      ticker,
      // @ts-ignore-next-line: any error
      timeframe: timeframeOptions[timeframe][broker],
    }

    // get market data
    const data =
      broker === BROKER.ALPACA
        ? await getMarketDataFromAlpaca(marketDataParams)
        : await getMarketDataFromOanda(marketDataParams)
    marketData.push(...data)

    // update state
    remainingTime -= count
    from = new Date(marketData[marketData.length - 1].t).getTime()

    iterationCount++
  } while (remainingTime > 0)

  const tickerName = instrumentType === INSTRUMENT_TYPE.CRYPTO ? ticker.replace('/', '') : ticker
  const filePath = `./data/${instrumentType}/${tickerName}/${timeframe}`

  convertJsonToCsv(marketData, filePath)
}
