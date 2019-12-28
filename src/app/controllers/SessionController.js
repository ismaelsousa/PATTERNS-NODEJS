import jwt from 'jsonwebtoken';

import authConfig from '../../config/auth';
import User from '../models/User';
import File from '../models/File';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          atrributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Chama o model de User do próprio usuário passando a senha que foi enviada
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, avatar, provider } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        provider,
        avatar,
      },
      // primeiro parametro é o payload
      // segundo é um texto único usa md5online
      // terceito passa configs
      token: jwt.sign({ id }, authConfig.secret, {
        // inspira em 7 dias
        expiresIn: authConfig.expiredIn,
      }),
    });
  }
}

export default new SessionController();
