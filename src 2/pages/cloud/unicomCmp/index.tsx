import { PageHeaderWrapper } from "@ant-design/pro-layout";
import { Button, Card, Divider, message, Popconfirm, Spin } from "antd";
import React, { useState, Fragment, useEffect } from "react";
import styles from '@/utils/table.less';
import SearchForm from "@/components/SearchForm";
import ProTable from "@/pages/system/permission/component/ProTable";
import { ColumnProps } from "antd/es/table";
import Save from './save'
import apis from '@/services'
import encodeQueryParam from '@/utils/encodeParam';

interface State {
  searchParam: any;
  editTemplateVisible: boolean;
  addVisible: boolean;
  resultList: any;
  spinning: boolean;
  saveData: any;
}

const Unicom: React.FC<{}> = () => {

  const initState: State = {
    searchParam: {
      pageSize: 10,
      sorts: {
        field: 'id',
        order: 'desc',
      },
    },
    editTemplateVisible: false, // 编辑模板
    addVisible: false,
    resultList: {},
    spinning: true,
    saveData: {},
  };

  const [resultList, setResultList] = useState(initState.resultList);
  const [addVisible, setAddVisible] = useState(initState.addVisible);
  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [spinning, setSpinning] = useState(initState.spinning);
  const [saveData, setSaveData] = useState(initState.saveData);

  const handleSearch = (params?: any) => {
    setSearchParam(params);
    apis.unicom.list(encodeQueryParam(params))
      .then((response: any) => {
        if (response.status === 200) {
          setResultList(response.result)
          setSpinning(false)
        }
      }).catch(() => {
      });
  };

  const deleteItem = (id: string) => {
    apis.unicom.remove(id).then(res => {
      if (res.status === 200) {
        message.success('删除成功');
        handleSearch(searchParam);
      }
    })
  };

  const setEnabled = (id: string) => {
    apis.unicom.save(id, { id, state: 'enabled' }).then(res => {
      if (res.status === 200) {
        message.success('启用成功');
        handleSearch(searchParam);
      }
    })
  }

  const setDisabled = (id: string) => {
    apis.unicom.save(id, { id, state: 'disabled' }).then(res => {
      if (res.status === 200) {
        message.success('禁用成功');
        handleSearch(searchParam);
      }
    })
  }

  useEffect(() => {
    handleSearch(searchParam);
  }, [])

  const columns: ColumnProps<any>[] = [
    {
      title: 'ID',
      align: 'center',
      dataIndex: 'id'
    },
    {
      title: '名称',
      align: 'center',
      dataIndex: 'name'
    },
    {
      title: '状态',
      align: 'center',
      dataIndex: 'state.text',
    },
    {
      title: '说明',
      align: 'center',
      dataIndex: 'explain',
    },
    {
      title: '操作',
      align: 'center',
      render: (record: any) => (
        <Fragment>
          <a onClick={() => {
            setAddVisible(true)
            setSaveData(record)
          }}
          >编辑</a>
          {
            record.state.value === 'disabled' && (
              <>
                <Divider type="vertical" />
                <a onClick={() => { setEnabled(record.id); }}>启用</a>
                <Divider type="vertical" />
                <Popconfirm title="确认删除"
                  onConfirm={() => { deleteItem(record.id); }}
                >
                  <a>删除</a>
                </Popconfirm>
              </>
            )
          }
          {
            record.state.value === 'enabled' && (
              <>
                <Divider type="vertical" />
                <a onClick={() => { setDisabled(record.id); }}>禁用</a>
              </>
            )
          }
        </Fragment>
      )
    }
  ]
  return (
    <PageHeaderWrapper title="联通Unicom">
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <div className={styles.tableList}>
          <div>
            <SearchForm
              search={(params: any) => {
                setSearchParam(params);
                handleSearch({ terms: params, pageSize: 10 });
              }}
              formItems={[
                {
                  label: 'ID',
                  key: 'id$LIKE',
                  type: 'string'
                },
                {
                  label: '名称',
                  key: 'name$LIKE',
                  type: 'string'
                } 
              ]}
            />
            <div>
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  setAddVisible(true)
                  setSaveData({})
                  }}
                   >新增</Button>
            </div>
          </div>
        </div>
      </Card>
      <Spin tip="加载中..." spinning={spinning}>
        <Card>
          <div className={styles.StandardTable}>
            <ProTable
              dataSource={resultList?.data}
              columns={columns}
              rowKey="id"
              onSearch={(params: any) => {
                handleSearch(params);
              }}
              paginationConfig={resultList}
            />
          </div>
        </Card>
      </Spin>
      {addVisible && (
        <Save
          data={ saveData }
          close={() => {
            setAddVisible(false)
          }}
          reload={() => {
            handleSearch(searchParam)
          }}
        />
      )}
    </PageHeaderWrapper>
  )
};
export default Unicom;
