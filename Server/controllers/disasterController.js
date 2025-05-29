import {Disaster} from '../models/index.js';


export const createDisaster = async (req, res) => {
  try {
    const { name, type, severity, details } = req.body;
    const disaster = await Disaster.create({ name, type, severity, details });
    res.status(201).json({ message: 'Disaster created', disaster });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllDisasters = async (req, res) => {
  try {
    const disasters = await Disaster.findAll();
    res.json(disasters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDisasterById = async (req, res) => {
  try {
    const disaster = await Disaster.findByPk(req.params.id);
    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });
    res.json(disaster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findByPk(req.params.id);
    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });

    await disaster.update(req.body);
    res.json({ message: 'Disaster updated', disaster });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findByPk(req.params.id);
    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });

    await disaster.destroy();
    res.json({ message: 'Disaster deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this function to your existing exports
export const getDisasterCount = async (req, res) => {
  try {
    const count = await Disaster.count();
    res.json({ totalDisasters: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDisasterTypeCountsFiveYears = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;

    const results = await Disaster.findAll({
      attributes: [
        [fn('YEAR', col('createdAt')), 'year'],
        'type',
        [fn('COUNT', col('type')), 'count'],
      ],
      where: {
        createdAt: {
          [Op.between]: [new Date(startYear, 0, 1), new Date(currentYear, 11, 31, 23, 59, 59)],
        },
      },
      group: [fn('YEAR', col('createdAt')), 'type'],
      raw: true,
    });

    const typeTemplate = {
      natural: 0,
      flood: 0,
      landslide: 0,
      earthquake: 0,
      other: 0,
    };

    const yearlyCounts = {};

    for (let year = startYear; year <= currentYear; year++) {
      yearlyCounts[year] = { ...typeTemplate };
    }

    results.forEach(row => {
      const year = row.year;
      const type = row.type?.toLowerCase();
      const count = parseInt(row.count, 10);

      if (!yearlyCounts[year]) {
        yearlyCounts[year] = { ...typeTemplate };
      }

      if (yearlyCounts[year].hasOwnProperty(type)) {
        yearlyCounts[year][type] = count;
      } else {
        yearlyCounts[year].other += count;
      }
    });

    res.json(yearlyCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};