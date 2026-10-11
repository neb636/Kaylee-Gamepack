import { defineSections } from '../../../../kit/sections'

/** Venice deep links: #/world/italy/venice/<section>?boat=<kind>&friends=<ids>&mask=<which> (kit/sections.ts). */
export default defineSections('italy', 'venice', {
  params: {
    boat: { default: 'gondola', values: ['gondola', 'swan', 'bathtub', 'pizza'], doc: 'the boat she picked' },
    friends: { default: '', doc: 'comma list of friends in ride order, from lupa,spina,cesare,civetta (default: random)' },
    mask: { default: 'saved', values: ['saved', 'sample', 'plain'], doc: 'the mask Sparkle wears at the finale: her saved one (a sample if none), a sample, or a plain one' },
  },
  sections: [
    { id: 'arrive', name: 'Arrive with Gino (story)' },
    { id: 'pick', name: 'Pick a boat' },
    { id: 'cruise', name: 'Cruise the canal', params: ['boat', 'friends'] },
    { id: 'ride-1', name: 'First friend riding: LEFT or RIGHT', params: ['boat', 'friends'] },
    { id: 'two-friends', name: 'Two friends wave: who goes first?', params: ['boat', 'friends'] },
    { id: 'last-friend', name: 'Last friend: the far ride', params: ['boat', 'friends'] },
    { id: 'trip', name: 'Take Gino to the mask shop', params: ['boat', 'friends'] },
    { id: 'mask', name: 'Paint a mirror mask', params: ['boat', 'friends'] },
    { id: 'finale', name: 'Night: lanterns and fireworks', params: ['boat', 'friends', 'mask'] },
  ],
})
