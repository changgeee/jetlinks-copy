import { SmallDashOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown } from 'antd';
import React from 'react';
import styles from './index.less';
interface Props {
  action: any;
  data: any;
}
const NodeTemplate = (props: Props) => {
  const { data, action } = props;
  return (
    <div>
      <div className={styles.node}>
        <div className={styles.top}>
          <span className={styles.title}>{data.name}</span>
          <Avatar size="small" icon={<UserOutlined />} />
        </div>

        <div className={styles.content}>
          <div className={styles.item}>
            {data.code!==null&&(<div>
              <span className={styles.mark}>编码</span>
              <span>{data.code}</span>
            </div>)}
            <div>
              <span className={styles.mark}>下级数量</span>
              <span>{data?.children?.length || 0}</span>
            </div>
          </div>
          <div className={styles.action}>
            <Dropdown overlay={action}>
              <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                <SmallDashOutlined />
              </a>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NodeTemplate;
