import handler from '../index.js';

export default function copilotStreamHandler(req, res) {
  req.url = '/api/copilot/stream';
  return handler(req, res);
}
