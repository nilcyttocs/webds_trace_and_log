import React, { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';

import {
  ALERT_MESSAGE_IDENTIFY,
  ALERT_MESSAGE_RUN_APPLICATION_FW
} from './constants';
import Landing from './Landing';
import { requestAPI, webdsService } from './local_exports';

const getIdentify = async (): Promise<any> => {
  const dataToSend: any = {
    command: 'identify'
  };
  try {
    const response = await requestAPI<any>('command', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject('Failed to get Identify report');
  }
};

const runApplicationFW = async (): Promise<any> => {
  try {
    return await requestAPI<any>('command?query=runApplicationFirmware');
  } catch (error) {
    console.error(
      `Error - GET /webds/command?query=runApplicationFirmware\n${error}`
    );
    return Promise.reject('Failed to run application firmware');
  }
};

export const TraceAndLogComponent = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<string | undefined>(undefined);

  const webdsTheme = webdsService.ui.getWebDSTheme();

  useEffect(() => {
    const initialize = async () => {
      let identify: any;
      try {
        identify = await getIdentify();
      } catch (error) {
        console.error(error);
        setAlert(ALERT_MESSAGE_IDENTIFY);
        return;
      }
      if (identify.mode === 'rombootloader') {
        try {
          await runApplicationFW();
        } catch (error) {
          console.error(error);
          setAlert(ALERT_MESSAGE_RUN_APPLICATION_FW);
          return;
        }
      }
      setInitialized(true);
    };
    initialize();
  }, []);

  return (
    <ThemeProvider theme={webdsTheme}>
      <div className="jp-webds-widget-body">
        {alert !== undefined && (
          <Alert
            severity="error"
            onClose={() => setAlert(undefined)}
            sx={{ whiteSpace: 'pre-wrap' }}
          >
            {alert}
          </Alert>
        )}
        {initialized && <Landing setAlert={setAlert} />}
      </div>
      {!initialized && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <CircularProgress color="primary" />
        </div>
      )}
    </ThemeProvider>
  );
};

export default TraceAndLogComponent;
