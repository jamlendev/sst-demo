import { inspect } from 'util'
import axios, { AxiosInstance } from 'axios'
import * as uuid from "uuid"
import { Logger, TLogLevelName } from "tslog"

export interface ActoraClient {
    customerRegister(payload: CustomerRegistrationPayload): Promise<CustomerResponse>
    cardRequest(payload: CardRegistrationPayload): Promise<CustomerResponse>
    getCards(customerLink: string): Promise<Card[]>
    getCardByISRN(payload: { customerRef: string, isrn: string }): Promise<Card | undefined>
    getCardByRef(externalRef: string): Promise<Card | undefined>
    cardAssociation(customerRef: string, isrn: string): Promise<PostResponses>
    ticketRequest(payload: TicketRequest): Promise<TicketRequestResponse>
    getTicket(externalRef: string): Promise<TicketResponse | undefined>
}

interface Card {
    cardDates: {
        EXPIRY: string
        ISSUED: string
    }
    cardNumber: {
        ISRN: string
        MCRN: string
        SERIAL_NUMBER: string
    }
    cardType: string
    customer: CustomerLink
    id: string
    scheme: SchemeLink
    status: CardStatuses
}

interface CustomerLink {
    link: string
    name: string
}

interface SchemeLink {
    abbreviation: string
    link: string
}

enum CardStatuses {
    active = "ACTIVE",
    pending = "PENDING",
}

interface PostRequest {
    customerRef: string
}

type CardRegistrationPayload = PostRequest

interface CustomerRegistrationPayload {
    forename: string
    surname: string
}

interface PostResponses {
    externalRef: string
}

type CustomerResponse = PostResponses

interface TicketRequest extends PostRequest {
    card?: {
        isrn?: string
        requestRef?: string
    }
    code: string
    startDate: string
    endDate: string
}

interface TicketResponse {
    fulfilmentRequest: {
        scheme: SchemeLink
        customer: CustomerLink
        timestamp: string
        externalId: string
        state: {
            name: string
            timestamp: string
        }
        target: {
            isITSO: boolean
            reference: string
            type: string
        }
    }
}

interface TicketRequestResponse extends PostResponses {
    card?: Card
}

const ticketProductMap: Record<string, string> = {
    'adult-1d-anytime-z1': 'catalogues/bb16720d-4389-4fc3-a398-3137b81915ab/products/0/variants/0',
    'adult-7d-anytime-z1': 'catalogues/bb16720d-4389-4fc3-a398-3137b81915ab/products/0/variants/40',
    'adult-1d-anytime-z123': 'catalogues/bb16720d-4389-4fc3-a398-3137b81915ab/products/0/variants/7',
    'adult-1d-offpeak-z1': 'catalogues/bb16720d-4389-4fc3-a398-3137b81915ab/products/1/variants/0',
}

export class ActoraApiClient implements ActoraClient {
    private readonly log: Logger = new Logger({ name: 'ActoraApiClient', displayFunctionName: false, minLevel: process.env.LOG_LEVEL as TLogLevelName || 'debug' })

    private axiosClient: AxiosInstance
    private scheme = {
        abbreviation: 'tfgm-br-demo',
        link: '/schemes/9fadf7a1-912b-45db-94a2-cf281d51a026'
    }

    static async create(): Promise<ActoraClient> {
        const authToken = await this.getClientCredentials()
        return process.env.ACT_ENDPOINT ? new ActoraApiClient(authToken) : new NullActoraClient()
    }

    constructor(authToken: { access_token: string, expires_in: number }) {
        this.axiosClient = axios.create({
            baseURL: process.env.ACT_ENDPOINT,
            timeout: 5000,
            headers: { 'Authorization': `Bearer ${authToken.access_token}` }
        })
        this.axiosClient.interceptors.request.use(request => {
            this.log.info(`${request.method?.toUpperCase()} ${request.url}`, inspect(request.data, { depth: 10 }))
            return request
        })
        this.axiosClient.interceptors.response.use(response => {
            if (response.status === 201)
                this.log.info(`${response.config.method?.toUpperCase()} ${response.config.url}: ${response.status} location: ${response.headers['location']}`)
            else
                this.log.info(`${response.config.method?.toUpperCase()} ${response.config.url}: ${response.status}`, inspect(response.data, { depth: 10 }))
            return response
        })
    }

