const fuzzy = require('fuzzy')
const inquirer = require('inquirer')
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
inquirer.registerPrompt('date', require('inquirer-date-prompt'))

import { BROKER, INSTRUMENT_TYPE } from './constants'
import { convertJsonToCsv } from './convert-json-to-csv'
import { getTickers } from './get-tickers'

export type Answers = {
  broker: string
  instrumentType: string
  ticker: string
  timeframe: string
  startDate: string
  days: number
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
    // Branch 1: Alpaca
    {
      type: 'list',
      default: '1Hour',
      name: 'timeframe',
      message: 'What timeframe?',
      choices: ['1Day', '1Hour', '15Min', '5Min', '1Min'],
      when: (answers: Answers) => answers.broker === BROKER.ALPACA,
    },
    // Branch 2: Oanda
    {
      type: 'list',
      default: 'H1',
      name: 'timeframe',
      message: 'What timeframe?',
      choices: ['D', 'H1', 'M15', 'M5', 'M1'],
      when: (answers: Answers) => answers.broker === BROKER.OANDA,
    },
    {
      //https://github.com/haversnail/inquirer-date-prompt
      type: 'date',
      name: 'startDate',
      message: 'What start date?',
    },
    // TODO improve solution for days params
    // Branch 1: Alpaca - alpaca uses end date instead of count param . Maybe just use calendar like in startDate???
    {
      type: 'number',
      name: 'days',
      default: 365,
      message: 'How many days?',
      when: (answers: Answers) => answers.broker === BROKER.ALPACA,
    },
    // Branch 2: Oanda - oanda uses count param instead of end date
    {
      type: 'number',
      name: 'days',
      default: 500,
      message: 'How many?',
      validate: (input: number) => input > 0 && input < 5000,
      when: (answers: Answers) => answers.broker === BROKER.OANDA,
    },
  ])
  .then(async (answers: Answers) => {
    await convertJsonToCsv({
      broker: answers.broker,
      instrumentType: answers.instrumentType,
      ticker: answers.ticker.toUpperCase(),
      timeframe: answers.timeframe,
      startDate: answers.startDate,
      days: answers.days,
    })
  })
