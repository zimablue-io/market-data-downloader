const { parse } = require('json2csv')
const fs = require('fs')

// const fields = ['time', 'open', 'high', 'low', 'close', 'volume', 'trades', 'volume-weighted']
const fields = ['t', 'o', 'h', 'l', 'c', 'v', 'n', 'vw']
const opts = { fields }

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

export async function convertJsonToCsv(marketData: MarketData[], filePath: string) {
  try {
    console.info('Parsing data to csv...')
    const csv = parse(marketData, opts)

    // check if directory exists
    if (!fs.existsSync(filePath)) {
      console.log('Directory not found. Creating...')

      fs.mkdirSync(filePath, { recursive: true })
    }

    fs.appendFile(`${filePath}/${marketData[1]?.t}.csv`, csv, function (err) {
      if (err) throw err
      console.log(`Saved data - ${marketData[1]?.t}`)
    })
  } catch (err) {
    console.error(err)
  }
}
