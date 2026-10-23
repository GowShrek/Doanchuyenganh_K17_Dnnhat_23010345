const AiService = require('../services/ai.service');
const { OK } = require('../core/success.response');

class AiController {
    chat = async (req, res) => {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ success: false, message: 'Thiếu messages' });
        }
        const userId = req.user?.id || null;
        const data = await AiService.chat(messages, userId);
        return new OK({ message: 'OK', metadata: data }).send(res);
    };
}

module.exports = new AiController();
