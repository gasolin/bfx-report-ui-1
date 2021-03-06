import React, { PureComponent } from 'react'
import { injectIntl, intlShape } from 'react-intl'
import PropTypes from 'prop-types'
import {
  Column,
  Table,
} from '@blueprintjs/table'

class DataTable extends PureComponent {
  render() {
    const {
      intl,
      numRows,
      tableColums,
    } = this.props
    const columnWidths = tableColums.map(column => column.width)

    return (
      <Table
        className='bitfinex-table'
        numRows={numRows}
        enableRowHeader={false}
        columnWidths={columnWidths}
        enableFocusedCell
        getCellClipboardData={(row, col) => navigator.clipboard.writeText(tableColums[col].copyText(row))}
      >
        {tableColums.map(column => (
          <Column
            key={column.id}
            id={column.id}
            name={column.nameStr ? column.nameStr : intl.formatMessage({ id: column.name })}
            cellRenderer={column.renderer}
          />
        ))}
      </Table>
    )
  }
}

const TABLE_COLUMNS_PROPS = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  nameStr: PropTypes.string,
  renderer: PropTypes.func.isRequired,
  copyText: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
})

DataTable.propTypes = {
  intl: intlShape.isRequired,
  numRows: PropTypes.number.isRequired,
  tableColums: PropTypes.arrayOf(TABLE_COLUMNS_PROPS).isRequired,
}

DataTable.defaultProps = {}

export default injectIntl(DataTable)
