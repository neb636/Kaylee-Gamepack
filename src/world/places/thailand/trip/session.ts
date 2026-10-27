// What the Thailand map remembers for one opening of the app (it starts fresh when the app reloads): whether a trip
// has packed and ridden the window seat yet (Dad, 2026-10-27: only the first Krabi or Nan trip of a session does; every
// one after takes a short flight across the map), and where the toy plane is parked. No three.js here.
export const tripSession = {
  /** A trip packed and flew this session. */
  kitDone: false,
  /** The pin the plane is parked at (bangkok, krabi or nan). */
  plane: 'bangkok',
  /** Where landing at Bangkok opens the house: the tuk-tuk ride the first time, then where she left off. */
  house: 'arrive',
}
