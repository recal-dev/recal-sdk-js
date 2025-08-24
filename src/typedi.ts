import { Container } from "typedi";

export const getTimeZone = () => Container.get<string>('timezone')
export const setTimeZone = (timezone: string) => Container.set('timezone', timezone)
