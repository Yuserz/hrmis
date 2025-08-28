export const convertFromAndToDate = (
  startDate: string,
  endDate: string
): number => {
  const fromDate = new Date(startDate as string)
  const toDate = new Date(endDate as string)

  let count = 0
  const currentDate = new Date(fromDate.getTime())

  while (currentDate <= toDate) {
    const dayOfWeek = currentDate.getDay()

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return count
}
