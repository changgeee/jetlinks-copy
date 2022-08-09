/*
 * @Date: 2022-07-29 19:51:16
 * @LastEditors: changgeee
 * @LastEditTime: 2022-08-09 20:44:19
 * @FilePath: /jetlinks-copy/src/pages/wave/info/waveChart.tsx
 */
import React, { useEffect, useState, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Select,
  Spin,
  Radio,
  Drawer,
  message,
  Tag,
  Divider,
} from 'antd';
import { router } from 'umi';
import apis from '@/services';
import styles from '../index.less';
import * as echarts from 'echarts';
import * as _ from 'lodash';
import { ClearOutlined, FilterOutlined } from '@ant-design/icons';

const { Option } = Select;

interface Props {
  waveInfo: any;
}

const WaveChart: React.FC<Props> = props => {
  const rootRef = useRef(null);
  let chart: any = null;
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>({});
  const [spinning, setSpinning] = useState(true);
  const [markLines, setMarkLines] = useState<{ x: number; y: number }[]>([]);
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [operations, setOperations] = useState([]);

  const onSelectData = (x: any, y: any) => {
    if (markLines.length <= 10) {
      const res = [...markLines, { x, y }];
      console.log(JSON.stringify(markLines), res);

      console.log(markLines, res);
      chart.setOption({
        series: {
          markLine: {
            silent: true,
            lineStyle: {
              color: '#333',
            },
            symbol: 'none',
            data: res.map(item => {
              return { xAxis: `${item.x}` };
            }),
          },
        },
      });
      console.log(JSON.stringify(markLines), res);
      setMarkLines(res);
    } else {
      message.warning('最多添加10条标线');
    }
  };
  const [waveType, setWaveType] = useState('1');
  const [visible, setVisible] = useState(false);
  const updateChart = (oData: any) => {
    if (chart) {
      chart.clear();
    } else {
      // @ts-ignore
      chart = echarts.init(rootRef.current);
    }

    // 绘制图表
    chart.setOption({
      title: {
        text: `${oData.type} | ${oData.time}`,
        right: 10,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      axisPointer: {
        link: { xAxisIndex: 'all' },
        label: {
          backgroundColor: '#777',
        },
      },
      legend: {
        show: true,
        left: 0,
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
      },
      dataZoom: [
        // {
        //   startValue: '2014-06-01',
        // },
        {
          type: 'inside',
        },
      ],
      xAxis: {
        data: oData.datax,
      },
      yAxis: {
        position: 'right',
      },
      series: [
        {
          type: 'line',
          data: oData.datay,
          symbol: 'circle',
          triggerLineEvent: true,
        },
      ],
    });
    // chart.on('mousedown', function(params) {
    //   console.log(params);
    // });
    chart.getZr().on('mousedown', (event: any) => {
      const pointInPixel = [event.offsetX, event.offsetY];
      if (chart.containPixel('grid', pointInPixel)) {
        const xIndex = chart.convertFromPixel({ seriesIndex: 0 }, [
          event.offsetX,
          event.offsetY,
        ])[0];
        const y = chart.convertFromPixel({ seriesIndex: 0 }, [event.offsetX, event.offsetY])[1];
        const x = oData.datax[xIndex];
        onSelectData(x, y);
      }
    });
  };

  const getOprateRes = (x1, x2) => {
    let y1 = 0;
    let y2 = 0;
    _.each(markLines, line => {
      if (x1 === line.x) {
        y1 = line.y;
      }
      if (x2 === line.x) {
        y2 = line.y;
      }
    });
    return y1 - y2;
  };
  useEffect(() => {
    setSpinning(true);
    apis.wave
      .waveDetail({
        waveId: props.waveInfo.waveId,
        waveType: waveType,
      })
      .then(res => {
        setSpinning(false);
        setChartData(res);
        updateChart(res);
      });
  }, [props.waveInfo, waveType]);
  return (
    <Spin spinning={spinning}>
      <div className={styles.card}>
        <Radio.Group
          onChange={e => setWaveType(e.target.value)}
          value={waveType}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 999,
          }}
        >
          <Radio.Button value="1">时域</Radio.Button>
          <Radio.Button value="2">频域</Radio.Button>
          <Radio.Button value="3">包络</Radio.Button>
        </Radio.Group>
        <div ref={rootRef} style={{ height: '300px' }} />
        <ClearOutlined onClick={() => setMarkLines([])} />
        <FilterOutlined onClick={() => setVisible(true)} />
        <Drawer
          title="波形数据对比"
          placement="right"
          onClose={() => setVisible(false)}
          visible={visible}
        >
          <div>
            {_.map(operations, item => (
              <div key={`${item.val1.x} ${item.val2.x}`}>
                <span>{item.val1}</span>
                <span>-</span>
                <span>{item.val2}</span>
                <span>=</span>
                <span>{getOprateRes(item.val1, item.val2)}</span>
              </div>
            ))}
          </div>
          <div>
            <Select
              style={{ width: 120 }}
              onChange={val => {
                setVal1(val);
              }}
            >
              {_.map(markLines, item => (
                <Option value={item.x}>{`${item.x} - ${item.y}`}</Option>
              ))}
            </Select>
            <span> - </span>
            <Select
              style={{ width: 120 }}
              onChange={val => {
                setVal2(val);
              }}
            >
              {_.map(markLines, item => (
                <Option value={item.x}>{`${item.x} - ${item.y}`}</Option>
              ))}
            </Select>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                if (val1 && val2) {
                  setOperations([...operations, { val1, val2 }]);
                  setVal1('');
                  setVal2('');
                }
              }}
            ></Button>
          </div>
          <Divider orientation="left">标线</Divider>
          <div>
            {_.map(markLines, item => (
              <Tag color="geekblue">{`${item.x} ${item.y}`}</Tag>
            ))}
          </div>
        </Drawer>
      </div>
    </Spin>
  );
};
export default WaveChart;
