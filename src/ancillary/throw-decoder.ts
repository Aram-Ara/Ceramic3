import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

function stringify(v: any): string {
  if (typeof v === 'function') {
    return t.getFunctionName(v)
  }
  if (typeof v === 'number' && !isFinite(v)) {
    if (isNaN(v)) {
      return 'NaN'
    }
    return v > 0 ? 'Infinity' : '-Infinity'
  }
  return JSON.stringify(v)
}

function getContextPath(context: t.Context): string {
  return context.map(({ key, type }) => `${key}: ${type.name}`).join('/')
}

function getMessage(e: t.ValidationError): string {
  return e.message !== undefined
    ? e.message
    : `Invalid value ${stringify(e.value)} supplied to ${getContextPath(e.context)}`
}

export class ValidationError extends Error {
  constructor(readonly messages: Array<string>) {
    super(`Validation error: ${messages.join(';')}`)
  }
}

export const ThrowDecoder = {
  decode<A, O, I>(type: t.Type<A, O, I>, input: I): A {
    const validation = type.decode(input)
    if (isLeft(validation)) {
      throw new ValidationError(validation.left.map(getMessage))
    }
    return validation.right
  },
}