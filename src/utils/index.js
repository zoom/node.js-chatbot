
import tool from './tool';
import request from './request';
import Event from './Event';
import Store from './store';
import debug from './debug';
import loop from './loop';

let out = { request, Event,Store,debug,loop};
out = Object.assign(out,tool);

export default out;