    static async getClientCredentials(): Promise<{ access_token: string, expires_in: number }> {
        const log = new Logger({ name: 'ActoraApiClient', minLevel: process.env.LOG_LEVEL as TLogLevelName || 'debug' })
        const data = ("grant_type=client_credentials")
        log.debug(`getClientCredentials: ${process.env.ACT_AUTH_ENDPOINT}|${process.env.ACT_CLIENT_ID}`)
        const result = await axios.post(process.env.ACT_AUTH_ENDPOINT || '', data, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "*/*",
            },
            auth: {
                username: process.env.ACT_CLIENT_ID || '',
                password: process.env.ACT_CLIENT_SECRET || '',
            }
        })
        return result.data
    }

    async customerRegister(payload: CustomerRegistrationPayload): Promise<CustomerResponse> {
        //http POST https://kqqok88an1.execute-api.eu-west-2.amazonaws.com/v1/customers scheme:='{"abbreviation":"tfgm-br-tp","link": "scheme"}' surname=McTestface forename=Testy status=VALID
        /*
          http -v --auth-type=jwt --auth=$JWT_AUTH_TOKEN POST https://api.poc1.actora.io/v1/customers status=VALID scheme:='{"abbreviation":"TFGM","link":"/schemes/9fadf7a1-912b-45db-94a2-cf281d51a026"}' forename=Test surname=Test2 addresses:='[{"primary":true,"type":"OTHER","status":"VALID"}]'

          POST /v1/customers
          {
            "status": "VALID",
            "scheme": {
              "abbreviation": "TFGM",
              "link": "/schemes/9fadf7a1-912b-45db-94a2-cf281d51a026"
            },
            "title": "MR",
            "forename": "John",
            "surname": "Smith",
            "addresses": [
              {
                "primary": true,
                "type": "OTHER",
                "status": "VALID",
                "line1": "Langley Gate",
                "line2": "Kington Langley",
                "line3": "Chippenham",
                "postcode": "SN15 5SE"
              }
            ]
          }
          */
        const result = await this.axiosClient.post('/customers', {
            ...payload,
            addresses: [{
                primary: true,
                type: 'OTHER',
                status: 'VALID'
            }],
            status: 'VALID',
            scheme: this.scheme
        })
        const externalRef = result.headers['location'].split('/').pop() as string
        this.log.debug({ externalRef })
        return {
            externalRef
        }
    }

    async customer(id: string): Promise<CustomerResponse> {
        //http POST https://kqqok88an1.execute-api.eu-west-2.amazonaws.com/v1/customers/f5a875f2-b57b-4253-8578-8fa626a8ba42
        const result = await this.axiosClient.get('/customers', { params: { id } })
        this.log.debug(result)
        return result.data
    }

    async cardRequest(payload: CardRegistrationPayload): Promise<CustomerResponse> {
        // http POST /fulfilment-requests scheme:='{"abbreviation":"tfgm-br-tp","link": "scheme"} customer:='{"link":"f5a875f2-b57b-4253-8578-8fa626a8ba42"}' actions:='[{"type": "NEW_CARD", "attributes": {"CardType": "WCTS_DESFIRE"}}]'
        const result = await this.axiosClient.post('/fulfilment-requests', {
            scheme: this.scheme,
            customer: { link: `/customers/${payload.customerRef}` },
            actions: [{
                type: 'NEW_CARD',
                attributes: {
                    CardType: 'GMT_ADULT_DESFIRE'
                }
            }]
        })
        const externalRef = result.headers['location'].split('/').pop() as string
        this.log.debug({ externalRef })
        return {
            externalRef
        }
    }

    async getCards(externalRef: string): Promise<Card[]> {
        // GET /v1/cards?q=customer.link=/customers/<customer-uuid>
        this.log.debug(`getting cards for ${externalRef}`)
        const result = await this.axiosClient.get('/cards', {
            params: {
                q: `customer.link=/customers/${externalRef}`
            }
        })
        // this.log.debug(result.data.cards)
        return result.data.cards
    }

    async getCardByISRN(payload: { customerRef: string, isrn: string }): Promise<Card | undefined> {
        const cards = await this.getCards(payload.customerRef)
        const card = cards.find(x => x.cardNumber.ISRN === payload.isrn)
        return Promise.resolve(card)
    }

    async getCardByRef(externalRef: string): Promise<Card | undefined> {
        const result = await this.axiosClient.get(`/cards/${externalRef}`)
        return Promise.resolve(result.data.card)
    }

    async cardAssociation(customerRef: string, isrn: string): Promise<PostResponses> {
        const result = await this.axiosClient.post('/cards/card-association-request', {
            cardNumber: isrn,
            customerId: customerRef,
        })
        const externalRef = result.headers['location'].split('/').pop() as string
        this.log.debug({ externalRef })
        return {
            externalRef
        }
    }

    async ticketRequest(payload: TicketRequest): Promise<TicketRequestResponse> {
        let card
        const target = { type: '', reference: '' }
        this.log.debug('ticketRequest', payload)

        if (!payload.card?.isrn && !payload.card?.requestRef) {
            //new card
            this.log.debug('new card requested...')
            const cardRef = await this.cardRequest({ customerRef: payload.customerRef })
            // card = await this.getCardByRef(cardRef.externalRef)
            this.log.debug(`new card: ${cardRef.externalRef}`)
            target.type = 'CARD_ISSUANCE'
            target.reference = cardRef.externalRef
        }
        if (payload.card?.isrn) {
            this.log.debug('got card isrn')
            // get list of customer cards
            card = await this.getCardByISRN({ customerRef: payload.customerRef, isrn: payload.card.isrn })
            // if isrn is not in list of customer cards
            // POST card-association-request
            if (!card) {
                const cardRef = await this.cardAssociation(payload.customerRef, payload.card.isrn)
                card = await this.getCardByRef(cardRef.externalRef)
            }
            target.type = 'CUSTOMER_MEDIA'
            target.reference = payload.card.isrn
        }
        if (payload.card?.requestRef) {
            target.type = 'CARD_ISSUANCE'
            target.reference = payload.card.requestRef
            if (!card) {
                card = await this.getCardByRef(payload.card.requestRef)
            }
        }
        const data = {
            actions: [{
                type: 'ADD',
                variantExternalId: ticketProductMap[payload.code],
                attributes: {
                    EXP: `${payload.endDate}T00:00:00Z`
                }
            }],
            customer: { link: `/customers/${payload.customerRef}` },
            distributionDetails: {
                locations: [{ reference: 'location|AllPosts' }],
                windowOfAvailability: { start: `${payload.startDate}T00:00:00Z`, period: 'P5D' }
            },
            scheme: this.scheme,
            target,
        }
        this.log.debug('POST /fulfilment-requests', data)
        const result = await this.axiosClient.post('/fulfilment-requests', data)
        const externalRef = result.headers['location'].split('/').pop() as string
        this.log.debug({ externalRef })
        return {
            externalRef,
            card
        }
    }

    async getTicket(externalRef: string): Promise<TicketResponse> {
        this.log.debug(`getting ticket ${externalRef}`)
        const result = await this.axiosClient.get(`/fulfilment-requests/${externalRef}`)
        this.log.debug(inspect(result.data, { depth: 10 }))
        return result.data
    }
}

class NullActoraClient implements ActoraClient {
    async customerRegister(payload: CustomerRegistrationPayload): Promise<CustomerResponse> {
        return Promise.resolve({
            externalRef: uuid.v4()
        })
    }
    async cardRequest(payload: CardRegistrationPayload): Promise<CustomerResponse> {
        return Promise.resolve({
            externalRef: uuid.v4()
        })
    }
    async getCards(externalRef: string): Promise<Card[]> {
        return Promise.resolve([])
    }

    async getCardByISRN(payload: { customerRef: string, isrn: string }): Promise<Card | undefined> {
        return Promise.resolve(undefined)
    }

    async getCardByRef(externalRef: string): Promise<Card | undefined> {
        return Promise.resolve(undefined)
    }

    async cardAssociation(customerRef: string, isrn: string): Promise<PostResponses> {
        return Promise.resolve({
            externalRef: uuid.v4()
        })
    }

    async ticketRequest(payload: TicketRequest): Promise<TicketRequestResponse> {
        return Promise.resolve({
            externalRef: uuid.v4(),
            card: undefined
        })
    }
    async getTicket(externalRef: string): Promise<TicketResponse | undefined> {
        return Promise.resolve(undefined)
    }
}
