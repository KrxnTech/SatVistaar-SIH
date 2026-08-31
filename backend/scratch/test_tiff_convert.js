import path from 'path';
import { BaseProvider } from '../src/providers/base.provider.js';

const provider = new BaseProvider({ name: 'test' });
const tiffPath = path.resolve('uploads/13ba76c6-5cb6-4306-9e25-c7aa1b592358.tif');

try {
  const uri = provider.imageToBase64DataUri(tiffPath);
  console.log('TIFF DATA URI PREFIX:', uri.substring(0, 50));
  console.log('CONVERSION SUCCESSFUL!');
} catch (e) {
  console.error('TIFF CONVERSION FAILED:', e.message);
}
