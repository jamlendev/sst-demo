import axios, { AxiosInstance } from 'axios'
import * as uuid from "uuid"

export interface ActoraClient {
  customerRegister(payload: CustomerRegistrationPayload): Promise<CustomerResponse>
}

interface CustomerRegistrationPayload {
  forename: string
  surname: string
}
// interface ActoraCustomerResponse {}
interface CustomerResponse {
  externalRef: string
}

export class ActoraApiClient implements ActoraClient {
  private axiosClient: AxiosInstance
  private scheme = {
    abbreviation: 'tfgm-br-demo',
    link: 'tfgm-br-demo'
  }

  static create(): ActoraClient {
    return process.env.ACT_ENDPOINT ? new ActoraApiClient() : new NullActoraClient()
  }

  constructor() {
    this.axiosClient = axios.create({
      baseURL: process.env.ACT_ENDPOINT,
      timeout: 5000,
      // headers: {'X-Custom-Header': 'foobar'}
    });
  }

  async customerRegister(payload: CustomerRegistrationPayload): Promise<CustomerResponse> {
    //http POST https://kqqok88an1.execute-api.eu-west-2.amazonaws.com/v1/customers scheme:='{"abbreviation":"tfgm-br-tp","link": "scheme"}' surname=McTestface forename=Testy status=VALID
    const result = await this.axiosClient.post('/customers', {...payload, status: 'VALID', scheme: this.scheme})
    console.log(result)
    const externalRef = result.headers['location']
    return {
      externalRef
    }
  }

  async customer(id: string): Promise<CustomerResponse> {
    //http POST https://kqqok88an1.execute-api.eu-west-2.amazonaws.com/v1/customers/f5a875f2-b57b-4253-8578-8fa626a8ba42
    const result = await this.axiosClient.get('/customers', {params: {id}})
    console.log(result)
    return result.data
  }

  async cardRequest() {
    //http POST https://kqqok88an1.execute-api.eu-west-2.amazonaws.com/v1/cards scheme:='{"abbreviation":"tfgm-br-tp","link": "scheme"}' cardType=adult cardNumber:='{"ISRN":"UUJXOSGIMJHg8qmO8LhYXZDDKc0"}' status=ACTIVE customer:='{"link":"345c7ce8-3fb5-45f8-a851-75dab6f2bc16"}'
  }

  async ticketPurchase() {
    //http POST https://kqqok88an1.execute-api.eu-west-2.amazonaws.com/v1/tickets scheme:='{"abbreviation":"tfgm-br-t p","link": "scheme"}' status=ACTIVE technology=ITSO reference=dummy card:='{"link":"dg956as7jWn4qZJQr5w3+7jyt2o"}' catalogueItem:='{"link":"adult-anytime-z1-7d"}'
  }
}

class NullActoraClient implements ActoraClient {
  async customerRegister(payload: CustomerRegistrationPayload): Promise<CustomerResponse> {
    return Promise.resolve({
      externalRef: uuid.v4()
    })
  }
}
