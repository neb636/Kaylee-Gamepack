# Voice comparison prototype

Open `index.html` to play three renditions of the same game moment. All clips use the text in `script.txt`.

| Clip | Neural voice | Intended role |
| --- | --- | --- |
| `warm-guide.mp3` | `en-US-AvaMultilingualNeural` | Gentle instructions |
| `bright-buddy.mp3` | `en-US-EmmaMultilingualNeural` | Cheerful encouragement |
| `sparkle-character.mp3` | `en-US-AnaNeural` | Playful Sparkle voice |

These samples were generated with the temporary `edge-tts` utility, which calls Microsoft's online neural voices. This is a sound comparison, not the app's production speech pipeline. For an automated game-building workflow, a supported speech API would render every game line during the build and bundle the audio files with the static site.
