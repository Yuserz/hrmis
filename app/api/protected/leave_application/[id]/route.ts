import { NextRequest } from 'next/server'
import { validationErrorNextResponse } from '@/app/api/helpers/response'
import { isEmpty } from 'lodash'
import {
  approveDisapproveLeave,
  deleteLeaveRequest,
  editLeaveRequest
} from '../../model/leave_applications'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json()
  const { id: leaveId } = await params

  if (isEmpty(body)) {
    return validationErrorNextResponse()
  }

  if (body.type === 'update-leave-status') {
    return approveDisapproveLeave(body.status, leaveId)
  }

  if (body.type === 'edit-leave-request') {
    return editLeaveRequest(body.data, leaveId)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: leaveId } = await params

  return deleteLeaveRequest(leaveId)
}
