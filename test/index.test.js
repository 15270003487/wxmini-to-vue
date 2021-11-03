/*
 * @Author: bucai
 * @Date: 2021-02-04 15:59:38
 * @LastEditors: bucai<1450941858@qq.com>
 * @LastEditTime: 2021-11-03 15:08:41
 * @Description: 
 */
const path = require('path');

const fs = require('fs')


describe('主程序测试', () => {
  const T = require('../src')

  const mockPath = path.resolve(__dirname, './mock');
  const outputPath = path.resolve(__dirname, './output');

  test('编译测试', () => {
    const componentPath = path.resolve(outputPath, 'agreement/agreement.vue')

    const t = new T()
    t.transform(mockPath, outputPath)
    const stat = fs.statSync(componentPath)

    const fileTime = new Date(stat.mtime);

    expect(stat.isFile()).toBe(true)
    // 上下浮动不超过二十秒中
    expect(fileTime.getTime() > (Date.now() - 10000) && fileTime.getTime() < (Date.now() + 10000)).toBe(true)

  });

  test('测试参数', () => {
    const componentPath = path.resolve(outputPath, 'agreement/agreement.vue')
    const options = {}
    const t = new T(options)
    t.transform(mockPath, outputPath)
    const stat = fs.statSync(componentPath)

    const fileTime = new Date(stat.mtime);

    expect(stat.isFile()).toBe(true)
    // 上下浮动不超过二十秒中
    expect(fileTime.getTime() > (Date.now() - 10000) && fileTime.getTime() < (Date.now() + 10000)).toBe(true)
  });
});