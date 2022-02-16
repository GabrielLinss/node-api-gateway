interface Service {
    name: string
    url: string
}

export interface Config {
    services?: Service[]
}
