// https://docs.bitfinex.com/v2/reference#rest-auth-funding-loans-hist
import queryTypes from 'state/query/constants'
import authTypes from 'state/auth/constants'
import {
  addSymbol,
  baseSymbolState,
  fetchFail,
  fetchNext,
  fetchPrev,
  jumpPage,
  removeSymbol,
  setSymbols,
  setTimeRange,
} from 'state/reducers.helper'

import types from './constants'

const initialState = {
  ...baseSymbolState,
}

const TYPE = queryTypes.MENU_FLOAN

export function fundingLoanHistoryReducer(state = initialState, action) {
  const { type, payload } = action
  switch (type) {
    case types.UPDATE_FLOAN: {
      if (!payload) {
        return {
          ...state,
          dataReceived: true,
        }
      }
      const { res, nextPage } = payload
      const { existingCoins } = state
      const updateCoins = [...existingCoins]
      let smallestMts
      const entries = res.map((entry) => {
        const {
          amount,
          flags,
          hidden,
          id,
          mtsCreate,
          mtsLastPayout,
          mtsOpening,
          mtsUpdate,
          noClose,
          notify,
          period,
          rate,
          rateReal,
          renew,
          side,
          status,
          symbol,
        } = entry
        const currentSymbol = symbol.slice(1)
        // save new symbol to updateCoins list
        if (updateCoins.indexOf(currentSymbol) === -1) {
          updateCoins.push(currentSymbol)
        }
        // log smallest mts
        if (nextPage === false
          && (!smallestMts || smallestMts > mtsUpdate)
        ) {
          smallestMts = mtsUpdate
        }
        return {
          id,
          symbol: currentSymbol,
          side,
          mtsCreate,
          mtsUpdate,
          amount,
          flags,
          status,
          rate,
          period,
          mtsOpening,
          mtsLastPayout,
          notify,
          hidden,
          renew,
          rateReal,
          noClose,
        }
      })
      return {
        ...state,
        currentEntriesSize: entries.length,
        dataReceived: true,
        entries: [...state.entries, ...entries],
        existingCoins: updateCoins.sort(),
        smallestMts: nextPage !== false ? nextPage : smallestMts - 1,
        offset: state.offset + entries.length,
        pageOffset: 0,
        pageLoading: false,
        nextPage,
      }
    }
    case types.FETCH_FAIL:
      return fetchFail(state)
    case types.FETCH_NEXT_FLOAN:
      return fetchNext(TYPE, state, payload)
    case types.FETCH_PREV_FLOAN:
      return fetchPrev(TYPE, state, payload)
    case types.JUMP_FLOAN_PAGE:
      return jumpPage(TYPE, state, payload)
    case types.ADD_SYMBOL:
      return addSymbol(state, payload, initialState)
    case types.REMOVE_SYMBOL:
      return removeSymbol(state, payload, initialState)
    case types.SET_SYMBOLS:
      return setSymbols(state, payload, initialState)
    case types.REFRESH:
    case queryTypes.SET_TIME_RANGE:
      return setTimeRange(TYPE, state, initialState)
    case authTypes.LOGOUT:
      return initialState
    default: {
      return state
    }
  }
}

export default fundingLoanHistoryReducer
