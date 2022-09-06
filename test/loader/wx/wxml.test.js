/*
 * @Author: bucai
 * @Date: 2021-02-04 17:24:25
 * @LastEditors: bucai<1450941858@qq.com>
 * @LastEditTime: 2021-11-03 15:17:44
 * @Description:
 */
const wxml = require('../../../src/loader/wx/wxml')

describe('loader/wx/wxml', () => {

  test('检测转换', () => {
    const { code } = wxml('<view><text>111</text></view>')
    expect(typeof code).toBe('string')
    expect( /div/.test(code)).toBe(true)
    expect( /span/.test(code)).toBe(true)
  });


  test('检测wxs', () => {
    const { code } = wxml(`
    <wxs module="ttt">
      var toFixed = function (value) {
        return (value || 0).toFixed(2);
      }
      module.exports = {
        toFixed: toFixed
      }
    </wxs>
    <view><view>{{ttt.toFixed(123.22)}}</view></view>
    `)
    expect(typeof code).toBe('string')
    expect( /module="ttt"/.test(code)).toBe(false)
    expect( /<!--\s?wxs\s?-->/.test(code)).toBe(true)
  });

});