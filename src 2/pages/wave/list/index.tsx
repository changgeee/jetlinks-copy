/*
 * @Date: 2022-07-29 15:26:46
 * @LastEditors: changgeee
 * @LastEditTime: 2022-07-31 15:09:49
 * @FilePath: /jetlinks-ui-antd/src/pages/wave/list/index.tsx
 */
import React, { useEffect, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Avatar, Badge, Button, Card, Spin } from 'antd';
import { router } from 'umi';
import apis from '@/services';
import styles from '../index.less';

interface Props {
  dispatch: Dispatch;
  deviceProduct: any;
  location: Location;
  loading: boolean;
}

const WaveList: React.FC<Props> = props => {
  useEffect(() => {
    apis.wave.deviceList().then(res => {
      if (res) {
        setDeviceList(res);
        setSpinning(false);
      }
    });
  }, []);

  const getMeanValue = (item: any, type: string) => {
    let res = 0;
    item.axisTypes.forEach((axis: any) => {
      if (axis.axisType === type) {
        res = axis.points[0].newPointValue.toFixed(2);
      }
    });
    return res;
  };

  const [deviceList, setDeviceList] = useState<any>([]);
  const [spinning, setSpinning] = useState(true);

  return (
    <PageHeaderWrapper title="设备列表">
      <Spin spinning={spinning}>
        <div
          className="deviceList"
        >
          {deviceList.map((item: any) => (
            <Card
              className={styles.device}
              style={{ width: 500, display: 'inline-block',margin:'0 10px 10px 0' }}
              bodyStyle={{ padding: '10px' }}
              onClick={() => {
                router.push(`/wave/info/${item.devNo}`);
              }}
            >
              <p className={styles.textMain}>
                <span>{item.devName}</span>
                <span style={{ padding: '0 20px' }}>|</span>
                <span>{item.devNo}</span>
                <span style={{ float: 'right' }}> {item.collectTime} </span>
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div className={styles.textLabel}>
                  <div>
                    <span className={styles.textData}>{getMeanValue(item, 'X')}</span>
                    <span>mm/s</span>
                  </div>
                  <div>X轴</div>
                </div>
                <div className={styles.textLabel}>
                  <div>
                    <span className={styles.textData}>{getMeanValue(item, 'Y')}</span>
                    <span>mm/s</span>
                  </div>
                  <div>Y轴</div>
                </div>
                <div className={styles.textLabel}>
                  <div>
                    <span className={styles.textData}>{getMeanValue(item, 'Z')}</span>
                    <span>mm/s</span>
                  </div>
                  <div>Z轴</div>
                </div>
                <div className={styles.textLabel}>
                  <div>
                    <span className={styles.textData}>{getMeanValue(item, 'T')}</span>
                    <span>℃</span>
                  </div>
                  <div>温度</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Spin>
    </PageHeaderWrapper>
  );
};
export default WaveList;
