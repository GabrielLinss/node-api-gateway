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

const app = express()

app.use(logger('dev'))
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const pathFile = resolve(__dirname, 'config.yml')
const readConfig = readFileSync(pathFile, { encoding: 'utf-8' })
const config: Config = load(readConfig, { json: true })

config.services.forEach(({ name, url }) => {
  app.use(`/${name}`, httpProxy(url, { timeout: 3000 }))
})

const port = 3000

app.listen(port, () => console.log(`Application is runnning on port: ${port}`))
