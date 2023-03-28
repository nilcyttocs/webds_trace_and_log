import React from 'react';

import Typography from '@mui/material/Typography';

import { LAYERS_FULL, LOG_LEVELS } from './constants';
import { generateSelectedPayload } from './Landing';

export const DataView = (props: any): JSX.Element => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {props.selected !== null && (
        <>
          <div>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Event
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {props.dataSet[props.selected].event}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Layer
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {LAYERS_FULL[props.dataSet[props.selected].layer]}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Log Level
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {LOG_LEVELS[props.dataSet[props.selected].level]}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Raw Data
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {generateSelectedPayload(
                props.dataSet[props.selected].payload,
                props.bytesToMatch
              )}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Estimated Timestamp
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {(props.dataSet[props.selected].time / 1000).toFixed(3)}
            </Typography>
          </div>
        </>
      )}
    </div>
  );
};

export default DataView;
