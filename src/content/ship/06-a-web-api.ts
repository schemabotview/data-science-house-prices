import type { Section } from '../types'

export const aWebApi: Section = {
  id: 'a-web-api',
  title: "A web API with FastAPI",
  scene: 'ship-api',
  narration:
    "The last step puts the valuation behind a web address, so any app or website can ask for it. FastAPI and the uvicorn server join the project, pinned in their own dependency group. The editor shows the whole service in about twenty lines. House is a pydantic model: it declares each field and its type, and some rules, size must be positive, condition between one and five. FastAPI checks every incoming request against it before any of our code runs, and rejects bad input on its own. Below it, post value receives a checked house, calls the same value function as the command, and returns the price and interval as JSON. If value refuses, the service answers with status four twenty two and the reason. In the terminal, uvicorn starts the server in the background. Then curl sends two requests. A Riverside house of seventeen hundred and ten square feet with three bedrooms comes back as three hundred and sixty one thousand pounds, likely between three hundred and twenty nine and three hundred and ninety five thousand. It is lower than the command's valuation because this request says nothing about garages or build year, so the service assumes no garage. And a house in Harbourside gets a clear four twenty two, with the reason. Then pkill stops the server. Three front doors, a notebook, a command and an API, and one function behind them.",
}
