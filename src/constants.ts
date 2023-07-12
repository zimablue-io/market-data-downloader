enum BROKER {
  ALPACA = 'alpaca',
  OANDA = 'oanda',
}

enum INSTRUMENT_TYPE {
  STOCKS = 'stocks',
  CRYPTO = 'crypto',
  FOREX = 'forex',
}

enum TIMEFRAME {
  MIN5 = 'min5',
  MIN15 = 'min15',
  H1 = 'h1',
  D1 = 'd1',
}

const timeframeOptions = {
  min5: {
    alpaca: '5Min',
    oanda: 'M5',
  },
  min15: {
    alpaca: '15Min',
    oanda: 'M15',
  },
  h1: {
    alpaca: '1H',
    oanda: 'H1',
  },
  d1: {
    alpaca: '1D',
    oanda: 'D',
  },
}

export { timeframeOptions, BROKER, INSTRUMENT_TYPE, TIMEFRAME }
