import express, { Application } from 'express'
import logger from 'morgan'
import helmet from 'helmet'
import httpProxy from 'express-http-proxy'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { load } from 'js-yaml'
import { Config } from './contracts'

class App {
    private express: Application;

    constructor () {
      this.express = express()

      this.applyMiddlewares()
    }

    private applyMiddlewares () {
      this.express.use(logger('dev'))
      this.express.use(helmet())
      this.express.use(express.json())
      this.express.use(express.urlencoded({ extended: true }))

      const pathFile = resolve(__dirname, 'config.yml')
      const readConfig = readFileSync(pathFile, { encoding: 'utf-8' })
      const config: Config = load(readConfig, { json: true })

      config.services.forEach(({ name, url }) => {
        this.express.use(`/${name}`, httpProxy(url, { timeout: 3000 }))
      })
    }

    run () {
      const port = process.env.PORT || 3000

      this.express.listen(port, () => console.log(`Application is runnning on port: ${port}`))
    }
}

export default new App()
