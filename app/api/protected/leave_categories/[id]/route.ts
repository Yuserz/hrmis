import { NextRequest } from 'next/server'
import { validationErrorNextResponse } from '../../../helpers/response'
import { isEmpty } from 'lodash'
import { editLeaveCategories } from '../../model/leave_categories'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  if (isEmpty(body)) {
    return validationErrorNextResponse()
  }

  if (body.type === 'delete-leave-categories') {
    return editLeaveCategories({ archived_at: body.archivedAt }, id)
  }

  if (body.type === 'edit-leave-categories') {
    return editLeaveCategories({ name: body.name }, id)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const today = new Date()

  if (!id) {
    return validationErrorNextResponse()
  }

  return editLeaveCategories({ archived_at: today }, id)
}
