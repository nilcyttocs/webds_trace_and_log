import React, { useEffect, useRef, useState } from 'react';

import DoneIcon from '@mui/icons-material/Done';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import SearchIcon from '@mui/icons-material/Search';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  DEFAULT_LAYER_FILTER,
  DEFAULT_LOG_LEVEL_FILTER,
  LAYERS,
  LOG_LEVELS,
  LogData
} from './constants';
import {
  FilterButton,
  PauseRunToggle,
  ResetButton,
  SwitchButton
} from './mui_extensions/Button';
import { Canvas } from './mui_extensions/Canvas';
import { CANVAS_ATTRS } from './mui_extensions/constants';
import { Content } from './mui_extensions/Content';
import { Controls } from './mui_extensions/Controls';

import { DataView } from './DataView';
import { TableView } from './TableView';
import { VFlowView } from './VFlowView';

const SSE_CLOSED = 2;

let eventSource: EventSource | undefined;

export const generateSelectedPayload = (
  payload: string,
  bytesToMatch: string
): JSX.Element[] => {
  const matches: number[] = [];
  if (bytesToMatch.length) {
    let match = payload.toLowerCase().indexOf(bytesToMatch);
    while (match !== -1) {
      matches.push(match);
      match = payload
        .toLowerCase()
        .indexOf(bytesToMatch, match + bytesToMatch.length);
    }
  }
  if (matches.length) {
    const output = [];
    output.push(
      <span key={output.length}>{payload.slice(0, matches[0])}</span>
    );
    matches.forEach((match, index) => {
      output.push(
        <span
          key={output.length}
          style={{ color: 'white', backgroundColor: '#007dc3' }}
        >
          {payload.slice(match, match + bytesToMatch.length)}
        </span>
      );
      if (index < matches.length - 1) {
        output.push(
          <span key={output.length}>
            {payload.slice(match + bytesToMatch.length, matches[index + 1])}
          </span>
        );
      }
    });
    output.push(
      <span key={output.length}>
        {payload.slice(matches[matches.length - 1] + bytesToMatch.length)}
      </span>
    );
    return output;
  } else {
    return [<span key={0}>{payload}</span>];
  }
};

export const snapToEntry = (entryIndex: number) => {
  const id = 'log' + entryIndex;
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }
};

const parseLogData = (
  time: number,
  index: number,
  rawData: number[]
): LogData[] => {
  const logEntries: LogData[] = [];
  for (let i = 0; i < rawData.length; i += 12) {
    if (rawData[i] === 255) {
      continue;
    }
    const rawBytes = rawData.slice(i, i + 12);
    const headerBytes =
      rawBytes[1].toString(2).padStart(8, '0') +
      rawBytes[0].toString(2).padStart(8, '0');
    const payloadBytes = [rawBytes[2], ...rawBytes.slice(4)];
    const level = parseInt(headerBytes.slice(0, 0 + 2), 2);
    const layer = parseInt(headerBytes.slice(3, 3 + 3), 2) - 1;
    const event = parseInt(headerBytes.slice(6), 2);
    let payload = '';
    for (let j = 0; j < payloadBytes.length; j++) {
      payload +=
        payloadBytes[j].toString(16).padStart(2, '0').toUpperCase() + ' ';
    }
    payload = payload.trim();
    logEntries.push({
      time,
      index: index + logEntries.length,
      event,
      layer,
      level,
      payload
    });
  }
  return logEntries;
};

