import { uploadAvatar } from './model/avatar'

export async function POST(req: Request) {
  const body = await req.formData()

  if (body.get('type') === 'upload-avatar') {
    return uploadAvatar(body)
  }
}
