# Market Data Downloader

Allows the download of market data from [Alpaca](https://alpaca.markets/) and [Oanda](https://www.oanda.com) via the CLI.

Find out more about their respective API's here:

- [Alpaca](https://alpaca.markets/docs/api-references/market-data-api/stock-pricing-data/historical/#bars)
- [Oanda](https://developer.oanda.com/rest-live-v20/instrument-ep)

The end result will be a csv document generated in the ./data directory, structured like this:

| t                      | o     | h     | l     | c     | v         | n    | vw               |
| ---------------------- | ----- | ----- | ----- | ----- | --------- | ---- | ---------------- |
| "2021-11-03T05:00:00Z" | 62862 | 63534 | 60050 | 62717 | 1414.4225 | 6871 | 62121.4054675318 |
| "2021-11-04T05:00:00Z" | 62759 | 62763 | 60730 | 62154 | 756.0762  | 4254 | 61564.8690370098 |
| "2021-11-05T05:00:00Z" | 62119 | 62634 | 60777 | 61241 | 626.4683  | 3091 | 61373.168184727  |

[...]

## Getting Started

You'll need valid credentials from Alpaca. Once you have them, create an `.env` file and add the following:

```
# Alpaca
ALPACA_API_KEY=<your-api-key>
ALPACA_API_SECRET=<your-api-secret>

# Oanda
OANDA_SECRET_KEY=<your-secret-key>
```

To use the program, start by compiling the `.js` files:

```
yarn build
```

Then to start:

```
yarn start
```
