import React, { Fragment, useEffect, useState } from 'react';
import { Badge, Button, Card, Divider, Input, message, Modal, Popconfirm, Select, Spin, Table, Tabs, Tag } from 'antd';
import { ColumnProps, SorterResult } from 'antd/es/table';
import { alarm, AlarmLog } from '@/pages/device/alarm/data';
import moment from 'moment';
import AlarmSave from './save';
import Form from 'antd/es/form';
import { FormComponentProps } from 'antd/lib/form';
import { PaginationConfig } from 'antd/lib/table';
import Service from './service';
import styles from '@/utils/table.less';
import encodeQueryParam from '@/utils/encodeParam';

interface Props extends FormComponentProps {
  device: any;
}

interface State {
  data: any;
  saveAlarmData: Partial<alarm>;
  searchParam: any;
  alarmLogData: any;
  alarmDataList: any[];
  searchAlarmParam: any;
}

const Alarm: React.FC<Props> = props => {
  const service = new Service('rule-engine-alarm');
  const {
    form: { getFieldDecorator },
    form,
  } = props;

  const initState: State = {
    data: {},
    saveAlarmData: {},
    searchParam: {
      pageSize: 10,
      // sorts:[{name:"alarmTime",order: 'desc' }]
      sorts: {
        order: "desc",
        field: "alarmTime"
      }
    },
    searchAlarmParam: {
      pageSize: 10
    },
    alarmLogData: {},
    alarmDataList: [],
  };

  const [data, setData] = useState(initState.data);
  const [spinning, setSpinning] = useState(true);
  const [saveVisible, setSaveVisible] = useState(false);
  const [solveVisible, setSolveVisible] = useState(false);
  const [saveAlarmData, setSaveAlarmData] = useState(initState.saveAlarmData);
  const [alarmActiveKey, setAlarmActiveKey] = useState('');
  const [alarmLogId, setAlarmLogId] = useState<string>("");
  const [solveAlarmLog, setSolveAlarmLog] = useState<any>({});
  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [searchAlarmParam, setSearchAlarmParam] = useState(initState.searchAlarmParam);
  const [alarmLogData, setAlarmLogData] = useState(initState.alarmLogData);
  const [alarmDataList, setAlarmDataList] = useState(initState.alarmDataList);

  const statusMap = new Map();
  statusMap.set('?????????', 'success');
  statusMap.set('?????????', 'error');

  const getProductAlarms = () => {
    alarmDataList.splice(0, alarmDataList.length);
    setSpinning(false)
    service.getAlarmsList(props.device.id, {
      paging: false
    }).subscribe(
      (res) => {
        res.data.map((item: any) => {
          alarmDataList.push(item);
        });
        setAlarmDataList([...alarmDataList]);
      },
      () => setSpinning(false)
    )
  };
  const getData = (params?: any) => {
    setSearchAlarmParam(params)
    service.getAlarmsList(props.device.id, params).subscribe(
      (res) => {
        setData(res);
      },
      () => setSpinning(false)
    )
  }

  useEffect(() => {
    setAlarmActiveKey('info');
    getProductAlarms();
    getData(searchAlarmParam);
    handleSearch(searchParam);
  }, []);

  const submitData = (data: any) => {
    service.saveAlarms(props.device.id, data).subscribe(
      res => {
        message.success('????????????');
        setSaveVisible(false);
        getProductAlarms();
        getData(searchAlarmParam);
      },
      () => setSpinning(false)
    )
  };

  const _start = (item: alarm) => {
    service._start(props.device.id, { id: item.id }).subscribe(
      () => {
        message.success('????????????');
        getProductAlarms();
        getData(searchAlarmParam);
        setSpinning(false)
      },
      () => { },
      () => setSpinning(false)
    )
  };

  const _stop = (item: any) => {
    service._stop(props.device.id, { id: item.id }).subscribe(
      () => {
        message.success('????????????');
        getProductAlarms();
        getData(searchAlarmParam);
        setSpinning(false)
      },
      () => { },
      () => setSpinning(false)
    )
  };

  const deleteAlarm = (id: string) => {
    service._remove(props.device.id, { id: id }).subscribe(
      () => {
        message.success('????????????');
        getProductAlarms();
        getData(searchAlarmParam);
        setSpinning(false)
      },
      () => { },
      () => setSpinning(false)
    )
  };

  const columns: ColumnProps<alarm>[] = [
    {
      title: '????????????',
      dataIndex: 'name',
    },
    {
      title: '????????????',
      dataIndex: 'createTime',
      render: (text: any) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '/',
    },
    {
      title: '????????????',
      dataIndex: 'state',
      render: record => record ? <Badge status={statusMap.get(record.text)} text={record.text} /> : '',
    },
    {
      title: '??????',
      width: '250px',
      align: 'center',
      render: (record: any) => (
        <Fragment>
          <a onClick={() => {
            setSaveAlarmData(record);
            setSaveVisible(true);
          }}>??????</a>
          <Divider type="vertical" />
          <a onClick={() => {
            setAlarmLogId(record.id);
            onAlarmProduct(record.id);
            setAlarmActiveKey('logList');
          }}>????????????</a>
          <Divider type="vertical" />
          {record.state?.value === 'stopped' ? (
            <span>
              <Popconfirm
                title="????????????????????????"
                onConfirm={() => {
                  setSpinning(true);
                  _start(record);
                }}
              >
                <a>??????</a>
              </Popconfirm>
              <Divider type="vertical" />
              <Popconfirm
                title="????????????????????????"
                onConfirm={() => {
                  setSpinning(true);
                  deleteAlarm(record.id);
                }}
              >
                <a>??????</a>
              </Popconfirm>
            </span>
          ) : (
            <Popconfirm
              title="????????????????????????"
              onConfirm={() => {
                setSpinning(true);
                _stop(record);
              }}
            >
              <a>??????</a>
            </Popconfirm>
          )}
        </Fragment>
      ),
    },
  ];

  const alarmLogColumns: ColumnProps<AlarmLog>[] = [
    {
      title: '??????ID',
      dataIndex: 'deviceId',
    },
    {
      title: '????????????',
      dataIndex: 'deviceName',
    },
    {
      title: '????????????',
      dataIndex: 'alarmName',
    },
    {
      title: '????????????',
      dataIndex: 'alarmTime',
      width: '300px',
      render: (text: any) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '/',
      sorter: true,
      defaultSortOrder: 'descend'
    },
    {
      title: '????????????',
      dataIndex: 'state',
      align: 'center',
      width: '100px',
      render: text => text === 'solve' ? <Tag color="#87d068">?????????</Tag> : <Tag color="#f50">?????????</Tag>,
    },
    {
      title: '??????',
      width: '120px',
      align: 'center',
      render: (record: any) => (
        <Fragment>
          <a onClick={() => {
            let content: string;
            try {
              content = JSON.stringify(record.alarmData, null, 2);
            } catch (error) {
              content = record.alarmData;
            }
            Modal.confirm({
              width: '40VW',
              title: '????????????',
              content: <pre>{content}
                {record.state === 'solve' && (
                  <>
                    <br /><br />
                    <span style={{ fontSize: 16 }}>???????????????</span>
                    <br />
                    <p>{record.description}</p>
                  </>
                )}
              </pre>,
              okText: '??????',
              cancelText: '??????',
            })
          }}>??????</a>
          {

            record.state !== 'solve' && (
              <>
                <Divider type="vertical" />
                <a onClick={() => {
                  setSolveAlarmLog(record);
                  setSolveVisible(true);
                }}>??????</a>
              </>
            )
          }
        </Fragment>
      )
    },
  ];

  const alarmSolve = () => {
    form.validateFields((err, fileValue) => {
      if (err) return;
      let params = {
        descriptionMono: fileValue.description,
        id: solveAlarmLog.id,
        state: 'solve'
      }
      service.updataAlarmLog(props.device.id, params).subscribe(res => {
        setSolveVisible(false);
        handleSearch(searchParam);
        message.success('???????????????');
      })
    });
  };

  const handleSearch = (params?: any) => {
    setSearchParam(params);
    service.getAlarmLogList(props.device.id, params).subscribe(
      res => {
        setAlarmLogData(res);
      }
    )
  };

  const onAlarmProduct = (value?: string) => {
    handleSearch({
      pageSize: 10,
      where: `alarmId=${value}`
    });
  };

  // useEffect(() => {
  //   handleSearch(searchParam);
  // }, [alarmActiveKey]);

  const onTableChange = (
    pagination: PaginationConfig,
    filters: any,
    sorter: SorterResult<AlarmLog>,
  ) => {
    handleSearch({
      ...searchParam,
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      sorts:sorter
    });
  };

  const onTableAlarmChange = (
    pagination: PaginationConfig,
  ) => {
    getData({
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      terms: searchParam.terms,
    })
  };

  return (
    <Spin tip="?????????..." spinning={spinning}>
      <Card>
        <Tabs tabPosition="top" type="card" activeKey={alarmActiveKey} onTabClick={(key: any) => {
          setAlarmActiveKey(key);
          // if (key = 'logList') {
          //   setAlarmLogId("");
          //   handleSearch(searchParam);
          // }
        }}>
          <Tabs.TabPane tab="????????????" key="info">
            <Card title={
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  setSaveAlarmData({});
                  setSaveVisible(true);
                }}
              >
                ????????????
              </Button>
            } bordered={false}>
              <Table rowKey="id" columns={columns} dataSource={data.data}
                onChange={onTableAlarmChange}
                pagination={{
                  current: data.pageIndex + 1,
                  total: data.total,
                  pageSize: data.pageSize,
                  showQuickJumper: true,
                  showSizeChanger: true,
                  hideOnSinglePage: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  style: { marginTop: -20 },
                  showTotal: (total: number) =>
                    `??? ${total} ????????? ???  ${data.pageIndex + 1}/${Math.ceil(
                      data.total / data.pageSize,
                    )}???`,
                }} />
            </Card>
          </Tabs.TabPane>
          <Tabs.TabPane tab="????????????" key="logList">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Select placeholder="??????????????????" allowClear style={{ width: 300 }} value={alarmLogId}
                onChange={(value: string) => {
                  setAlarmLogId(value);
                  if (value !== '' && value !== undefined) {
                    onAlarmProduct(value);
                  } else {
                    handleSearch({
                      pageIndex: searchParam.pageIndex,
                      pageSize: searchParam.pageSize
                    });
                  }
                }}
              >
                {alarmDataList.length > 0 && alarmDataList.map(item => (
                  <Select.Option key={item.id}>{item.name}</Select.Option>
                ))}
              </Select>
              <div>
                <Button type="primary" onClick={() => {
                  handleSearch(searchParam);
                }}>??????</Button>
              </div>
            </div>
            <div className={styles.StandardTable} style={{ marginTop: 10 }}>
              <Table
                dataSource={alarmLogData.data}
                columns={alarmLogColumns}
                rowKey='id'
                onChange={onTableChange}
                pagination={{
                  current: alarmLogData.pageIndex + 1,
                  total: alarmLogData.total,
                  pageSize: alarmLogData.pageSize
                }}
              />
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {saveVisible && <AlarmSave
        close={() => {
          setSaveAlarmData({});
          setSaveVisible(false);
          getProductAlarms();
        }}
        save={(data: any) => {
          setSpinning(true);
          submitData(data);
        }}
        data={saveAlarmData}
        deviceId={props.device.id}
      />}

      {solveVisible && (
        <Modal
          title='??????????????????'
          visible
          okText="??????"
          cancelText="??????"
          width='700px'
          onOk={() => {
            alarmSolve();
          }}
          onCancel={() => {
            setSolveVisible(false);
            setSolveAlarmLog({});
          }}
        >
          <Form labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} key="solve_form">
            <Form.Item key="description" label="????????????">
              {getFieldDecorator('description', {
                rules: [
                  { required: true, message: '?????????????????????' },
                  { max: 2000, message: '?????????????????????2000?????????' }
                ],
              })(
                <Input.TextArea rows={8} placeholder="?????????????????????" />,
              )}
            </Form.Item>
          </Form>
        </Modal>
      )}
    </Spin>
  );
};
export default Form.create<Props>()(Alarm);
