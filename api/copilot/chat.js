import handler from '../index.js';

export default function copilotChatHandler(req, res) {
  req.url = '/api/copilot/chat';
  return handler(req, res);
}
