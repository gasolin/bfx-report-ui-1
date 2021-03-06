import React, { Fragment, PureComponent } from 'react'
import { injectIntl } from 'react-intl'
import {
  Button,
  Card,
  Elevation,
  Intent,
  Position,
  Tooltip,
} from '@blueprintjs/core'
import { DateInput, TimePrecision } from '@blueprintjs/datetime'

import ExportButton from 'ui/ExportButton'
import Loading from 'ui/Loading'
import NoData from 'ui/NoData'
import RefreshButton from 'ui/RefreshButton'
import DataTable from 'ui/DataTable'
import queryConstants from 'state/query/constants'
import { DATE_FORMAT } from 'state/utils'
import { isValidTimeStamp } from 'state/query/utils'
import { platform } from 'var/config'

import getColumns from './Wallets.columns'
import { propTypes, defaultProps } from './Wallets.props'

const {
  WALLET_EXCHANGE,
  WALLET_MARGIN,
  WALLET_FUNDING,
} = queryConstants

class Wallets extends PureComponent {
  constructor(props) {
    super(props)
    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleQuery = this.handleQuery.bind(this)
  }

  state = {
    timestamp: null,
  }

  componentDidMount() {
    const { loading, fetchWallets } = this.props
    if (loading) {
      fetchWallets()
    }
  }

  componentDidUpdate(prevProps) {
    const { loading: prevLoading } = prevProps
    const { loading, fetchWallets } = this.props
    const { timestamp } = this.state
    const time = timestamp ? timestamp.getTime() : null
    if (loading && loading !== prevLoading) {
      fetchWallets(time)
    }
  }

  handleDateChange(time) {
    const end = time && time.getTime()
    if (isValidTimeStamp(end) || time === null) {
      this.setState({ timestamp: time })
    }
  }

  handleQuery(e) {
    e.preventDefault()
    const { setTimestamp } = this.props
    const { timestamp } = this.state
    const time = timestamp ? timestamp.getTime() : null
    setTimestamp(time)
  }

  render() {
    const {
      currentTime,
      entries,
      handleClickExport,
      intl,
      loading,
      refresh,
    } = this.props
    const { timestamp } = this.state
    const exchangeData = entries.filter(entry => entry.type === WALLET_EXCHANGE)
    const marginData = entries.filter(entry => entry.type === WALLET_MARGIN)
    const fundingData = entries.filter(entry => entry.type === WALLET_FUNDING)
    const exchangeColums = getColumns({ filteredData: exchangeData })
    const marginColums = getColumns({ filteredData: marginData })
    const fundingColums = getColumns({ filteredData: fundingData })
    const exchangeRows = exchangeData.length
    const marginRows = marginData.length
    const fundingRows = fundingData.length
    const hasNewTime = timestamp && currentTime !== timestamp.getTime()
    const timePrecision = platform.showSyncMode ? TimePrecision.SECOND : undefined

    const renderTimeSelection = (
      <Fragment>
        <Tooltip
          content={(
            <span>
              {intl.formatMessage({ id: 'wallets.query.tooltip' })}
            </span>
          )}
          position={Position.TOP}
          usePortal
        >
          <DateInput
            formatDate={DATE_FORMAT.formatDate}
            parseDate={DATE_FORMAT.parseDate}
            onChange={this.handleDateChange}
            value={timestamp}
            timePrecision={timePrecision}
          />
        </Tooltip>
        <Button
          onClick={this.handleQuery}
          intent={hasNewTime ? Intent.PRIMARY : null}
          disabled={!hasNewTime}
        >
          {intl.formatMessage({ id: 'wallets.query' })}
        </Button>
      </Fragment>
    )
    let showContent
    if (loading) {
      showContent = (
        <Loading title='wallets.title' />
      )
    } else if (exchangeRows === 0 && marginRows === 0 && fundingRows === 0) {
      showContent = (
        <Fragment>
          <h4>
            {intl.formatMessage({ id: 'wallets.title' })}
            &nbsp;
            {renderTimeSelection}
            &nbsp;
            <RefreshButton handleClickRefresh={refresh} />
          </h4>
          <NoData descId='wallets.nodata' />
        </Fragment>
      )
    } else {
      showContent = (
        <Fragment>
          <h4>
            {intl.formatMessage({ id: 'wallets.title' })}
            &nbsp;
            {renderTimeSelection}
            &nbsp;
            <ExportButton handleClickExport={handleClickExport} timestamp={timestamp} />
            &nbsp;
            <RefreshButton handleClickRefresh={refresh} />
          </h4>
          <h4>
            {intl.formatMessage({ id: 'wallets.title.exchange' })}
          </h4>
          <DataTable
            numRows={exchangeRows}
            tableColums={exchangeColums}
          />
          <h4>
            {intl.formatMessage({ id: 'wallets.title.margin' })}
          </h4>
          <DataTable
            numRows={marginRows}
            tableColums={marginColums}
          />
          <h4>
            {intl.formatMessage({ id: 'wallets.title.funding' })}
          </h4>
          <DataTable
            numRows={fundingRows}
            tableColums={fundingColums}
          />
        </Fragment>
      )
    }

    return (
      <Card elevation={Elevation.ZERO} className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
        {showContent}
      </Card>
    )
  }
}

Wallets.propTypes = propTypes
Wallets.defaultProps = defaultProps

export default injectIntl(Wallets)
