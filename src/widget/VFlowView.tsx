import React, { useEffect } from 'react';

import Box from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import {
  LAYERS,
  LogData,
  MIN_TABLE_ROWS,
  VFLOW_TABLE_WIDTH,
  VIRIDIS_COLORS
} from './constants';

const LogEntry = styled('div')`
  width: 80px;
  height: 16px;
  margin-left: 8px;
  font-family: inherit;
  font-size: 8px;
  font-weight: 400;
  border-style: solid;
  border-width: 2px;
  border-radius: 4px;
  border-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

export const VFlowView = (props: any): JSX.Element => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark' ? '-dark' : '';

  const generateTableRow = (logEntry: LogData | undefined): JSX.Element[] => {
    const tableRow: JSX.Element[] = [];
    for (let i = 0; i < LAYERS.length; i++) {
      const tableCell = (
        <TableCell
          key={i}
          sx={{
            backgroundColor: props.layerFilter[i]
              ? 'transparent'
              : 'custom.disabled'
          }}
        >
          {logEntry !== undefined && logEntry.layer === i && (
            <LogEntry
              id={'log' + logEntry.index}
              onClick={() => {
                props.setSelected(logEntry.index);
              }}
              style={{
                backgroundColor: VIRIDIS_COLORS[logEntry.level],
                borderColor:
                  logEntry.index === props.selected ? 'orange' : 'transparent',
                color: logEntry.level === 0 ? 'black' : 'white'
              }}
            >
              {logEntry.event}
            </LogEntry>
          )}
        </TableCell>
      );
      tableRow.push(tableCell);
    }
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
          selected={logEntry !== undefined && logEntry.index === props.selected}
        >
          {generateTableRow(logEntry)}
        </TableRow>
      ));
  };

  useEffect(() => {
    const element = document.getElementById('tnl_vflow_view');
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
        sx={{ width: VFLOW_TABLE_WIDTH + 'px', minHeight: '32px' }}
      >
        <Table className={'jp-webds-tnl-vflow-header'}>
          <TableHead>
            <TableRow>
              {LAYERS.map((layer, index) => (
                <TableCell key={index} component="th" scope="col">
                  <Typography variant="body2">{layer}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
      <div
        id="tnl_vflow_view"
        style={{
          width: VFLOW_TABLE_WIDTH + 24 + 'px',
          overflowY: 'auto'
        }}
      >
        <TableContainer
          component={Box}
          sx={{ width: VFLOW_TABLE_WIDTH + 'px', overflow: 'visible' }}
        >
          <Table className={'jp-webds-tnl-vflow-body' + dark} stickyHeader>
            <TableBody>{generateTableContent()}</TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default VFlowView;
