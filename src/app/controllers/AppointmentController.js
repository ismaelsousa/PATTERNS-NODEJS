import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

import CreateAppointmentService from '../services/CreateAppointmentService';
import CancellAppointmentService from '../services/CancellAppointmentService';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointment = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20,
      // Pula 20 em 20
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
          ],
        },
      ],
    });

    return res.json(appointment);
  }

  async store(req, res) {
    const { provider_id, date } = req.body;
    const appointment = await CreateAppointmentService.run({
      provider_id,
      user_id: req.userId,
      date,
    });
    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await CancellAppointmentService.run({
      provider_id: req.params.id,
      user_id: req.userId,
    });
    return res.json(appointment);
  }
}

export default new AppointmentController();
