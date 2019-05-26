import { notFound } from '../misc/errors'
import {
  CurrentForecast,
  DayForecast,
  HourForecast,
  NumberString,
  RequestParams,
  WeekForecast
} from '../types'
import { DarkSkyBase } from './base'
import { createRequestChain } from './chain'

/**
 * A `class` based wrapper for a `DarkSkyClient`
 *
 * Example usage:
 *
 * ```typescript
 * const darkSky = new DarkSky("api-token")
 *
 * const current = async () => {
 *   const result = await darkSky.currentConditions(42, -42, { units: Units.CA })
 *   // ... Handle result
 * }
 * ```
 *
 * Example chaining usage:
 *
 * ```typescript
 * const darkSky = new DarkSky("api-token")
 *
 * const hourlyForecast = darkSky.chain(42, -42).extendHourly().onlyHourly()
 *
 * async function getHourlyForecast(lat: number, long: number): HourlyDataBlock {
 *   const result = await hourlyForecast.execute()
 *   if (!result.hourly) {
 *     throw Error("Hourly can still be undefined if DarkSky doesn't return it")
 *   }
 *   return result.hourly
 * }
 * ```
 */
export class DarkSky extends DarkSkyBase {
  /**
   * Create a DarkSky request using method chaining.
   *
   * @see createRequestChain
   * @param latitude The latitude of a location (in decimal degrees).
   * @param longitude The longitude of a location (in decimal degrees).
   * @param params Optional query params for the request.
   */
  chain(latitude: NumberString, longitude: NumberString, params?: RequestParams) {
    return createRequestChain(this.token, latitude, longitude, params)
  }

  /**
   *  Gets the current forecast.
   *
   * @param latitude The latitude of a location (in decimal degrees).
   * @param longitude The longitude of a location (in decimal degrees).
   * @param params Optional query params for the request.
   */
  forecast(latitude: number, longitude: number, params?: RequestParams) {
    return this.client.forecast(
      { latitude, longitude },
      { ...this.requestParams, ...(params || {}) }
    )
  }

  /**
   * Gets the current weather conditions.
   *
   * * Note: Will throw an error if DarkSky doesn't return a `currently` data block for the request.
   *
   * @param latitude The latitude of a location (in decimal degrees).
   * @param longitude The longitude of a location (in decimal degrees).
   * @param params Optional query params for the request.
   * @returns Current forecast conditions.
   * @throws HttpException if `Forecast.currently` doesn't exist.
   */
  async current(latitude: number, longitude: number, params?: RequestParams) {
    const result = await this.chain(latitude, longitude, this.requestParams)
      .params(params)
      .onlyCurrently()
      .execute()

    if (!result.currently) throw notFound()

    return result as CurrentForecast
  }

  /**
   * Get the forecast for week.
   *
   * * Note: Will throw an error if DarkSky doesn't return a `daily` data block for the request.
   *
   * @param latitude The latitude of a location (in decimal degrees).
   * @param longitude The longitude of a location (in decimal degrees).
   * @param params Optional query params for the request.
   * @returns Forecast for the week.
   * @throws HttpException if [[Forecast.daily]] doesn't exist.
   */
  async week(latitude: number, longitude: number, params?: RequestParams) {
    const result = await this.chain(latitude, longitude, this.requestParams)
      .params(params)
      .onlyDaily()
      .execute()

    if (!result.daily) throw notFound()

    return result as WeekForecast
  }

  /**
   * Get the forecast for day.
   *
   * * Note: Will throw an error if DarkSky doesn't return a `hourly` data block for the request.
   *
   * @param latitude The latitude of a location (in decimal degrees).
   * @param longitude The longitude of a location (in decimal degrees).
   * @param params Optional query params for the request.
   * @returns Forecast for the day.
   * @throws HttpException if [[Forecast.hourly]] doesn't exist.
   */
  async day(latitude: number, longitude: number, params?: RequestParams) {
    const result = await this.chain(latitude, longitude, this.requestParams)
      .params(params)
      .onlyHourly()
      .execute()

    if (!result.hourly) throw notFound()

    return result as DayForecast
  }

  /**
   * Get the forecast for hour.
   *
   * * Note: Will throw an error if DarkSky doesn't return a `Minutely` data block for the request.
   *
   * @param latitude The latitude of a location (in decimal degrees).
   * @param longitude The longitude of a location (in decimal degrees).
   * @param params Optional query params for the request.
   * @returns Forecast for the hour.
   * @throws HttpException if [[Forecast.Minutely]] doesn't exist.
   */
  async hour(latitude: number, longitude: number, params?: RequestParams) {
    const result = await this.chain(latitude, longitude, this.requestParams)
      .params(params)
      .onlyMinutely()
      .execute()

    if (!result.minutely) throw notFound()

    return result as HourForecast
  }
}