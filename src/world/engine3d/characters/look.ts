// What a toy animal looks like: its species, size, colors, clothes and the extras it wears. The chibi rig (animal.ts)
// builds any of them in 3D. Thailand's family are Looks (places/thailand/characters/looks.ts), and so is any country's
// 3D friend. Pure data (no three.js).

export type Species = 'unicorn' | 'panda' | 'elephant' | 'fox' | 'buffalo' | 'penguin' | 'hornbill' | 'puppy' | 'pony' | 'monkey' | 'tortoise' | 'bear' | 'polarbear' | 'tern'
export type Outfit = 'tee' | 'dress' | 'polo' | 'blouse' | 'shirt'
/** What Kaylee can wear on a trip, from her suitcase (or Mommy's spare sun hat if she packed none), or at HarborLand
 *  (the vet's blue scrubs and cap, the cafe's apron and chef's hat, the barber's smock, Muay Thai's boxing gloves and red
 *  headband, the mongkhon): Avatar.wear. */
export type Wearable = 'sunhat' | 'spare-hat' | 'sunglasses' | 'floaties' | 'scrubs' | 'scrub-cap' | 'apron' | 'chef-hat' | 'smock' | 'gloves' | 'mongkhon' | 'ngob'
/** The ones any character can be dressed in (the lab's chips). The rice farm's `ngob` is built by the farm itself and
 *  handed to Avatar.attach, so it isn't here. */
export const WEARABLES: readonly Wearable[] = ['sunhat', 'spare-hat', 'sunglasses', 'floaties', 'scrubs', 'scrub-cap', 'apron', 'chef-hat', 'smock', 'gloves', 'mongkhon']
/** `mailbag`: a postman's satchel on a strap across the chest (Pao, the Nan Mountain Cup). `bun`: a little white bun
 *  of hair on top, with a pink pin (Grandma Taeng). */
export type Extra = 'cane' | 'mailbag' | 'bun' | 'glasses' | 'moustache' | 'cap' | 'officer-cap' | 'round-glasses' | 'scarf' | 'bib' | 'pigtails' | 'tuft' | 'phone' | Exclude<Wearable, 'ngob'>

export interface Look {
  species: Species
  /** Meters, to the top of the head (ears and horns stick up past it). Kaylee is 1.0. */
  height: number
  /** How round the body is (1 = the usual chibi build; Mommy 1.15, Jum 1.25). */
  chub?: number
  /** Main fur, feathers or skin. */
  fur: string
  /** Muzzle, face, belly, paws: the light color. */
  light: string
  /** The second color: hooves, panda patches, penguin back, beak, a tortoise's shell, a bear's nose and paws. */
  dark: string
  /** Inside the ears (a tortoise: the plates on its shell; a penguin: the gold patches beside its face). */
  ear?: string
  /** The head (or the top of it) when it isn't the body's color: an emperor chick's black head over grey fluff, a
   *  tern's black cap. */
  cap?: string
  /** Unicorn (or pony) mane and tail, in order. */
  mane?: string[]
  /** Unicorn mane length: short (Daddy), to the shoulders, or long and flowing (Mommy). */
  hair?: 'short' | 'medium' | 'long'
  outfit?: {
    kind: Outfit
    color: string
    shorts?: string
    /** A scalloped lace collar in this color and a pleated front (Joy's white blouse). */
    lace?: string
    /** Flowers printed all over, in these colors, with green leaves and an open camp collar (Bird's party shirt). */
    print?: string[]
  }
  /** The real person's hair on their animal (Dad's photos, 2026-10-24), so Kaylee knows who's who: a straight cut to the
   *  shoulders parted in the middle (Joy), or short thick hair that sticks up in spikes (Bird). */
  hairdo?: { style: 'bob' | 'spiky'; color: string }
  /** A big smile showing the top teeth (Joy): it stretches when they talk. */
  smile?: 'teeth'
  /** A fox's cheeks as flatter, smaller mounds on the face, this big (Joy 0.8); without it, the usual round fluffy ones. */
  cheeks?: number
  extras?: Extra[]
  /** Lashes on the eyes. */
  lashes?: boolean
  /** A big open happy mouth instead of a small smile. */
  open?: boolean
}

/** What a pot of paint can change on the modelled Kaylee (Rig.paint; her wardrobe, places/thailand/characters/style.ts). */
export type PaintPart = 'dress' | 'hair' | 'fur'
export type PaintColor = 'pink' | 'lilac' | 'mint' | 'sky' | 'butter' | 'peach' | 'brown' | 'cream'
