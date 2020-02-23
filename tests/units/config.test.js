import config from '../../src/services/config';
import client from '../../src/client/index';

let createInfo = client.__get__('createInfo');

describe('test private function', () => {
  test('config variable', () => {
    expect(config.url).toBe('https://api.zoom.us');
    expect(config.ifCase).toBe(true);
    expect(config.debug).toBe(false);
  });
  test('create info', () => {
    let commands = [{ command: 'meet', hint: '<>', description: 'meet' }];
    let resultMsg = {
      body: [
        { type: 'message', text: 'Here are some quick tips to get started!' },
        { type: 'message', text: 'meet <>', style: { bold: true } },
        { type: 'message', text: 'meet' }
      ],
      header: { text: "Hi there - I'm myapp bot", style: { bold: true } }
    };
    expect(createInfo.help(commands, 'myapp')).toEqual(resultMsg);
  });
});

//what't more
