import raw from './crops.json';
import type { Crop } from '../lib/types';

export const CROPS: Crop[] = raw.crops as Crop[];
export const CROP_DATA_SOURCE: string = raw._source;
