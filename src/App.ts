import * as express from 'express'
import * as logger from 'morgan'
import helmet from 'helmet'
import * as httpProxy from 'express-http-proxy'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { load } from 'js-yaml'

interface Service {
    name: string
    url: string
}

interface Config {
    services?: Service[]
}

class App {
    private express: express.Application;

    constructor () {
      this.express = express()

      this.middlewares()
    }

    middlewares () {
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
      const port = 3000

      this.express.listen(port, () => console.log(`Application is runnning on port: ${port}`))
    }
}

export default new App()
