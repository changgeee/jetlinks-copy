/*
 * @Date: 2022-07-29 15:40:57
 * @LastEditors: changgeee
 * @LastEditTime: 2022-07-31 14:14:53
 * @FilePath: /jetlinks-ui-antd/src/pages/wave/service.ts
 */
import request from '@/utils/request';
import { waveData, feature } from './info/mock';

/**
 * 获取所有测点
 * @returns
 */
export function deviceList(): Promise<any[]> {
  return request(`/api/device/list`, {
    method: 'GET'
  });
}


/**
 * 获取测点详情
 * @returns
 */
export function deviceInfo(params?: any): Promise<any[]> {
  return request(`/api/device/get/current`, {
    method: 'GET',
    params
  });
}




/**
 * 获取测点特征数据
 * @returns
 */
 export function featureHistroy(params?: any): Promise<any[]> {
  return request(`/api/device/get/feature/histroy`, {
    method: 'GET',
    params
  });
}

/**
 * 获取测点峭度数据
 * @returns
 */
 export function kurtosisHistroy(params?: any): Promise<any[]> {
  return request(`/api/device/get/feature/kurtosis/histroy`, {
    method: 'GET',
    params
  });
}

/**
 * 获取测点高低频数据
 * @returns
 */
 export function meanHistroy(params?: any): Promise<any[]> {
  return request(`/api/device/get/feature/mean/histroy`, {
    method: 'GET',
    params
  });
}


/**
 * 获取波形数据列表
 * @returns
 */
 export function waveList(params?: any): Promise<any[]> {
  return request(`/api/device/get/waves`, {
    method: 'GET',
    params
  });
}

/**
 * 获取波形数据列表
 * @returns
 */
 export function waveDetail(params?: any): Promise<any[]> {
  return request(`/api/device/get/waves/histroy`, {
    method: 'GET',
    params
  });
}
