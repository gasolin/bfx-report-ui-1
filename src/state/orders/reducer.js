// https://docs.bitfinex.com/v2/reference#orders-history
import { formatInternalPair, formatSymbolToPair } from 'state/symbols/utils'
import baseTypes from 'state/base/constants'
import queryTypes from 'state/query/constants'
import authTypes from 'state/auth/constants'
import {
  addPair,
  basePairState,
  fetchFail,
  fetchNext,
  fetchPrev,
  jumpPage,
  removePair,
  setPairs,
  setQueryLimit,
  setTimeRange,
} from 'state/reducers.helper'

import types from './constants'

const initialState = {
  ...basePairState,
}

const TYPE = queryTypes.MENU_ORDERS

export function ordersReducer(state = initialState, action) {
  const { type: actionType, payload } = action
  switch (actionType) {
    case types.UPDATE_ORDERS: {
      if (!payload) {
        return {
          ...state,
          dataReceived: true,
        }
      }
      const { res, nextPage } = payload
      const { existingPairs } = state
      const updatePairs = [...existingPairs]
      let smallestMts
      const entries = res.map((entry) => {
        const {
          amount,
          amountExecuted,
          amountOrig,
          cid,
          flags,
          gid,
          id,
          mtsCreate,
          mtsUpdate,
          notify,
          placedId,
          price,
          priceAvg,
          priceAuxLimit,
          priceTrailing,
          status,
          symbol,
          type,
          typePrev,
        } = entry
        const internalPair = formatInternalPair(symbol)
        // save new pair to updatePairs list
        if (updatePairs.indexOf(internalPair) === -1) {
          updatePairs.push(internalPair)
        }
        // log smallest mts
        if (nextPage === false
          && (!smallestMts || smallestMts > mtsUpdate)
        ) {
          smallestMts = mtsUpdate
        }
        return {
          id,
          gid,
          cid,
          pair: formatSymbolToPair(symbol),
          mtsCreate,
          mtsUpdate,
          amount,
          amountExecuted,
          amountOrig,
          type,
          typePrev,
          flags,
          status,
          price,
          priceAvg,
          priceTrailing,
          priceAuxLimit,
          notify,
          placedId,
        }
      })
      return {
        ...state,
        currentEntriesSize: entries.length,
        dataReceived: true,
        entries: [...state.entries, ...entries],
        existingPairs: updatePairs.sort(),
        smallestMts: nextPage !== false ? nextPage : smallestMts - 1,
        offset: state.offset + entries.length,
        pageOffset: 0,
        pageLoading: false,
        nextPage,
      }
    }
    case types.FETCH_FAIL:
      return fetchFail(state)
    case types.FETCH_NEXT_ORDERS:
      return fetchNext(TYPE, state, payload)
    case types.FETCH_PREV_ORDERS:
      return fetchPrev(TYPE, state, payload)
    case types.JUMP_ORDERS_PAGE:
      return jumpPage(TYPE, state, payload)
    case types.ADD_PAIR:
      return addPair(state, payload, initialState)
    case types.REMOVE_PAIR:
      return removePair(state, payload, initialState)
    case types.SET_PAIRS:
      return setPairs(state, payload, initialState)
    case types.REFRESH:
    case baseTypes.SET_QUERY_LIMIT:
      return setQueryLimit(TYPE, state, initialState)
    case queryTypes.SET_TIME_RANGE:
      return setTimeRange(TYPE, state, initialState)
    case authTypes.LOGOUT:
      return initialState
    default: {
      return state
    }
  }
}

export default ordersReducer
