import React, { useEffect } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { LAYERS, LogData, LOG_LEVELS, MIN_TABLE_ROWS } from './constants';
import { generateSelectedPayload } from './Landing';

const headers = ['Event', 'Layer', 'Level', 'Timestamp', 'Raw Data'];

export const TableView = (props: any): JSX.Element => {
  const theme = useTheme();

  const generateTableRow = (logEntry: LogData | undefined): JSX.Element[] => {
    const tableRow: JSX.Element[] = [
      <TableCell key="0">
        {logEntry !== undefined && (
          <Typography variant="body2">{logEntry.event}</Typography>
        )}
      </TableCell>,
      <TableCell key="1">
        {logEntry !== undefined && (
          <Typography variant="body2">{LAYERS[logEntry.layer]}</Typography>
        )}
      </TableCell>,
      <TableCell key="2">
        {logEntry !== undefined && (
          <Typography variant="body2">{LOG_LEVELS[logEntry.level]}</Typography>
        )}
      </TableCell>,
      <TableCell key="3">
        {logEntry !== undefined && (
          <Typography variant="body2">
            {(logEntry.time / 1000).toFixed(3)}
          </Typography>
        )}
      </TableCell>,
      <TableCell key="4">
        {logEntry !== undefined &&
          (logEntry.index === props.selected ? (
            generateSelectedPayload(logEntry.payload, props.bytesToMatch)
          ) : (
            <Typography variant="body2">{logEntry.payload}</Typography>
          ))}
      </TableCell>
    ];
    return tableRow;
  };

  const generateTableContent = (): JSX.Element[] => {
    const dataSet: LogData[] = props.dataSet;
    const filteredDataSet: (LogData | undefined)[] = dataSet.filter(
      logEntry =>
        props.layerFilter[logEntry.layer] && props.levelFilter[logEntry.level]
    );

    for (let i = filteredDataSet.length; i < MIN_TABLE_ROWS; i++) {
      filteredDataSet.unshift(undefined);
    }

    return filteredDataSet
      .slice()
      .reverse()
      .map((logEntry, index) => (
        <TableRow
          key={index}
          id={logEntry !== undefined ? 'log' + logEntry.index : ''}
          selected={logEntry !== undefined && logEntry.index === props.selected}
          onClick={() => {
            if (logEntry !== undefined) {
              props.setSelected(logEntry.index);
            }
          }}
          sx={{ cursor: logEntry !== undefined ? 'pointer' : 'default' }}
        >
          {generateTableRow(logEntry)}
        </TableRow>
      ));
  };

  useEffect(() => {
    const element = document.getElementById('tnl_table_view');
    if (element) {
      element.scrollTop = props.scrollPosition;
      element.addEventListener(
        'scroll',
        () => props.setScrollPosition(element.scrollTop),
        { passive: true }
      );
    }
  }, []);

  return (
    <>
      <TableContainer
        component={Box}
        sx={{
          minHeight: '32px',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px'
        }}
      >
        <Table
          className={'jp-webds-tnl-table-header'}
          sx={{ tableLayout: 'fixed' }}
        >
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell
                  key={index}
                  component="th"
                  scope="col"
                  sx={{ backgroundColor: theme.palette.primary.main }}
                >
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {header}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
      <TableContainer
        id="tnl_table_view"
        component={Box}
        sx={{ overflow: 'auto' }}
      >
        <Table
          className={'jp-webds-tnl-table-body'}
          stickyHeader
          sx={{ tableLayout: 'fixed' }}
        >
          <TableBody>{generateTableContent()}</TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TableView;
