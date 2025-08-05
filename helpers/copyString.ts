export const copyClipBoard = (path: string): void => {
  navigator.clipboard.writeText(path)
}
