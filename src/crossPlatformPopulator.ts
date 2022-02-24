import { Logger, TLogLevelName } from "tslog"

const log = new Logger({ name: 'CrossPlatformPopulator', minLevel: process.env.LOG_LEVEL as TLogLevelName || 'debug' })
export async function handler(event: any) {
  log.debug(JSON.stringify(event, null, 2))
}
