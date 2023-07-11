import { GetMarketDataParams, MarketData } from '../convert-json-to-csv'
import { toRfcTime, toUnixTime } from '../lib/to-time'

require('dotenv').config()
const axios = require('axios')

type OandaMarketData = {
  mid: {
    c: string
    h: string
    l: string
    o: string
  }
  complete: boolean
  time: string
  volume: number
}

export async function getMarketData({
  days,
  ticker,
  timeframe,
  startDate: selectedDate,
}: GetMarketDataParams): Promise<MarketData[]> {
  console.log('Getting market data...')

  const dailyAlignment = 'dailyAlignment=0'
  const price = 'price=M'
  const granularity = `granularity=${timeframe}`

  // FIXME - add calculation for count (at the moment in main.js it's just asked for count - instead of days. So input should be ok)
  const count = `count=${days}`

  const timestamp = toUnixTime(selectedDate)
  const from = `from=${toRfcTime(timestamp)}`

  try {
    const response = await axios({
      method: 'GET',
      // TODO set start date
      url: `https://api-fxtrade.oanda.com/v3/instruments/${ticker}/candles?${count}&${granularity}&${price}&${dailyAlignment}&${from}`,
      headers: {
        Authorization: `Bearer ${process.env.OANDA_SECRET_KEY}`,
        'Accept-Datetime-Format': 'RFC3339',
      },
    })

    // console.info('Got market data.', response.data)

    return convertOandaDataToMarketData(response.data.candles)
  } catch (err) {
    console.log(err.message)
    throw err
  }
}

function convertOandaDataToMarketData(data: OandaMarketData[]): MarketData[] {
  return data.map((candle) => {
    return {
      t: candle.time, // TODO - reduce precision to just hh:mm:ss
      o: Number(candle.mid.o),
      h: Number(candle.mid.h),
      l: Number(candle.mid.l),
      c: Number(candle.mid.c),
      v: candle.volume,
    }
  })
}
