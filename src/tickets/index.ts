export interface Ticket {
  accountId: string
  ticketId: string
  ticketType: TicketType
  startDate: string
  endDate: string
  cost: number
  createdAt: number
  status: TicketStatus
  cardId: string
}

export enum TicketStatus {
  Requested = 'requested',
  Active = 'active',
  Expired = 'expired',
}


export interface CardInput {
  isrn?: string
  request?: string
  new: boolean
  existing: boolean
}

export interface TicketInput {
  ticketType: string
  startDate: string
  endDate?: string
  card?: CardInput
}

export enum TicketExpiration {
  OneDay = 1,
  SevenDays = 7,
  TwentyEightDays = 28,
  SingleJourney
}

export interface TicketType {
  code: string
  name: string
  description?: string
  cost: number
  expires: TicketExpiration
  appliesTo: TicketMode
  zones: Zones
}

export enum TicketMode {
  Peak = 1 << 0,
  Offpeak = 1 << 1,
  Anytime = ~(~0 << 2)
}

export enum Zones {
  Zone1 = 1 << 0,
  Zone2 = 1 << 1,
  Zone3 = 1 << 2,
  Zone4 = 1 << 3,
  All = ~(~0 << 4)
}

export const ticketTypes: { [code: string]: TicketType } = {
  "adult-7d-anytime-z1": {
    code: "adult-7d-anytime-z1",
    name: "Adult 7-day anytime travelcard Zone 1 only",
    cost: 10.6,
    expires: TicketExpiration.SevenDays,
    appliesTo: TicketMode.Anytime,
    zones: Zones.Zone1,
  },
  "adult-1d-anytime-z1": {
    code: "adult-1d-anytime-z1",
    name: "Adult 1-day anytime travelcard Zone 1 only",
    cost: 2.7,
    expires: TicketExpiration.OneDay,
    appliesTo: TicketMode.Anytime,
    zones: Zones.Zone1,
  },
  "adult-1d-anytime-z123": {
    code: "adult-1d-anytime-z123",
    name: "Adult 1-day anytime travelcard Zones 1, 2 & 3",
    cost: 4.3,
    expires: TicketExpiration.OneDay,
    appliesTo: TicketMode.Anytime,
    zones: Zones.Zone1 | Zones.Zone2 | Zones.Zone3,
  },
  "adult-1d-offpeak-z1": {
    code: "adult-1d-offpeak-z1",
    name: "Adult 1-day offpeak travelcard Zone 1 only",
    cost: 1.7,
    expires: TicketExpiration.OneDay,
    appliesTo: TicketMode.Offpeak,
    zones: Zones.Zone1,
  }
}
