# Trevi Fountain

Route: `#/world/italy/trevi`. Build a downhill water bridge from three arches, release the water, toss three coins, and give Lupa a wishing star. Awards the existing country stamp and an Italian wolf sticker; replay starts fresh. Eight progress steps, no timed or failing interactions, drag and tap alternatives.

The aqueduct is a simplified working model, not a reconstruction of the Aqua Virgo. Real-world facts are optional tap-to-hear extras:
- [Rome tourism: Trevi Fountain and the Virgo aqueduct](https://turismoroma.it/en/places/trevi-fountain)
- [Lazio tourism: fountain coins support charity](https://www.visitlazio.com/en/the-trevi-fountain/)

## Assets

`../../assets/bg-trevi.webp` was generated with the built-in imagegen tool, then converted with `npm run art -- italy`. The final source PNG is in the ignored `art/source/world/italy/bg-trevi.png`. Existing Lupa and Sparkle puppets are reused.

Final image prompt (references: existing `bg-naples-bay.webp` for line style and `app-styling-inspiration-images/style-1.png` for mood; the Italy style-key source is absent from this checkout):

> Create a NEW Trevi Fountain Rome game background in the exact bold brown outline drawing style of reference 1. Reference 2 mood only. STYLE flat vector illustration for a 5-year-old girl's iPad learning app. Bold rounded shapes, FLAT colors no gradients or textures, NO text letters numbers watermark. Kawaii sticker style: warm chocolate brown #6E3B24 visible thick outlines around EVERY architectural shape, rounded felt-tip lines. Cream #FFF7F0 stone, lavender and pink buildings, Mediterranean blue #6EC3E6 water, terracotta #E48A62. Simplify strongly: front view of recognizable Trevi palace with central niche and tiny simplified stone sculptures, four big columns, broad fountain pool centered at 65 percent height. Calm plaza lower quarter. Chubby rounded architecture, sun and outlined white clouds. No people or animals. Landscape 1536x1024 full bleed. Flat fills with at most one flat shadow shape. Clear substantial dark brown linework essential.

## Validation

```sh
node scripts/world-voice-lines.mjs
node scripts/generate-voice.mjs
npm run typecheck
npm run build
npx playwright test --config src/world/places/italy/activities/trevi/playwright.config.ts
```

WebKit tests cover wrong choices/drops, drag and tap alternatives, rotation, the fountain, stamp, and replay at iPad sizes. Port 4197 avoids the standard preview port used by other workspaces. New spoken lines live in Italy's `lines.ts` and generated `voice-lines.json`; recordings require a working `OPENAI_API_KEY`. Automated browser tests cannot check audible lip sync: listen on an iPad before release.
