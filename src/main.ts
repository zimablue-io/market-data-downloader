const fuzzy = require('fuzzy')
const inquirer = require('inquirer')
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
inquirer.registerPrompt('date', require('inquirer-date-prompt'))

import { BROKER, INSTRUMENT_TYPE, TIMEFRAME, timeframeOptions } from './constants'
import { getMarketData } from './get-market-data'
import { getTickers } from './get-tickers'

export type Answers = {
  broker: string
  instrumentType: string
  ticker: string
  timeframe: string
  startDate: string
  endDate: string
}

async function searchTickers(answers: Answers, input = '') {
  // console.log('\n')
  const tickers = await getTickers(answers.instrumentType)

  return new Promise(async (resolve) => {
    setTimeout(() => {
      const results = fuzzy.filter(input, tickers).map((el) => el.original)

      results.splice(5, 0, new inquirer.Separator())
      results.push(new inquirer.Separator())
      resolve(results)
    }, Math.random() * 470 + 30)
  })
}

// EXECUTION WITH USER INPUT
inquirer
  .prompt([
    {
      type: 'list',
      default: BROKER.ALPACA,
      name: 'broker',
      message: 'What Broker?',
      choices: [BROKER.ALPACA, BROKER.OANDA],
    },
    // Branch 1: Alpaca
    {
      type: 'list',
      default: INSTRUMENT_TYPE.STOCKS,
      name: 'instrumentType',
      message: 'What instrument type?',
      choices: [INSTRUMENT_TYPE.CRYPTO, INSTRUMENT_TYPE.STOCKS],
      when: (answers: Answers) => answers.broker === BROKER.ALPACA,
    },
    // Branch 2: Oanda
    {
      type: 'list',
      default: INSTRUMENT_TYPE.FOREX,
      name: 'instrumentType',
      message: 'What instrument type?',
      choices: [INSTRUMENT_TYPE.FOREX],
      when: (answers: Answers) => answers.broker === BROKER.OANDA,
    },
    {
      // https://github.com/mokkabonna/inquirer-autocomplete-prompt
      type: 'autocomplete',
      name: 'ticker',
      message: 'What ticker?',
      source: searchTickers,
    },
    {
      type: 'list',
      default: '1Hour',
      name: 'timeframe',
      message: 'What timeframe?',
      choices: [TIMEFRAME.D1, TIMEFRAME.H1, TIMEFRAME.MIN15, TIMEFRAME.MIN5],
    },
    {
      //https://github.com/haversnail/inquirer-date-prompt
      type: 'date',
      name: 'startDate',
      message: 'What start date?',
    },
    {
      //https://github.com/haversnail/inquirer-date-prompt
      type: 'date',
      name: 'endDate',
      message: 'What end date?',
    },
  ])
  .then(async (answers: Answers) => {
    await getMarketData({
      broker: answers.broker,
      instrumentType: answers.instrumentType,
      ticker: answers.ticker.toUpperCase(),
      timeframe: answers.timeframe,
      startDate: answers.startDate,
      endDate: answers.endDate,
    })
  })