export const Landing = (props: any): JSX.Element => {
  const [view, setView] = useState<number>(0);
  const [run, setRun] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [index, setIndex] = useState<number>(0);
  const [dataSet, setDataSet] = useState<LogData[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [bytesToMatch, setBytesToMatch] = useState<string>('');
  const [filterMenu, setFilterMenu] = useState<boolean>(false);
  const [levelFilter, setLevelFilter] = useState<boolean[]>(
    DEFAULT_LOG_LEVEL_FILTER
  );
  const [layerFilter, setLayerFilter] = useState<boolean[]>(
    DEFAULT_LAYER_FILTER
  );
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  const theme = useTheme();

  const runRef = useRef(run);
  const timeRef = useRef(time);
  const indexRef = useRef(index);

  const eventHandler = (event: any) => {
    if (!runRef.current) {
      return;
    }
    const data = JSON.parse(event.data);
    if (!data) {
      return;
    }
    if ('report' in data && data.report[0] === 197) {
      const now = Date.now();
      setDataSet(prev => {
        if (prev.length === 0) {
          setTime(now);
        }
        const logEntries: LogData[] = parseLogData(
          prev.length ? now - timeRef.current : 0,
          indexRef.current,
          data.report[1]
        );
        setIndex(prev => prev + logEntries.length);
        return [...prev, ...logEntries];
      });
    }
  };

  const errorHandler = (error: any) => {
    console.error(`Error - GET /webds/report\n${error}`);
  };

  const removeEvent = () => {
    if (eventSource && eventSource.readyState !== SSE_CLOSED) {
      eventSource.removeEventListener('report', eventHandler, false);
      eventSource.removeEventListener('error', errorHandler, false);
      eventSource.close();
      eventSource = undefined;
    }
  };

  const addEvent = () => {
    if (eventSource) {
      return;
    }
    eventSource = new window.EventSource('/webds/report');
    eventSource.addEventListener('report', eventHandler, false);
    eventSource.addEventListener('error', errorHandler, false);
  };

  const searchMatch = (logEntry: LogData): boolean => {
    const match = searchText.toLowerCase().trim();
    const bytes = match
      .replace(/\s/g, '')
      .match(/.{1,2}/g)
      ?.join(' ');
    setBytesToMatch(bytes === undefined ? '' : bytes);
    if (match.length && logEntry.event.toString().includes(match)) {
      return true;
    }
    if (bytes !== undefined) {
      return logEntry.payload.toLowerCase().includes(bytes);
    }
    return false;
  };

  const generateFilterMenu = (): JSX.Element => {
    return (
      <Menu
        anchorEl={document.getElementById('tnl_filter')}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={filterMenu}
        onClose={() => setFilterMenu(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ margin: '0px 8px' }}>
            <Typography variant="caption" sx={{ textAlign: 'center' }}>
              Layers
            </Typography>
            <Divider sx={{ margin: '4px 0px 0px 0px' }} />
            {LAYERS.map((layer, index) => {
              return (
                <MenuItem
                  key={index}
                  dense
                  onClick={() =>
                    setLayerFilter(prev => {
                      const current = [...prev];
                      current[index] = !current[index];
                      return current;
                    })
                  }
                >
                  <div
                    style={{
                      width: '24px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {layerFilter[index] && (
                      <DoneIcon
                        sx={{
                          fontSize: '14px',
                          color: theme.palette.primary.main
                        }}
                      />
                    )}
                  </div>
                  <Typography variant="caption">{layer}</Typography>
                </MenuItem>
              );
            })}
          </div>
          <div style={{ margin: '0px 8px' }}>
            <Typography variant="caption" sx={{ textAlign: 'center' }}>
              Log Levels
            </Typography>
            <Divider sx={{ margin: '4px 0px 0px 0px' }} />
            {LOG_LEVELS.slice().map((level, index) => {
              return (
                <MenuItem
                  key={index}
                  dense
                  onClick={() =>
                    setLevelFilter(prev => {
                      const current = [...prev];
                      current[index] = !current[index];
                      return current;
                    })
                  }
                >
                  <div
                    style={{
                      width: '24px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {levelFilter[index] && (
                      <DoneIcon
                        sx={{
                          fontSize: '14px',
                          color: theme.palette.primary.main
                        }}
                      />
                    )}
                  </div>
                  <Typography variant="caption">{level}</Typography>
                </MenuItem>
              );
            })}
          </div>
        </div>
      </Menu>
    );
  };

  const handleSearchInput = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (event.keyCode === 13) {
      if (event.preventDefault) {
        event.preventDefault();
      }
      if (event.stopPropagation) {
        event.stopPropagation();
      }
      if (selected === null) {
        for (let i = dataSet.length - 1; i >= 0; i--) {
          if (
            !(levelFilter[dataSet[i].level] && layerFilter[dataSet[i].layer])
          ) {
            continue;
          }
          if (searchMatch(dataSet[i])) {
            setSelected(i);
            snapToEntry(i);
            return;
          }
        }
      } else {
        for (let i = selected - 1; i >= 0; i--) {
          if (
            !(levelFilter[dataSet[i].level] && layerFilter[dataSet[i].layer])
          ) {
            continue;
          }
          if (searchMatch(dataSet[i])) {
            setSelected(i);
            snapToEntry(i);
            return;
          }
        }
        for (let i = dataSet.length - 1; i >= selected; i--) {
          if (
            !(levelFilter[dataSet[i].level] && layerFilter[dataSet[i].layer])
          ) {
            continue;
          }
          if (searchMatch(dataSet[i])) {
            setSelected(i);
            snapToEntry(i);
            return;
          }
        }
      }
      setSelected(null);
    }
  };

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    addEvent();
    return () => {
      removeEvent();
    };
  }, []);

  return (
    <Canvas title="Trace & Log" width={1060}>
      <Content
        sx={{
          height: CANVAS_ATTRS.MIN_HEIGHT_CONTENT + 'px',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '24px' }}>
            <OutlinedInput
              placeholder="Search"
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '16px' }} />
                </InputAdornment>
              }
              onChange={event => setSearchText(event.target.value)}
              onKeyDown={handleSearchInput}
              sx={{
                width: '240px',
                height: '24px',
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            />
            <IconButton
              color="primary"
              disabled={!selected}
              onClick={() => {
                if (selected) {
                  snapToEntry(selected);
                }
              }}
              sx={{ width: '24px', height: '24px' }}
            >
              <FmdGoodIcon />
            </IconButton>
          </div>
          {view === 1 ? (
            <TableView
              dataSet={dataSet}
              selected={selected}
              setSelected={setSelected}
              layerFilter={layerFilter}
              levelFilter={levelFilter}
              bytesToMatch={bytesToMatch}
              scrollPosition={scrollPosition}
              setScrollPosition={setScrollPosition}
            />
          ) : (
            <VFlowView
              dataSet={dataSet}
              selected={selected}
              setSelected={setSelected}
              layerFilter={layerFilter}
              levelFilter={levelFilter}
              scrollPosition={scrollPosition}
              setScrollPosition={setScrollPosition}
            />
          )}
        </div>
        {view === 0 && (
          <>
            <Divider
              orientation="vertical"
              sx={{
                height: CANVAS_ATTRS.MIN_HEIGHT_CONTENT - 48 + 'px',
                marginLeft: '16px',
                marginRight: '16px'
              }}
            />
            <div
              style={{
                height: CANVAS_ATTRS.MIN_HEIGHT_CONTENT - 48 + 'px',
                marginTop: '16px',
                flex: 1
              }}
            >
              <DataView
                dataSet={dataSet}
                selected={selected}
                bytesToMatch={bytesToMatch}
              />
            </div>
          </>
        )}
      </Content>
      <Controls
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <FilterButton id="tnl_filter" onClick={() => setFilterMenu(true)} />
          {filterMenu && generateFilterMenu()}
          <PauseRunToggle
            running={run}
            onClick={() => {
              setRun(!run);
            }}
          />
          <SwitchButton
            tooltip="Change Views"
            onClick={() => setView(prev => 1 - prev)}
          />
          <ResetButton
            tooltip="Clear"
            onClick={() => {
              setIndex(0);
              setDataSet([]);
              setSelected(null);
              setScrollPosition(0);
            }}
          />
        </div>
      </Controls>
    </Canvas>
  );
};

export default Landing;
