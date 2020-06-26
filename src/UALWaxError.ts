import {UALError, UALErrorType} from 'universal-authenticator-library'

export class UALWaxError extends UALError {
    constructor(message: string, type: UALErrorType, cause: Error | null) {
        super(message, type, cause, "Wax")
    }
}
