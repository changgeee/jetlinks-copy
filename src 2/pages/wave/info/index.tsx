/*
 * @Date: 2022-07-29 15:27:05
 * @LastEditors: changgeee
 * @LastEditTime: 2022-07-31 15:10:33
 * @FilePath: /jetlinks-ui-antd/src/pages/wave/info/index.tsx
 */
import React, { useEffect, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Avatar, Badge, Button, Card, Spin, Radio, DatePicker } from 'antd';
import { router } from 'umi';
import apis from '@/services';
import styles from '../index.less';
import FeatureChart from './featureChart';
import WaveChart from './waveChart';
import * as _ from 'lodash';
import moment from 'moment';
interface Props {
  dispatch: Dispatch;
  deviceProduct: any;
  location: Location;
  loading: boolean;
}

const WaveInfo: React.FC<Props> = props => {
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const [spinning, setSpinning] = useState(true);
  const [curDate, setCurDate] = useState('2022-07-25');

  const [axis, setAxis] = useState('X');
  const [type, setType] = useState('overall');
  const [selectedDatas, setSelectedDatas] = useState<any[]>([]);
  const [deviceT, setDeviceT] = useState(0);

  const getDeviceInfo = () => {
    apis.wave
      .deviceInfo({
        devNo: _.get(props, 'match.params.no'),
        axisType: axis,
      })
      .then(res => {
        setSpinning(false);
        setDeviceInfo(res[0]);
      });
    apis.wave
      .deviceInfo({
        devNo: _.get(props, 'match.params.no'),
        axisType: 'T',
      })
      .then(res => {
        setDeviceT(_.get(res, '0.axisTypes.0.points.0.newPointValue', 0));
      });
  };

  const [waveList, setWaveList] = useState<any[]>([]);
  const getWaveList = () => {
    apis.wave
      .waveList({
        devNo: _.get(props, 'match.params.no'),
        date: curDate,
      })
      .then(res => {
        setWaveList(res);
        setSelectedDatas(res);
      });
  };
  useEffect(() => {
    getDeviceInfo();
  }, [axis]);
  useEffect(() => {
    getWaveList();
  }, [curDate]);
  const getFeatureValue = (info: any, code: string) => {
    let res = 0;
    _.each(_.get(info, 'axisTypes.0.points', []), item => {
      if (item.point_code === code) {
        res = item.newPointValue.toFixed(2);
      }
    });
    return res;
  };

  return (
    <PageHeaderWrapper title="????????????">
      <div className={styles.card} style={{ minHeight: '70px' }}>
        <div style={{ paddingTop: '10px' }}>
          {type === 'overall' ? (
            <Radio.Group
              style={{ marginRight: '20px' }}
              onChange={e => setAxis(e.target.value)}
              value={axis}
            >
              <Radio.Button value="X">X</Radio.Button>
              <Radio.Button value="Y">Y</Radio.Button>
              <Radio.Button value="Z">Z</Radio.Button>
            </Radio.Group>
          ) : null}
          <DatePicker
            value={moment(curDate)}
            onChange={val => {
              if (val) {
                setCurDate(val.format('YYYY-MM-DD'));
              }
            }}
          />
          <Radio.Group
            style={{ float: 'right' }}
            onChange={e => setType(e.target.value)}
            value={type}
          >
            <Radio.Button value="overall">?????????</Radio.Button>
            <Radio.Button value="wave">????????????</Radio.Button>
          </Radio.Group>
        </div>
      </div>
      {type === 'overall' ? (
        <Spin spinning={spinning}>
          <div className={styles.card}>
            <p className={styles.textMain} style={{ margin: 0, lineHeight: '20px' }}>
              {deviceInfo.devName} | {deviceInfo.devNo}
            </p>
            <p className={styles.textLabel} style={{ margin: 0, lineHeight: '30px' }}>
              {deviceInfo.collectTime}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div className={styles.textLabel} style={{ paddingRight: '30px' }}>
                <div>
                  <span className={styles.textData}>{getFeatureValue(deviceInfo, 'AccPeak')}</span>
                  <span>mm/s</span>
                </div>
                <div>{axis} | ????????? | ??????</div>
              </div>
              <div className={styles.textLabel} style={{ paddingRight: '30px' }}>
                <div>
                  <span className={styles.textData}>{getFeatureValue(deviceInfo, 'VotMean')}</span>
                  <span>mm/s</span>
                </div>
                <div>{axis} | ?????? | ?????????</div>
              </div>
              <div className={styles.textLabel} style={{ paddingRight: '30px' }}>
                <div>
                  <span className={styles.textData}>{getFeatureValue(deviceInfo, 'DisPeak')}</span>
                  <span>mm/s</span>
                </div>
                <div>{axis} | ?????? | ?????????</div>
              </div>
              <div className={styles.textLabel} style={{ paddingRight: '30px' }}>
                <div>
                  <span className={styles.textData}>{deviceT}</span>
                  <span>???</span>
                </div>
                <div>?????? | ??????</div>
              </div>
            </div>
          </div>
        </Spin>
      ) : null}
      {type === 'overall' ? (
        <div>
          <FeatureChart
            axis={axis}
            date={curDate}
            no={_.get(props, 'match.params.no')}
            type="feature"
          />
          <FeatureChart
            axis={axis}
            date={curDate}
            no={_.get(props, 'match.params.no')}
            type="kurtosis"
          />
          <FeatureChart
            axis={axis}
            date={curDate}
            no={_.get(props, 'match.params.no')}
            type="mean"
          />
        </div>
      ) : null}
      {type === 'wave' ? (
        <div className={styles.card}>
          {_.map(waveList, item => (
            <div>
              <span className={styles.textData} style={{ paddingRight: '10px' }}>
                {item.pointCode.slice(0, 3)}
              </span>
              <span>{item.waveTime}</span>
            </div>
          ))}
        </div>
      ) : null}
      {type === 'wave' ? (
        <div>
          {selectedDatas.map(item => (
            <WaveChart waveInfo={item} />
          ))}
        </div>
      ) : null}
    </PageHeaderWrapper>
  );
};
export default WaveInfo;
