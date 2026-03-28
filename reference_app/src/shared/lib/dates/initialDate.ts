const now = new Date()
const currentDate = new Date()
currentDate.setDate(1)

const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
endOfMonth.setHours(23, 59, 59, 999)

export {startOfMonth, endOfMonth}
