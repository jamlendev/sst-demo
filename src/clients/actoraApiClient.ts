import axios, { AxiosInstance } from 'axios'
import * as uuid from "uuid"

export interface ActoraClient {
    customerRegister(payload: CustomerRegistrationPayload): Promise<CustomerResponse>
    cardRequest(payload: CardRegistrationPayload): Promise<CustomerResponse>
    getCards(customerLink: string): Promise<CardResponse[]>
}

interface CardResponse {
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

interface CardRegistrationPayload {
    isrn: string
}
interface CustomerRegistrationPayload {
    forename: string
    surname: string
}
// interface ActoraCustomerResponse {}
interface CustomerResponse {
    externalRef: string | undefined
}

export class ActoraApiClient implements ActoraClient {
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
        // this.axiosClient.interceptors.request.use(async (config: AxiosRequestConfig) => {
        //     if (config.headers['Authorization']) return config
        //     console.log('getting auth token')
        //     const auth = await this.getClientCredentials()
        //     config.headers['Authorization'] = `Bearer ${auth.access_token}`
        //     console.log(`token expires: ${auth.expires_in}`)
        //     return config
        // }, (error) => {
        //     return Promise.reject(error)
        // })
    }

    static async getClientCredentials(): Promise<{ access_token: string, expires_in: number }> {
        const data = ("grant_type=client_credentials")
      console.log(`getClientCredentials: ${process.env.ACT_AUTH_ENDPOINT}|${process.env.ACT_CLIENT_ID}`)
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
        const externalRef = result.headers['location'].split('/').pop()
        console.log({ externalRef })
        return {
            externalRef
        }
    }

    async customer(id: string): Promise<CustomerResponse> {
        //http POST https://kqqok88an1.execute-api.eu-west-2.amazonaws.com/v1/customers/f5a875f2-b57b-4253-8578-8fa626a8ba42
        const result = await this.axiosClient.get('/customers', { params: { id } })
        console.log(result)
        return result.data
    }

    async cardRequest(payload: CardRegistrationPayload): Promise<CustomerResponse> {
        // http POST https://kqqok88an1.execute-api.eu-west-2.amazonaws.com/v1/fulfilment-requests scheme:='{"abbreviation":"tfgm-br-tp","link": "scheme"}' customer:='{"link":"f5a875f2-b57b-4253-8578-8fa626a8ba42"}' actions:='[{"type": "NEW_CARD", "attributes": {"CardType": "WCTS_DESFIRE"}}]'
        return Promise.resolve({
            externalRef: uuid.v4()
        })
    }
  async getCards(externalRef: string): Promise<CardResponse[]> {
    // GET /v1/cards?q=customer.link=/customers/<customer-uuid>
    console.log(`getting cards for ${externalRef}`)
    const result = await this.axiosClient.get<{ cards: CardResponse[] }>('/cards', {
      params: {
        q: `customer.link=/customers/${externalRef}`
      }
    })
    console.log(result.data.cards)
    return result.data.cards
  }

    async ticketPurchase() {
        // http POST https://kqqok88an1.execute-api.eu-west-2.amazonaws.com/v1/fulfilment-requests scheme:='{"abbreviation":"tfgm-br-tp","link": "scheme"}' customer:='{"link":"f5a875f2-b57b-4253-8578-8fa626a8ba42"}' target:='{"type":"CUSTOMER_MEDIA","isITSO":true}'
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
  async getCards(externalRef: string): Promise<CardResponse[]> {
    return Promise.resolve([])
  }
}
