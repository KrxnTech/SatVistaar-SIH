import path from 'path';
import { BaseProvider } from '../src/providers/base.provider.js';

const provider = new BaseProvider({ name: 'test' });
const samplePath = path.resolve('uploads/13d03a34-5a2b-4b8f-a813-0013c09f115f.jpeg');

const dataUri = provider.imageToBase64DataUri(samplePath);
console.log('Original / Generated URI length:', dataUri.length);
