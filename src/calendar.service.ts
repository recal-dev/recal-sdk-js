import type { FetchHelper } from './utils/fetch.helper'

export class CalendarService {
    constructor(fetchHelper: FetchHelper) {
        this.fetchHelper = fetchHelper
    }
}
