import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
    this.$use(async (params, next) => {
      if (params.model == 'User' || params.model == 'Task') {
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          // Change to findFirst - you cannot filter
          // by anything except ID / unique with findUnique
          params.action = 'findFirst'
          // Add 'deleted' filter
          // ID filter maintained
          params.args.where['deletedAt'] = null
        }
        if (params.action === 'findMany') {
          // Find many queries
          if (params.args?.where) {
            if (params.args.where.deleted == undefined) {
              // Exclude deleted records if they have not been explicitly requested
              params.args.where['deletedAt'] = null
            }
          } else if (params.args) {
            params.args['where'] = { deletedAt: null }
          } else {
            params.args = { where: { deletedAt: null } }
          }
        }
      }
      return next(params)
    })

    this.$use(async (params, next) => {
      if (params.model == 'User' || params.model == 'Task') {
        if (params.action == 'update') {
          // Change to updateMany - you cannot filter
          // by anything except ID / unique with findUnique
          params.action = 'updateMany'
          // Add 'deleted' filter
          // ID filter maintained
          params.args.where['deletedAt'] = null
        }
        if (params.action == 'updateMany') {
          if (params.args.where != undefined) {
            params.args.where['deletedAt'] = null
          } else {
            params.args['where'] = { deletedAt: null }
          }
        }
      }
      return next(params)
    })

    this.$use(async (params, next) => {
      // Check incoming query type
      if (params.model == 'User' || params.model == 'Task') {
        if (params.action == 'delete') {
          // Delete queries
          // Change action to an update
          params.action = 'update'
          params.args['data'] = { deletedAt: new Date() }
        }
        if (params.action == 'deleteMany') {
          // Delete many queries
          params.action = 'updateMany'
          if (params.args.data != undefined) {
            params.args.data['deletedAt'] = true
          } else {
            params.args['data'] = { deletedAt: new Date() }
          }
        }
      }
      return next(params)
    })
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }
}
