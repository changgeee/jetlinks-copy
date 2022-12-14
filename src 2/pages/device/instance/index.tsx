import React, { FC, Fragment, useEffect, useState } from 'react';
import styles from '@/utils/table.less';
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Icon,
  Menu,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { router } from 'umi';
import { ColumnProps, PaginationConfig, SorterResult } from 'antd/lib/table';
import { FormComponentProps } from 'antd/es/form';
import { ConnectState, Dispatch } from '@/models/connect';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import encodeQueryParam from '@/utils/encodeParam';
import apis from '@/services';
import { getAccessToken } from '@/utils/authority';
import moment from 'moment';
import Save from './Save';
import Search from './Search';
import { DeviceInstance } from './data.d';
import Process from './Process';
import Import from './operation/import';
import Export from './operation/export';
import numeral from 'numeral';
import { DeviceProduct } from '@/pages/device/product/data';
import { getPageQuery } from '@/utils/utils';

interface Props extends FormComponentProps {
  loading: boolean;
  dispatch: Dispatch;
  deviceInstance: any;
  location: Location;
}

interface State {
  data: any;
  searchParam: any;
  addVisible: boolean;
  currentItem: Partial<DeviceInstance>;
  processVisible: boolean;
  importLoading: boolean;
  action: string;
  deviceCount: any;
  productList: DeviceProduct[];
  deviceIdList: any[];
}

