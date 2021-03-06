import {
  call,
  put,
  select,
  takeLatest,
} from 'redux-saga/effects'

import { makeFetchCall } from 'state/utils'
import { selectAuth } from 'state/auth/selectors'
import { updateErrorStatus } from 'state/status/actions'

import types from './constants'
import actions from './actions'

function getReqWallets(auth, end) {
  const params = end ? { end } : {}
  return makeFetchCall('getWallets', auth, params)
}

function* fetchWallets({ payload: end }) {
  try {
    // save current query time in state for csv export reference
    yield put(actions.setTimestamp(end))

    const auth = yield select(selectAuth)
    const { result = [], error } = yield call(getReqWallets, auth, end)
    yield put(actions.updateWallets(result))

    if (error) {
      yield put(actions.fetchFail({
        id: 'status.fail',
        topic: 'wallets.title',
        detail: JSON.stringify(error),
      }))
    }
  } catch (fail) {
    yield put(actions.fetchFail({
      id: 'status.request.error',
      topic: 'wallets.title',
      detail: JSON.stringify(fail),
    }))
  }
}

function* fetchWalletsFail({ payload }) {
  yield put(updateErrorStatus(payload))
}

export default function* walletsSaga() {
  yield takeLatest(types.FETCH_WALLETS, fetchWallets)
  yield takeLatest(types.FETCH_FAIL, fetchWalletsFail)
}
