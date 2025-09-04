export function parseTimestamp(timestampRaw: string): string {
  const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s(\d{1,2}):(\d{2})$/
  const match = timestampRaw.match(regex)
  if (!match) {
    throw new Error('Invalid timestamp format')
  }
  const [, month, day, year, hour, minute] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}:00`
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result.map((field) => field.replace(/^"|"$/g, ''))
}
