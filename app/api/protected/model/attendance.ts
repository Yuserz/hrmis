import { createClient } from '@/config'
import { generalErrorResponse, successResponse } from '../../helpers/response'

interface BiometricRecord {
  employee_id: string
  timestamp: string
  type: number
}

export async function processBiometricData(rawData: string) {
  try {
    const supabase = await createClient()
    const lines = rawData
      .trim()
      .split('\n')
      .filter((line) => line.trim())

    const recordsByEmployee: {
      [employeeId: string]: { date: string; scans: BiometricRecord[] }[]
    } = {}

    for (const line of lines) {
      const columns = line.trim().split('\t')
      if (columns.length < 5) {
        console.warn(`Skipping invalid line: ${line}`)
        continue
      }

      const employeeId = columns[0]
      const timestampRaw = columns[1]
      const typeRaw = parseInt(columns[4])

      if (![1, 15].includes(typeRaw)) {
        console.warn(
          `Invalid type ${typeRaw} for employee ${employeeId} at ${timestampRaw}`
        )
        continue
      }

      let timestamp: string
      try {
        const date = new Date(timestampRaw.replace(' ', 'T') + 'Z')
        if (isNaN(date.getTime())) throw new Error('Invalid date')
        timestamp = date.toISOString()
      } catch (e) {
        console.warn(
          `Invalid timestamp ${timestampRaw} for employee ${employeeId} ${e}`
        )
        continue
      }

      if (!recordsByEmployee[employeeId]) {
        recordsByEmployee[employeeId] = []
      }

      const date = timestamp.split('T')[0]

      let dateGroup = recordsByEmployee[employeeId].find(
        (group) => group.date === date
      )
      if (!dateGroup) {
        dateGroup = { date, scans: [] }
        recordsByEmployee[employeeId].push(dateGroup)
      }

      dateGroup.scans.push({
        employee_id: employeeId,
        timestamp,
        type: typeRaw
      })
    }

    const finalRecords: BiometricRecord[] = []
    for (const employeeId in recordsByEmployee) {
      for (const dateGroup of recordsByEmployee[employeeId]) {
        const sortedScans = dateGroup.scans.sort((a, b) =>
          a.timestamp.localeCompare(b.timestamp)
        )

        const deduplicatedScans: BiometricRecord[] = []
        let lastTimestamp: Date | null = null
        for (const scan of sortedScans) {
          const currentTime = new Date(scan.timestamp)
          if (
            lastTimestamp &&
            currentTime.getTime() - lastTimestamp.getTime() < 10000
          ) {
            continue
          }
          deduplicatedScans.push(scan)
          lastTimestamp = currentTime
        }

        deduplicatedScans.forEach((scan) => {
          if (scan.type === 15) {
            finalRecords.push({ ...scan, type: 15 })
          } else {
            finalRecords.push({ ...scan, type: scan.type })
          }
        })
      }
    }

    finalRecords.sort((a, b) => a.employee_id.localeCompare(b.employee_id))

    const batchSize = 100
    for (let i = 0; i < finalRecords.length; i += batchSize) {
      const batch = finalRecords.slice(i, i + batchSize)
      const { error } = await supabase.from('biometrics').insert(batch)

      if (error) {
        return generalErrorResponse({ error: error.message })
      }
    }

    return successResponse({
      message: 'Successfully uploaded data'
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
