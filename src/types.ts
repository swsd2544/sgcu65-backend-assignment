import { Prisma } from '@prisma/client'

const baseTaskSelect = {
  id: true,
  name: true,
  content: true,
  deadline: true,
  createdAt: true,
}

const baseTeamSelect = {
  id: true,
  name: true,
  createdAt: true,
}

const baseUserSelect = {
  id: true,
  email: true,
  firstname: true,
  lastname: true,
  role: true,
  createdAt: true,
}

export const userSelect = {
  ...baseUserSelect,
  createdTasks: {
    select: baseTaskSelect,
  },
  assignedTasks: {
    select: { task: { select: baseTaskSelect } },
  },
  usersTeams: {
    select: { team: { select: baseTeamSelect } },
  },
}

export const taskSelect = {
  ...baseTaskSelect,
  createdBy: { select: baseUserSelect },
  teamsTasks: {
    select: { team: { select: baseTeamSelect } },
  },
}

export const teamSelect = {
  ...baseTeamSelect,
  teamsTasks: {
    select: { task: { select: baseTaskSelect } },
  },
  usersTeams: {
    select: { user: { select: baseUserSelect } },
  },
}
