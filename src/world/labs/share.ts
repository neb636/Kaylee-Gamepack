/** Copies a lab's link or its note for an agent. Falls back to a prompt where the clipboard is blocked. */
export async function shareLab(text: string, label: string): Promise<string> {
  try {
    await navigator.clipboard.writeText(text)
    return `${label} copied`
  } catch {
    window.prompt(`Copy ${label.toLowerCase()}:`, text)
    return 'Copy the text from the dialog'
  }
}
