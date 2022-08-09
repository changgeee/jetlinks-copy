/*
 * @Date: 2022-07-29 19:51:16
 * @LastEditors: changgeee
 * @LastEditTime: 2022-07-31 13:03:53
 * @FilePath: /jetlinks-ui-antd/src/pages/wave/info/waveChart.tsx
 */
import React, { useEffect, useState, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Avatar, Badge, Button, Card, Spin, Radio } from 'antd';
import { router } from 'umi';
import apis from '@/services';
import styles from '../index.less';
import * as echarts from 'echarts';

interface Props {
  waveInfo: any;
}

const WaveChart: React.FC<Props> = props => {
  const rootRef = useRef(null);
  let chart: any = null;
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>({});
  const [spinning, setSpinning] = useState(true);
  let markLines: { x: number; y: number }[] = [];
  const onSelectData = (x: any, y: any) => {
    markLines.push({ x, y });
    chart.setOption({
      series: {
        markLine: {
          silent: true,
          lineStyle: {
            color: '#333',
          },
          symbol: 'none',
          data: markLines.map(item => {
            return { xAxis: `${item.x}` };
          }),
        },
      },
    });
  };
  const [waveType, setWaveType] = useState('1');
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
      </div>
    </Spin>
  );
};
export default WaveChart;
