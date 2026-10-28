// What the Thailand map remembers for one opening of the app (it starts fresh when the app reloads): whether a trip
// has packed and ridden the window seat yet (Dad, 2026-10-27: only the first Krabi or Nan trip of a session does; every
// one after goes straight there from the map), and where Bangkok's pin opens the house. No three.js here.
export const tripSession = {
  /** A trip packed and flew this session. */
  kitDone: false,
  /** Where tapping Bangkok opens the house: the tuk-tuk ride the first time, then where she left off. */
  house: 'arrive',
}
