import type { FetchHelper } from './utils/fetch.helper'

export class CalendarService {
    private fetchHelper: FetchHelper

    constructor(fetchHelper: FetchHelper) {
        this.fetchHelper = fetchHelper
    }
}
