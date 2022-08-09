/*
 * @Date: 2022-07-29 17:35:21
 * @LastEditors: changgeee
 * @LastEditTime: 2022-08-09 17:04:50
 * @FilePath: \src\pages\wave\info\featureChart.tsx
 */
import React, { useEffect, useState, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Avatar, Badge, Button, Card, Spin, Radio } from 'antd';
import { router } from 'umi';
import apis from '@/services';
import styles from '../index.less';
import * as echarts from 'echarts';
import * as _ from 'lodash';
interface Props {
  type: string;
  axis: string;
  no: string;
  date: string;
}

const WaveInfo: React.FC<Props> = props => {
  const rootRef = useRef(null);
  let chart: any = null;
  // const [chartData,setChartData]=useState<any[]>([]);
  const [spinning, setSpinning] = useState(true);
  const getSeries = (data: any[]) => {
    if (props.type === 'feature') {
      return [
        {
          name: '温度',
          type: 'line',
          data: data.map(item => {
            return item.sensorchiptemp;
          }),
          symbol: 'none',
        },
        {
          name: '速度有效值',
          type: 'line',
          data: data.map(item => {
            return item.votmean;
          }),
          symbol: 'none',
        },
        {
          name: '加速度峰值',
          type: 'line',
          data: data.map(item => {
            return item.accpeak;
          }),
          symbol: 'none',
        },
        {
          name: '位移峰峰值',
          type: 'line',
          data: data.map(item => {
            return item.dispeak;
          }),
          symbol: 'none',
        },
      ];
    }
    if (props.type === 'kurtosis') {
      return [
        {
          name: '峭度',
          type: 'line',
          data: data.map(item => {
            return item.accKurtosis;
          }),
          symbol: 'none',
        },
      ];
    }
    if (props.type === 'mean') {
      return [
        {
          name: '高频',
          type: 'line',
          data: data.map(item => {
            return item.accMeanH;
          }),
          symbol: 'none',
        },
        {
          name: '低频',
          type: 'line',
          data: data.map(item => {
            return item.accMeanL;
          }),
          symbol: 'none',
        },
      ];
    }
  };

  const updateChart = (chartData: any[]) => {
    if (chart) {
      chart.clear();
    } else {
      // @ts-ignore
      chart = echarts.init(rootRef.current);
    }
    // 绘制图表
    chart.setOption({
      title: {
        text:
          props.type === 'feature'
            ? `${props.axis} | 特征`
            : props.type === 'kurtosis'
            ? `峭度`
            : `高低频`,
        right: 10,
      },
      tooltip: {
        trigger: 'axis',
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
        {
          startValue: '2014-06-01',
        },
        {
          type: 'inside',
        },
      ],
      xAxis: {
        data: chartData.map(function(item) {
          return item.collectTime;
        }),
      },
      yAxis: {
        position: 'right',
      },
      series: getSeries(chartData),
    });
  };
  useEffect(() => {
    if (props.type === 'feature') {
      setSpinning(true);
      apis.wave
        .featureHistroy({
          devNo: props.no,
          axisType: props.axis,
          date: props.date,
        })
        .then((res: any) => {
          updateChart(res);
          setSpinning(false);
        })
        .catch(() => {});
    }
    if (props.type === 'kurtosis') {
      setSpinning(true);
      apis.wave
        .kurtosisHistroy({
          devNo: props.no,
          date: props.date,
        })
        .then((res: any) => {
          updateChart(res);
          setSpinning(false);
        })
        .catch(() => {});
    }
    if (props.type === 'mean') {
      setSpinning(true);
      apis.wave
        .meanHistroy({
          devNo: props.no,
          date: props.date,
        })
        .then((res: any) => {
          updateChart(res);
          setSpinning(false);
        })
        .catch(() => {});
    }
  }, [props.date]);
  useEffect(() => {
    if (props.type === 'feature') {
      setSpinning(true);
      apis.wave
        .featureHistroy({
          devNo: props.no,
          axisType: props.axis,
          date: props.date,
        })
        .then((res: any) => {
          updateChart(res);
          setSpinning(false);
        })
        .catch(() => {});
    }
  }, [props.axis]);
  return (
    <Spin spinning={spinning}>
      <div className={styles.card}>
        <div ref={rootRef} style={{ height: '300px' }} />
      </div>
    </Spin>
  );
};
export default WaveInfo;