const DeviceInstancePage: React.FC<Props> = props => {
  const { result } = props.deviceInstance;
  const { dispatch, location } = props;

  const map = new Map();
  map.set('id', 'id$like');
  map.set('name', 'name$like');
  map.set('orgId', 'orgId$in');
  map.set('devTag', 'id$dev-tag');
  map.set('devBind', 'id$dev-bind$any');
  map.set('devProd', 'productId$dev-prod-cat');
  map.set('productId', 'productId');

  const initState: State = {
    data: result,
    searchParam: {
      pageSize: 10,
      terms: location?.query?.terms,
      sorts: {
        order: 'desc',
        field: 'id',
      },
    },
    addVisible: false,
    currentItem: {},
    processVisible: false,
    importLoading: false,
    action: '',
    deviceCount: {
      notActiveCount: 0,
      offlineCount: 0,
      onlineCount: 0,
      deviceTotal: 0,
      loading: true,
    },
    productList: [],
    deviceIdList: [],
  };

  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [addVisible, setAddVisible] = useState(initState.addVisible);
  const [currentItem, setCurrentItem] = useState(initState.currentItem);
  const [importLoading, setImportLoading] = useState(initState.importLoading);
  const [action, setAction] = useState(initState.action);
  const [productList, setProductList] = useState(initState.productList);
  const [product, setProduct] = useState<string>();
  const [deviceCount, setDeviceCount] = useState(initState.deviceCount);
  const [deviceImport, setDeviceImport] = useState(false);
  const [deviceExport, setDeviceExport] = useState(false);
  const [deviceIdList, setDeviceIdLIst] = useState(initState.deviceIdList);

  const statusMap = new Map();
  statusMap.set('??????', 'success');
  statusMap.set('??????', 'error');
  statusMap.set('?????????', 'processing');
  statusMap.set('online', 'success');
  statusMap.set('offline', 'error');
  statusMap.set('notActive', 'processing');

  const handleSearch = (params?: any) => {
    setSearchParam(params);
    dispatch({
      type: 'deviceInstance/query',
      payload: encodeQueryParam(params),
    });
  };

  const delelteInstance = (record: any) => {
    apis.deviceInstance
      .remove(record.id)
      .then(response => {
        if (response.status === 200) {
          message.success('????????????');
          deviceIdList.splice(0, deviceIdList.length);
          handleSearch(searchParam);
        }
      })
      .catch(() => {});
  };

  const changeDeploy = (record: any) => {
    apis.deviceInstance
      .changeDeploy(record.id)
      .then(response => {
        if (response.status === 200) {
          message.success('????????????');
          deviceIdList.splice(0, deviceIdList.length);
          handleSearch(searchParam);
        }
      })
      .catch(() => {});
  };

  const unDeploy = (record: any) => {
    apis.deviceInstance
      .unDeploy(record.id)
      .then(response => {
        if (response.status === 200) {
          message.success('????????????');
          deviceIdList.splice(0, deviceIdList.length);
          handleSearch(searchParam);
        }
      })
      .catch(() => {});
  };
  const columns: ColumnProps<DeviceInstance>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '????????????',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '????????????',
      dataIndex: 'productName',
      ellipsis: true,
    },
    {
      title: '????????????',
      dataIndex: 'registryTime',
      width: '200px',
      render: (text: any) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '/'),
      sorter: true,
    },
    {
      title: '??????',
      dataIndex: 'state',
      width: '90px',
      render: record =>
        record ? <Badge status={statusMap.get(record.value)} text={record.text} /> : '',
      filters: [
        {
          text: '?????????',
          value: 'notActive',
        },
        {
          text: '??????',
          value: 'offline',
        },
        {
          text: '??????',
          value: 'online',
        },
      ],
      filterMultiple: false,
    },
    {
      title: '??????',
      dataIndex: 'describe',
      width: '15%',
      ellipsis: true,
    },
    {
      title: '??????',
      width: '200px',
      align: 'center',
      render: (record: any) => (
        <Fragment>
          <a
            onClick={() => {
              router.push(`/device/instance/save/${record.id}`);
            }}
          >
            ??????
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              setCurrentItem(record);
              setAddVisible(true);
            }}
          >
            ??????
          </a>
          <Divider type="vertical" />
          {record.state?.value === 'notActive' ? (
            <span>
              <Popconfirm
                title="???????????????"
                onConfirm={() => {
                  changeDeploy(record);
                }}
              >
                <a>??????</a>
              </Popconfirm>
              <Divider type="vertical" />
              <Popconfirm
                title="???????????????"
                onConfirm={() => {
                  delelteInstance(record);
                }}
              >
                <a>??????</a>
              </Popconfirm>
            </span>
          ) : (
            <Popconfirm
              title="?????????????????????"
              onConfirm={() => {
                unDeploy(record);
              }}
            >
              <a>??????</a>
            </Popconfirm>
          )}
        </Fragment>
      ),
    },
  ];

  const stateCount = (productId: string) => {
    const map = {
      notActiveCount: 0,
      offlineCount: 0,
      onlineCount: 0,
      deviceTotal: 0,
      loading: true,
    };

    apis.deviceInstance
      .count(
        encodeQueryParam({
          terms: {
            state: 'notActive',
            productId,
            ...location?.query?.terms,
            ...(location?.query.iop && JSON.parse(location?.query.iop)?.terms),
          },
        }),
      )
      .then(res => {
        if (res.status === 200) {
          map.notActiveCount = res.result;
          setDeviceCount({ ...map });
        }
      })
      .catch();
    apis.deviceInstance
      .count(
        encodeQueryParam({
          terms: {
            state: 'offline',
            productId,
            ...location?.query?.terms,
            ...(location?.query.iop && JSON.parse(location?.query.iop)?.terms),
          },
        }),
      )
      .then(res => {
        if (res.status === 200) {
          map.offlineCount = res.result;
          setDeviceCount({ ...map });
        }
      })
      .catch();
    apis.deviceInstance
      .count(
        encodeQueryParam({
          terms: {
            state: 'online',
            productId,
            ...location?.query?.terms,
            ...(location?.query.iop && JSON.parse(location?.query.iop)?.terms),
          },
        }),
      )
      .then(res => {
        if (res.status === 200) {
          map.onlineCount = res.result;
          setDeviceCount({ ...map });
        }
      })
      .catch();
    apis.deviceInstance
      .count(
        encodeQueryParam({
          terms: {
            productId,
            ...location?.query?.terms,
            ...(location?.query.iop && JSON.parse(location?.query.iop)?.terms),
          },
        }),
      )
      .then(res => {
        if (res.status === 200) {
          map.deviceTotal = res.result;
          map.loading = false;
          setDeviceCount({ ...map });
        }
      })
      .catch();
  };

  useEffect(() => {
    // ?????????????????????
    apis.deviceProdcut
      .queryNoPagin(
        encodeQueryParam({
          paging: false,
        }),
      )
      .then(e => {
        setProductList(e.result);
      })
      .catch(() => {});

    const query: any = getPageQuery();
    if (query.hasOwnProperty('productId')) {
      const { productId } = query;
      setProduct(productId);
      handleSearch({
        terms: {
          productId: query.productId,
        },
        pageSize: 10,
      });
      stateCount(productId);
    } else if (location?.query) {
      let key = Object.keys(location?.query)[0];
      let params = {};
      params[map.get(key)] = location?.query[key];
      handleSearch({
        terms: { ...params, ...(location?.query.iop && JSON.parse(location?.query.iop)?.terms) },
        pageSize: 10,
        sorts: searchParam.sorts,
      });
      stateCount('');
    } else {
      handleSearch(searchParam);
      stateCount('');
    }
  }, []);

  const onTableChange = (
    pagination: PaginationConfig,
    filters: any,
    sorter: SorterResult<DeviceInstance>,
  ) => {
    let { terms } = searchParam;
    if (filters.state) {
      if (terms) {
        terms.state = filters.state[0];
      } else {
        terms = {
          state: filters.state[0],
        };
      }
    }
    handleSearch({
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      terms,
      sorts: sorter,
    });
  };

  const [processVisible, setProcessVisible] = useState(false);

  const [api, setAPI] = useState<string>('');

  const getSearchParam = () => {
    const data = encodeQueryParam(searchParam);
    let temp = '';
    Object.keys(data).forEach((i: string) => {
      if (data[i] && i !== 'pageSize' && i !== 'pageIndex') {
        temp += `${i}=${data[i]}&`;
      }
    });
    return encodeURI(temp.replace(/%/g, '%'));
  };
  // ??????????????????
  const startImport = () => {
    setProcessVisible(true);
    const activeAPI = `/jetlinks/device-instance/deploy?${getSearchParam()}:X_Access_Token=${getAccessToken()} `;
    setAPI(activeAPI);
    setAction('active');
  };

  const startSync = () => {
    setProcessVisible(true);
    const syncAPI = `/jetlinks/device-instance/state/_sync/?${getSearchParam()}:X_Access_Token=${getAccessToken()}`;
    setAPI(syncAPI);
    setAction('sync');
  };

  const activeDevice = () => {
    Modal.confirm({
      title: `????????????????????????`,
      okText: '??????',
      okType: 'primary',
      cancelText: '??????',
      onOk() {
        startImport();
      },
    });
  };

  const syncDevice = () => {
    Modal.confirm({
      title: '???????????????????????????????',
      okText: '??????',
      okType: 'primary',
      cancelText: '??????',
      onOk() {
        // ????????????
        startSync();
      },
    });
  };

  const onDeviceProduct = (value: string) => {
    let { terms } = searchParam;
    if (terms) {
      terms.productId = value;
    } else {
      terms = {
        productId: value,
      };
    }

    handleSearch({
      pageIndex: searchParam.pageIndex,
      pageSize: searchParam.pageSize,
      terms,
      sorts: searchParam.sorter,
    });
    stateCount(value);
  };

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setDeviceIdLIst(selectedRowKeys);
    },
  };

  const _delete = (deviceId: any[]) => {
    Modal.confirm({
      title: `????????????????????????`,
      okText: '??????',
      okType: 'primary',
      cancelText: '??????',
      onOk() {
        apis.deviceInstance
          ._delete(deviceId)
          .then(response => {
            if (response.status === 200) {
              message.success('????????????????????????');
              deviceIdList.splice(0, deviceIdList.length);
              handleSearch(searchParam);
            }
          })
          .catch(() => {});
      },
    });
  };

  const _unDeploy = (deviceId: any[]) => {
    Modal.confirm({
      title: `????????????????????????`,
      okText: '??????',
      okType: 'primary',
      cancelText: '??????',
      onOk() {
        apis.deviceInstance
          ._unDeploy(deviceId)
          .then(response => {
            if (response.status === 200) {
              message.success('????????????????????????');
              deviceIdList.splice(0, deviceIdList.length);
              handleSearch(searchParam);
            }
          })
          .catch(() => {});
      },
    });
  };

  const _deploy = (deviceId: any[]) => {
    Modal.confirm({
      title: `????????????????????????`,
      okText: '??????',
      okType: 'primary',
      cancelText: '??????',
      onOk() {
        apis.deviceInstance
          ._deploy(deviceId)
          .then(response => {
            if (response.status === 200) {
              message.success('????????????????????????');
              deviceIdList.splice(0, deviceIdList.length);
              handleSearch(searchParam);
            }
          })
          .catch(() => {});
      },
    });
  };

  const Info: FC<{
    title: React.ReactNode;
    value: React.ReactNode;
  }> = ({ title, value }) => (
    <div>
      <span>{title}</span>
      <p style={{ fontSize: '26px' }}>{value}</p>
    </div>
  );

  const menu = (
    <Menu>
      <Menu.Item key="1">
        <Button
          icon="download"
          type="default"
          onClick={() => {
            setDeviceExport(true);
          }}
        >
          ??????????????????
        </Button>
      </Menu.Item>
      <Menu.Item key="2">
        <Button
          icon="upload"
          onClick={() => {
            setDeviceImport(true);
          }}
        >
          ??????????????????
        </Button>
      </Menu.Item>
      {deviceIdList.length > 0 && (
        <Menu.Item key="3">
          <Button
            icon="delete"
            onClick={() => {
              _delete(deviceIdList);
            }}
          >
            ??????????????????
          </Button>
        </Menu.Item>
      )}
      {deviceIdList.length > 0 && (
        <Menu.Item key="6">
          <Button
            icon="stop"
            onClick={() => {
              _unDeploy(deviceIdList);
            }}
          >
            ??????????????????
          </Button>
        </Menu.Item>
      )}

      {deviceIdList.length > 0 ? (
        <Menu.Item key="4">
          <Button icon="check-circle" type="danger" onClick={() => _deploy(deviceIdList)}>
            ??????????????????
          </Button>
        </Menu.Item>
      ) : (
        <Menu.Item key="4">
          <Button icon="check-circle" type="danger" onClick={() => activeDevice()}>
            ??????????????????
          </Button>
        </Menu.Item>
      )}

      <Menu.Item key="5">
        <Button icon="sync" type="danger" onClick={() => syncDevice()}>
          ??????????????????
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <PageHeaderWrapper title="????????????">
      <div className={styles.standardList}>
        <Card bordered={false} style={{ height: 95 }}>
          <Spin spinning={deviceCount.loading}>
            <Row>
              <Col sm={7} xs={24}>
                <Select
                  placeholder="????????????"
                  showSearch
                  optionFilterProp='label'
                  allowClear
                  style={{ width: '70%', marginTop: 7 }}
                  value={product}
                  onChange={(value: string) => {
                    let key = Object.keys(location?.query)[0];
                    let params = {};
                    if (location?.query) {
                      params[key] = location?.query[key];
                    }
                    params['productId'] = value;
                    router.push({ pathname: `/device/instance`, query: params });
                    setProduct(() => value);
                    setDeviceCount({ loading: true });
                    onDeviceProduct(value);
                  }}
                >
                  {productList?.map(item => (
                    <Select.Option key={item.id} label={item.name}>{item.name}</Select.Option>
                  ))}
                </Select>
              </Col>
              <Col sm={4} xs={24}>
                <Info title="????????????" value={numeral(deviceCount.deviceTotal).format('0,0')} />
              </Col>
              <Col sm={4} xs={24}>
                <Info
                  title={<Badge status={statusMap.get('online')} text="??????" />}
                  value={numeral(deviceCount.onlineCount).format('0,0')}
                />
              </Col>
              <Col sm={4} xs={24}>
                <Info
                  title={<Badge status={statusMap.get('offline')} text="??????" />}
                  value={numeral(deviceCount.offlineCount).format('0,0')}
                />
              </Col>
              <Col sm={4} xs={24}>
                <Info
                  title={<Badge status={statusMap.get('notActive')} text="?????????" />}
                  value={numeral(deviceCount.notActiveCount).format('0,0')}
                />
              </Col>
              <Col sm={1} xs={24}>
                <Tooltip title="??????">
                  <Icon
                    type="sync"
                    style={{ fontSize: 20 }}
                    onClick={() => {
                      setDeviceCount({ loading: true });
                      stateCount(product);
                    }}
                  />
                </Tooltip>
              </Col>
            </Row>
          </Spin>
        </Card>
        <br />
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              <Search
                type={'device-instance'}
                search={(params: any) => {
                  if (Object.keys(params).length === 0) {
                    deviceIdList.splice(0, deviceIdList.length);
                  }
                  if (product) {
                    params.productId = product;
                  }
                  params.state = searchParam.terms?.state;
                  handleSearch({ terms: params, pageSize: 10, sorts: searchParam.sorts });
                }}
              />
            </div>
            <div className={styles.tableListOperator}>
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  setCurrentItem({});
                  setAddVisible(true);
                }}
              >
                ????????????
              </Button>
              <Divider type="vertical" />
              <Dropdown overlay={menu}>
                <Button icon="menu">
                  ??????????????????
                  <Icon type="down" />
                </Button>
              </Dropdown>
            </div>
            <div className={styles.StandardTable}>
              <Table
                loading={props.loading}
                columns={columns}
                dataSource={(result || {}).data}
                rowKey="id"
                onChange={onTableChange}
                rowSelection={{
                  type: 'checkbox',
                  ...rowSelection,
                }}
                pagination={{
                  current: result.pageIndex + 1,
                  total: result.total,
                  pageSize: result.pageSize,
                  showQuickJumper: true,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total: number) =>
                    `??? ${total} ????????? ???  ${result.pageIndex + 1}/${Math.ceil(
                      result.total / result.pageSize,
                    )}???`,
                }}
              />
            </div>
          </div>
        </Card>
        {addVisible && (
          <Save
            data={currentItem}
            close={() => {
              setAddVisible(false);
              setCurrentItem({});
            }}
          />
        )}
        {(processVisible || importLoading) && (
          <Process
            api={api}
            action={action}
            closeVisible={() => {
              setProcessVisible(false);
              setImportLoading(false);
              handleSearch(searchParam);
            }}
          />
        )}
        {deviceImport && (
          <Import
            productId={product}
            close={() => {
              setDeviceImport(false);
              handleSearch(searchParam);
            }}
          />
        )}
        {deviceExport && (
          <Export
            productId={product}
            searchParam={searchParam}
            close={() => {
              setDeviceExport(false);
              handleSearch(searchParam);
            }}
          />
        )}
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ deviceInstance, loading }: ConnectState) => ({
  deviceInstance,
  loading: loading.models.deviceInstance,
}))(DeviceInstancePage);
