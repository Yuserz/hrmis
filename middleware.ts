import { stackMiddlewares } from '@/middlewares/stackMiddlewares'
import { authMiddlware } from './middlewares/auth-middlware/auth-middleware'
import { protectedRoutesMiddlware } from './middlewares/proctedRoutesMiddlware'

const middlewares = [authMiddlware, protectedRoutesMiddlware] // Order matters!

export default stackMiddlewares(middlewares)
