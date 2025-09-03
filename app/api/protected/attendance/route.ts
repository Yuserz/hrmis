import { NextRequest } from 'next/server'
import { conflictRequestResponse } from '../../helpers/response'

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  if (formData.get('type') === 'upload-csv') {
    const csvFile = formData.get('file') as File | null

    if (!csvFile) {
      return conflictRequestResponse({ error: 'No CSV File uploaded.' })
    }

    const csvText = await csvFile.text()

    console.info(csvText)
  }

  if (formData.get('type') === 'upload-bat') {
    const batFile = formData.get('file') as File | null

    if (!batFile) {
      return conflictRequestResponse({ error: 'No CSV File uploaded.' })
    }

    const batText = await batFile.text()

    console.info(batText)
  }
}
