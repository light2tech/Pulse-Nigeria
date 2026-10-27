import handler from '../index.js';

export default function copilotStatusHandler(req, res) {
  req.url = '/api/copilot/status';
  return handler(req, res);
}
