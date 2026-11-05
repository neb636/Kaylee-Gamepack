// The plan viewer. A plan page (planning/**/*.html) holds its whole plan as JSON in <script type="application/json"
// id="plan">, and this script draws it: the hero, a table of contents, and one renderer per block type. The format is
// described in .agents/skills/plan/SKILL.md; `node scripts/plan.mjs check` validates it, `md` prints it as Markdown.
// A plain classic script (no modules, no fetch), so a plan opens straight from disk (file://) as well as from the
// deployed app (<app>/planning/...).
;(function () {
  'use strict'

  var APP = 'https://neb636.github.io/Kaylee-Gamepack/'
  var REPO = 'https://github.com/neb636/Kaylee-Gamepack/'

  // App deep links (#/world/...) open the build this page is served from (main or a PR preview), else the main build.
  function appBase() {
    var href = location.href.split('#')[0]
    var i = href.indexOf('/planning/')
    return /^https?:/.test(href) && i > 0 ? href.slice(0, i + 1) : APP
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
    })
  }

  function url(href) {
    if (href.indexOf('#/') === 0) return appBase() + href
    var pr = /^pr:(\d+)$/.exec(href)
    if (pr) return REPO + 'pull/' + pr[1]
    // Markdown files in the repo (older plans, docs) open on GitHub, which renders them; the deployed app doesn't have them.
    if (/^[^:]+\.md(#.*)?$/.test(href)) {
      var path = new URL(href, location.href).pathname
      var root = location.pathname.slice(0, location.pathname.indexOf('/planning/') + 1)
      if (root && path.indexOf(root) === 0) return REPO + 'blob/main/' + path.slice(root.length) + (href.split('#')[1] ? '#' + href.split('#')[1] : '')
    }
    return href
  }

  function link(href, html) {
    var u = url(href)
    var ext = /^https?:/.test(u) && u.indexOf(location.host || '\u0000') < 0
    return '<a href="' + esc(u) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + html + '</a>'
  }

  // Inline Markdown: `code`, **bold**, *em*, [text](href), and PR #123 becomes a link.
  function inline(s) {
    var out = ''
    var re = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g
    var last = 0
    var m
    s = String(s == null ? '' : s)
    while ((m = re.exec(s))) {
      out += plain(s.slice(last, m.index))
      out += m[1] != null ? '<code>' + esc(m[1]) + '</code>' : link(m[3], inline(m[2]))
      last = re.lastIndex
    }
    return out + plain(s.slice(last))
  }
  function plain(t) {
    return esc(t)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
      .replace(/\bPR #(\d+)/g, function (all, n) {
        return '<a href="' + REPO + 'pull/' + n + '" target="_blank" rel="noopener">PR #' + n + '</a>'
      })
  }

  // Block Markdown: paragraphs split by blank lines; a paragraph of "- " lines (two spaces per level) is a list.
  function md(s) {
    if (s == null) return ''
    return String(s)
      .split(/\n\s*\n/)
      .map(function (para) {
        var lines = para.split('\n')
        if (lines.every(function (l) { return /^\s*- /.test(l) || !l.trim() })) return mdList(lines)
        return '<p>' + inline(lines.join(' ')) + '</p>'
      })
      .join('')
  }
  function mdList(lines) {
    var root = []
    var stack = [{ depth: -1, items: root }]
    lines.forEach(function (l) {
      if (!l.trim()) return
      var depth = l.match(/^\s*/)[0].length >> 1
      var node = { text: l.replace(/^\s*- /, ''), items: [] }
      while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop()
      stack[stack.length - 1].items.push(node)
      stack.push({ depth: depth, items: node.items })
    })
    return list(root)
  }

  // A list: strings, or { text, items } for a nested one.
  function list(items, ordered) {
    if (!items || !items.length) return ''
    var tag = ordered ? 'ol' : 'ul'
    return (
      '<' + tag + '>' +
      items
        .map(function (it) {
          if (typeof it === 'string') return '<li>' + inline(it) + '</li>'
          return '<li>' + inline(it.text) + list(it.items) + '</li>'
        })
        .join('') +
      '</' + tag + '>'
    )
  }

  // Shared body of cards, rungs, build steps and logs: md, then items, then nested blocks.
  function body(x) {
    return md(x.md) + list(x.items) + (x.blocks ? blocks(x.blocks) : '')
  }

  var TONE = { done: 'mint', next: 'pink', doing: 'pink', todo: 'grey', dropped: 'grey', plan: 'lav', open: 'gold' }
  var STATUS_WORD = { done: 'Done', next: 'Next', doing: 'In progress', todo: 'To do', dropped: 'Dropped', plan: 'Planned' }
  function chip(text, tone) {
    return '<span class="chip ' + (tone || '') + '">' + inline(text) + '</span>'
  }
  function tags(x) {
    var t = ''
    if (x.status) t += chip(STATUS_WORD[x.status] || x.status, TONE[x.status])
    if (x.date) t += chip(x.date, 'grey')
    if (x.pr) [].concat(x.pr).forEach(function (n) { t += '<span class="chip">' + link('pr:' + n, 'PR #' + n) + '</span>' })
    if (x.tag) [].concat(x.tag).forEach(function (s) { t += chip(s) })
    return t
  }

  var CALLOUT_ICON = { note: '💡', dad: '🧔', open: '❓', warn: '⚠️', done: '✅' }

  var R = {
    text: function (b) {
      return md(b.md)
    },
    list: function (b) {
      return list(b.items, b.ordered)
    },
    callout: function (b) {
      var tone = b.tone || 'note'
      return (
        '<div class="callout ' + esc(tone) + '"><div class="ic">' + esc(b.icon || CALLOUT_ICON[tone] || '💡') + '</div><div>' +
        (b.title ? '<div class="t">' + inline(b.title) + '</div>' : '') + body(b) + '</div></div>'
      )
    },
    flow: function (b) {
      return (
        '<div class="flow">' +
        b.rows
          .map(function (row) {
            return (
              '<div class="flow-row">' + (row.label ? '<div class="rl">' + inline(row.label) + '</div>' : '') +
              row.steps
                .map(function (s) {
                  return (
                    '<div class="fstep' + (s.hl ? ' hl' : '') + (s.dim ? ' dim' : '') + '">' +
                    (s.icon ? '<div class="ic">' + esc(s.icon) + '</div>' : '') +
                    '<div class="lb">' + inline(s.label) + '</div>' +
                    (s.note ? '<div class="nt">' + inline(s.note) + '</div>' : '') + '</div>'
                  )
                })
                .join('') +
              '</div>'
            )
          })
          .join('') +
        '</div>'
      )
    },
    cards: function (b) {
      return (
        '<div class="grid' + (b.wide ? ' cols-2' : '') + '">' +
        b.items
          .map(function (c) {
            return (
              '<div class="card">' + (c.icon ? '<span class="ic">' + esc(c.icon) + '</span>' : '') +
              (c.title ? '<h4>' + inline(c.title) + tags(c) + '</h4>' : '') + body(c) + '</div>'
            )
          })
          .join('') +
        '</div>'
      )
    },
    ladder: function (b) {
      return (
        '<div class="ladder">' +
        b.items
          .map(function (c, i) {
            return (
              '<div class="rung"><div class="n">' + esc(c.n || i + 1) + '</div><div class="card"><h4>' +
              (c.icon ? esc(c.icon) + ' ' : '') + inline(c.title) + tags(c) + '</h4>' + body(c) + '</div></div>'
            )
          })
          .join('') +
        '</div>'
      )
    },
    table: function (b) {
      return (
        '<div class="tablewrap"><table><thead><tr>' +
        b.head.map(function (h) { return '<th>' + inline(h) + '</th>' }).join('') +
        '</tr></thead><tbody>' +
        b.rows
          .map(function (r, i) {
            var total = b.total && i === b.rows.length - 1
            return '<tr' + (total ? ' class="total"' : '') + '>' + r.map(function (c) { return '<td>' + inline(c) + '</td>' }).join('') + '</tr>'
          })
          .join('') +
        '</tbody></table></div>'
      )
    },
    bars: function (b) {
      var max = b.series.map(function (s) {
        return Math.max.apply(null, b.items.map(function (it) { var v = it[s.key]; return v == null ? 0 : [].concat(v).slice(-1)[0] }))
      })
      return (
        '<div class="bars card"><div class="legend">' +
        b.series.map(function (s, i) { return '<span><i class="s' + i + '"></i>' + inline(s.label) + '</span>' }).join('') +
        '</div>' +
        b.items
          .map(function (it) {
            return (
              '<div class="brow"><div class="bl">' + inline(it.label) + (it.note ? '<small>' + inline(it.note) + '</small>' : '') +
              '</div><div class="btracks">' +
              b.series
                .map(function (s, i) {
                  var v = it[s.key]
                  if (v == null) return '<div class="btrack"></div>'
                  v = [].concat(v)
                  var lo = v.length > 1 ? v[0] : 0
                  var hi = v[v.length - 1]
                  var m = max[i] || 1
                  var txt = (v.length > 1 ? v[0] + '–' + v[1] : v[0]) + (s.unit ? ' ' + s.unit : '')
                  return (
                    '<div class="btrack" title="' + esc(s.label + ': ' + txt) + '"><div class="f s' + i + '" style="left:' + (100 * lo) / m +
                    '%;width:' + (100 * (hi - lo)) / m + '%"></div><div class="v" style="left:' + Math.min(80, (100 * hi) / m) + '%">' +
                    esc(txt) + '</div></div>'
                  )
                })
                .join('') +
              '</div></div>'
            )
          })
          .join('') +
        '</div>'
      )
    },
    sections: function (b) {
      return (
        '<div class="links">' +
        b.items
          .map(function (s, i) {
            // Sections not built yet (todo, plan) or dropped have no page to open.
            var dead = s.status === 'dropped' || s.status === 'todo' || s.status === 'plan'
            var href = (b.base || '') + s.id + (s.query ? '?' + s.query : '')
            var reads = (s.reads || []).map(function (r) { return '<span class="chip grey">' + esc(r) + '</span>' }).join('')
            var inner =
              '<div class="n">' + esc(s.n || i + 1) + '</div><div><div class="nm">' + inline(s.name) + '</div><div class="id"><code>' +
              esc(s.id + (s.query ? '?' + s.query : '')) + '</code>' + reads +
              (dead ? chip(s.status === 'dropped' ? 'dropped' : 'not built yet', 'grey') : '') + '</div></div>' +
              '<div class="go">' + (s.status === 'dropped' ? '✕' : dead ? '…' : '▶') + '</div>'
            return dead
              ? '<div class="slink ' + (s.status === 'dropped' ? 'dropped' : 'later') + '">' + inner + '</div>'
              : '<a class="slink" href="' + esc(url(href)) + '" target="_blank" rel="noopener">' + inner + '</a>'
          })
          .join('') +
        '</div>'
      )
    },
    build: function (b) {
      return (
        '<div class="build">' +
        b.items
          .map(function (s, i) {
            var st = s.status || 'todo'
            var dot = st === 'done' ? '✓' : st === 'dropped' ? '✕' : esc(s.n != null ? s.n : i)
            return (
              '<div class="bstep ' + esc(st) + '"><div class="dot">' + dot + '</div><div class="card"><h4><span class="tt">' +
              inline(s.title) + '</span>' + tags(s) + '</h4>' + (s.md || s.items || s.blocks ? '<div class="body">' + body(s) + '</div>' : '') +
              '</div></div>'
            )
          })
          .join('') +
        '</div>'
      )
    },
    log: function (b) {
      return b.items
        .map(function (e) {
          return (
            '<details class="log"' + (e.open ? ' open' : '') + '><summary><span class="chip ' + (TONE[e.status] || 'grey') + '">' +
            esc(e.date || STATUS_WORD[e.status] || '') + '</span><span class="ttl">' + inline(e.title) + '</span><span class="tw">▸</span>' +
            (e.summary ? '<span class="sum">' + inline(e.summary) + '</span>' : '') + '</summary><div class="inner">' + body(e) + '</div></details>'
          )
        })
        .join('')
    },
    qa: function (b) {
      return (
        '<div class="qa">' +
        b.items
          .map(function (q) {
            var open = !q.a
            return (
              '<div class="q' + (open ? ' open' : '') + '"><div class="qi">' + (open ? '?' : '✓') + '</div><div><div class="qq">' + inline(q.q) +
              '</div>' + (q.a ? '<div class="qa-a">' + md(q.a) + '</div>' : '<div class="qa-a">' + md(q.why || 'Open: Dad decides.') + '</div>') +
              '</div></div>'
            )
          })
          .join('') +
        '</div>'
      )
    },
    chips: function (b) {
      return (
        '<div class="chips">' +
        b.items
          .map(function (c) {
            return '<div class="pchip"><div class="ic">' + esc(c.icon || '•') + '</div><div><b>' + inline(c.label) + '</b>' + inline(c.md || '') + '</div></div>'
          })
          .join('') +
        '</div>'
      )
    },
    code: function (b) {
      return '<pre><code>' + esc(b.text) + '</code></pre>'
    },
    details: function (b) {
      return '<details class="more"' + (b.open ? ' open' : '') + '><summary>' + inline(b.summary) + '</summary>' + body(b) + '</details>'
    },
    image: function (b) {
      return (
        '<figure><img src="' + esc(b.src) + '" alt="' + esc(b.alt || '') + '" loading="lazy">' +
        (b.caption ? '<figcaption>' + inline(b.caption) + '</figcaption>' : '') + '</figure>'
      )
    },
  }

  function blocks(list) {
    return (list || [])
      .map(function (b) {
        var r = R[b.type]
        var html = r ? r(b) : '<div class="bad">Unknown block type "' + esc(b.type) + '"</div>'
        return '<div class="block">' + (b.title && b.type !== 'callout' ? '<h3 class="bh">' + inline(b.title) + '</h3>' : '') + html + '</div>'
      })
      .join('')
  }

  function hero(p) {
    var crumbs = (p.related || []).map(function (r) { return link(r.href, inline(r.label)) }).join('')
    var facts = (p.facts || [])
      .map(function (f) {
        return '<div class="fact"><div class="v">' + (f.icon ? esc(f.icon) + ' ' : '') + inline(f.value) + '</div><div class="l">' + inline(f.label) + '</div></div>'
      })
      .join('')
    var steps = []
    var buildAt = ''
    ;(p.sections || []).forEach(function (s) {
      ;(s.blocks || []).forEach(function (b) {
        if (b.type !== 'build') return
        steps = steps.concat(b.items)
        buildAt = buildAt || s.id
      })
    })
    var progress = ''
    if (steps.length) {
      var live = steps.filter(function (s) { return s.status !== 'dropped' })
      var done = live.filter(function (s) { return s.status === 'done' }).length
      progress =
        '<div class="progress"><div class="bar">' +
        steps.map(function (s) { return '<span class="' + esc(s.status || 'todo') + '" title="' + esc(s.title.replace(/\*\*|`/g, '')) + '"></span>' }).join('') +
        '</div><div class="lbl">' + done + ' of ' + live.length + ' build steps done · ' + '<a href="#' + esc(buildAt) + '">see the build plan</a>' + '</div></div>'
    }
    return (
      '<header class="hero">' + (crumbs ? '<div class="crumbs">' + crumbs + '</div>' : '') +
      '<h1>' + (p.icon ? '<span>' + esc(p.icon) + '</span>' : '') + '<span>' + inline(p.title) + '</span></h1>' +
      '<div class="meta">' + (p.status ? chip(p.status.label, p.status.tone || 'pink') : '') + (p.kind ? chip(p.kind, 'lav') : '') +
      (p.updated ? '<span>Updated ' + esc(p.updated) + '</span>' : '') + '</div>' +
      (p.pitch ? '<p class="pitch">' + inline(p.pitch) + '</p>' : '') +
      (p.next ? '<div class="nextbox"><div class="k">Next</div>' + md(p.next) + '</div>' : '') +
      (facts ? '<div class="facts">' + facts + '</div>' : '') + progress + '</header>'
    )
  }

  function render(p) {
    document.title = p.title.replace(/\*\*|`/g, '')
    var secs = p.sections || []
    var hidden = secs.filter(function (s) { return s.for === 'build' }).length
    var toc = ''
    var group = null
    secs.forEach(function (s) {
      if (s.group && s.group !== group) {
        group = s.group
        toc += '<li class="group' + (s.for === 'build' ? ' build-only' : '') + '">' + esc(group) + '</li>'
      }
      toc +=
        '<li' + (s.for === 'build' ? ' class="build-only"' : '') + '><a href="#' + esc(s.id) + '" data-id="' + esc(s.id) + '"><span class="ic">' +
        esc(s.icon || '•') + '</span><span>' + inline(s.title) + '</span></a></li>'
    })
    var main = secs
      .map(function (s) {
        return (
          '<section class="sec' + (s.for === 'build' ? ' build-only' : '') + '" id="' + esc(s.id) + '"><h2><span class="ic">' + esc(s.icon || '') +
          '</span><span>' + inline(s.title) + '</span>' + (s.for === 'build' ? '<span class="chip grey badge-build">for the builder</span>' : '') +
          '<a class="anchor" href="#' + esc(s.id) + '">#</a></h2>' + (s.lede ? '<p class="lede">' + inline(s.lede) + '</p>' : '') +
          blocks(s.blocks) + '</section>'
        )
      })
      .join('')
    var toolbar =
      '<div class="toolbar"><div class="seg" role="group" aria-label="View"><button data-view="overview">👀 Overview</button>' +
      '<button data-view="all">🔧 Everything</button></div>' +
      '<button class="btn" data-act="open">Open all</button><button class="btn" data-act="close">Close all</button>' +
      (hidden ? '<span class="hidden-note build-only-note">' + hidden + ' builder sections hidden in Overview</span>' : '') + '</div>'
    document.getElementById('app').innerHTML =
      '<div class="layout"><nav class="side"><div class="brand"><a href="' + esc(appBase()) + '" target="_blank" rel="noopener">🦄 Kaylee\'s Gamepack</a> · plans</div>' +
      '<ul class="toc">' + toc + '</ul></nav><main>' + hero(p) + toolbar + main + '</main></div>'
  }

  function setView(v) {
    document.body.classList.toggle('overview', v === 'overview')
    ;[].forEach.call(document.querySelectorAll('[data-view]'), function (b) { b.classList.toggle('on', b.getAttribute('data-view') === v) })
    var note = document.querySelector('.build-only-note')
    if (note) note.style.display = v === 'overview' ? '' : 'none'
    try { localStorage.setItem('plan-view', v) } catch (e) {}
  }

  function wire() {
    var v = 'overview'
    try { v = localStorage.getItem('plan-view') || v } catch (e) {}
    var target = location.hash && document.getElementById(location.hash.slice(1))
    if (target && target.classList.contains('build-only')) v = 'all'
    setView(v)
    if (target) target.scrollIntoView({ behavior: 'instant' })
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-view],[data-act],.toc a')
      if (!t) return
      if (t.hasAttribute('data-view')) setView(t.getAttribute('data-view'))
      var act = t.getAttribute('data-act')
      if (act) [].forEach.call(document.querySelectorAll('details'), function (d) { d.open = act === 'open' })
    })
    // Highlight where she is in the table of contents.
    var links = {}
    ;[].forEach.call(document.querySelectorAll('.toc a'), function (a) { links[a.getAttribute('data-id')] = a })
    if (!('IntersectionObserver' in window)) return
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return
          Object.keys(links).forEach(function (k) { links[k].classList.remove('on') })
          var a = links[en.target.id]
          if (a) {
            a.classList.add('on')
            if (a.scrollIntoView && window.innerWidth <= 900) a.scrollIntoView({ block: 'nearest', inline: 'center' })
          }
        })
      },
      { rootMargin: '-15% 0px -75% 0px' }
    )
    ;[].forEach.call(document.querySelectorAll('section.sec'), function (s) { io.observe(s) })
  }

  var el = document.getElementById('plan')
  try {
    render(JSON.parse(el.textContent))
    wire()
  } catch (err) {
    document.getElementById('app').innerHTML = '<div class="bad">This plan could not be drawn: ' + esc(err.message) + '. Run <b>node scripts/plan.mjs check</b>.</div>'
    throw err
  }
})()
