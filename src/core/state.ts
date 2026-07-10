export type ApplicationState = 'boot' | 'idle' | 'focusing' | 'dataslate'

let currentApplicationState: ApplicationState = 'boot'

export function getApplicationState(): ApplicationState {
  return currentApplicationState
}

export function setApplicationState(nextApplicationState: ApplicationState): void {
  currentApplicationState = nextApplicationState
}
