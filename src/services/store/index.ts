import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { user } from '../user'
import { countries } from '../countries'
import { branches } from '../branches'
import { imageService } from '../imageService'
import { roles } from '../role'
import { permissions } from '../permissions'
import { auth } from '../auth'
import { trainer } from '../trainer'
import { employee } from '../employee'
import { generalStaffApi } from '../generalStaff'
import { plans } from '../package'
import { director } from '../director'
import { coupons } from '../coupons'
import { feedbacks } from '../feedbacks'
import { qrCodes } from '../qrCodes'
import { departments } from '../departments'
import { biometricApi } from '../biometric'
import { inventoryApi } from '../inventory'
import { invoiceApi } from '../invoice'
import { uplineApi } from '../upline'
import { membership } from '../membership'
import { leadsApi } from '../leads'
import { usersListApi } from '../usersList'
import { blacklistApi } from '../blacklist'
import { attendanceApi } from '../attendance'
import { assessment } from '../assessment'
import branchReducer from '../branchSlice'
import { classApi } from '../class'
import { sectionApi } from '../section'
import { subjectApi } from '../subject'
import { studentApi } from '../student'
import { parentApi } from '../parent'

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(
    invoiceApi.endpoints.addInvoice.matchFulfilled,
    membership.endpoints.freezeAddon.matchFulfilled,
    membership.endpoints.unfreezeAddon.matchFulfilled,
    membership.endpoints.changeTrainer.matchFulfilled,
  ),
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(user.util.invalidateTags(['UserDetail']));
    listenerApi.dispatch(membership.util.invalidateTags(['Membership']));
  },
});

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [user.reducerPath]: user.reducer,
    [coupons.reducerPath]: coupons.reducer,
    [countries.reducerPath]: countries.reducer,
    [branches.reducerPath]: branches.reducer,
    [imageService.reducerPath]: imageService.reducer,
    [roles.reducerPath]: roles.reducer,
    [permissions.reducerPath]: permissions.reducer,
    [auth.reducerPath]: auth.reducer,
    [trainer.reducerPath]: trainer.reducer,
    [employee.reducerPath]: employee.reducer,
    [generalStaffApi.reducerPath]: generalStaffApi.reducer,
    [plans.reducerPath]: plans.reducer,
    [director.reducerPath]: director.reducer,
    [feedbacks.reducerPath]: feedbacks.reducer,
    [qrCodes.reducerPath]: qrCodes.reducer,
    [departments.reducerPath]: departments.reducer,
    [biometricApi.reducerPath]: biometricApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [uplineApi.reducerPath]: uplineApi.reducer,
    [membership.reducerPath]: membership.reducer,
    [leadsApi.reducerPath]: leadsApi.reducer,
    [usersListApi.reducerPath]: usersListApi.reducer,
    [blacklistApi.reducerPath]: blacklistApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [assessment.reducerPath]: assessment.reducer,
    [classApi.reducerPath]: classApi.reducer,
    [sectionApi.reducerPath]: sectionApi.reducer,
    [subjectApi.reducerPath]: subjectApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [parentApi.reducerPath]: parentApi.reducer,
    branch: branchReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
  .concat(listenerMiddleware.middleware, user.middleware, countries.middleware,
     branches.middleware,
     imageService.middleware,
     roles.middleware,
     permissions.middleware,
     auth.middleware,
     trainer.middleware,
     employee.middleware,
     generalStaffApi.middleware,
    plans.middleware,
    director.middleware,
    coupons.middleware,
    feedbacks.middleware,
    qrCodes.middleware,
    departments.middleware,
    biometricApi.middleware,
    inventoryApi.middleware,
    invoiceApi.middleware,
    uplineApi.middleware,
    membership.middleware,
    leadsApi.middleware,
    usersListApi.middleware,
    blacklistApi.middleware,
    attendanceApi.middleware,
    assessment.middleware,
    classApi.middleware,
    sectionApi.middleware,
    subjectApi.middleware,
    studentApi.middleware,
    parentApi.middleware,
  ),
})

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)