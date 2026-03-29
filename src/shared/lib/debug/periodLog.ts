const TAG = '[FiftyFifty:period]';

/** Verbose period lifecycle logging (rotation, create, archive, races). */
export function periodLog(phase: string, detail?: Record<string, unknown>): void {
  if (detail === undefined) {
    console.log(TAG, phase);
  } else {
    console.log(TAG, phase, JSON.stringify(detail));
  }
}
