import {
  call,
  put,
  select,
  takeLatest,
} from 'redux-saga/effects'

import { makeFetchCall } from 'state/utils'
import { formatRawSymbols } from 'state/symbols/utils'
import { getQuery, getTimeFrame } from 'state/query/selectors'
import { selectAuth } from 'state/auth/selectors'
import { updateErrorStatus } from 'state/status/actions'
import queryTypes from 'state/query/constants'
import { getQueryLimit } from 'state/query/utils'

import types from './constants'
import actions from './actions'
import { getPublicTrades, getTargetPair } from './selectors'

const TYPE = queryTypes.MENU_PUBLIC_TRADES
const LIMIT = getQueryLimit(TYPE)

function getReqPublicTrades(auth, query, targetPair, smallestMts) {
  const params = getTimeFrame(query, smallestMts)
  params.limit = LIMIT
  if (targetPair) {
    params.symbol = formatRawSymbols(targetPair)
  }
  return makeFetchCall('getPublicTrades', auth, params)
}

function* fetchPublicTrades({ payload: pair }) {
  try {
    const urlPair = pair && pair.toLowerCase()
    let targetPair = yield select(getTargetPair)
    // set pair from url
    if (urlPair && urlPair !== targetPair) {
      yield put(actions.setTargetPair(urlPair))
      targetPair = urlPair
    }
    const auth = yield select(selectAuth)
    const query = yield select(getQuery)
    const { result = [], error } = yield call(getReqPublicTrades, auth, query, targetPair, 0)
    yield put(actions.updatePublicTrades(result))

    if (error) {
      yield put(actions.fetchFail({
        id: 'status.fail',
        topic: 'publictrades.title',
        detail: JSON.stringify(error),
      }))
    }
  } catch (fail) {
    yield put(actions.fetchFail({
      id: 'status.request.error',
      topic: 'publictrades.title',
      detail: JSON.stringify(fail),
    }))
  }
}

function* fetchNextPublicTrades() {
  try {
    const {
      offset,
      entries,
      smallestMts,
      targetPair,
    } = yield select(getPublicTrades)
    // data exist, no need to fetch again
    if (entries.length - LIMIT >= offset) {
      return
    }
    const auth = yield select(selectAuth)
    const query = yield select(getQuery)
    const { result = [], error } = yield call(getReqPublicTrades, auth, query, targetPair, smallestMts)
    yield put(actions.updatePublicTrades(result))

    if (error) {
      yield put(actions.fetchFail({
        id: 'status.fail',
        topic: 'publictrades.title',
        detail: JSON.stringify(error),
      }))
    }
  } catch (fail) {
    yield put(actions.fetchFail({
      id: 'status.request.error',
      topic: 'publictrades.title',
      detail: JSON.stringify(fail),
    }))
  }
}

function* fetchPublicTradesFail({ payload }) {
  yield put(updateErrorStatus(payload))
}

export default function* publicTradesSaga() {
  yield takeLatest(types.FETCH_PUBLIC_TRADES, fetchPublicTrades)
  yield takeLatest(types.FETCH_NEXT_PUBLIC_TRADES, fetchNextPublicTrades)
  yield takeLatest(types.FETCH_FAIL, fetchPublicTradesFail)
}
