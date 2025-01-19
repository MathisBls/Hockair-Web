import Tournament from '../models/Tournament.js';

export const createTournament = async (req, res) => {
  try {
    const { name, type, isPremium, parameters, prizes, status, image, description } = req.body;

    let parsedParameters = parameters;
    let parsedPrizes = prizes;

    if (typeof parameters === 'string') {
      try {
        parsedParameters = JSON.parse(parameters);
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid JSON format in parameters', error: parseError });
      }
    }

    if (typeof prizes === 'string') {
      try {
        parsedPrizes = JSON.parse(prizes);
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid JSON format in prizes', error: parseError });
      }
    }

    const newTournament = new Tournament({
      name,
      type,
      isPremium,
      parameters: parsedParameters,
      prizes: parsedPrizes,
      status,
      image,
      description,
    });

    const savedTournament = await newTournament.save();
    res.status(201).json(savedTournament);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create tournament', error });
  }
};

export const updateTournament = async (req, res) => {
  try {
    const { name, type, isPremium, parameters, prizes, status, image, description } = req.body;
    const tournamentId = req.params.tournamentId;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    let parsedParameters = parameters;
    let parsedPrizes = prizes;

    if (typeof parameters === 'string') {
      try {
        parsedParameters = JSON.parse(parameters);
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid JSON format in parameters', error: parseError });
      }
    }

    if (typeof prizes === 'string') {
      try {
        parsedPrizes = JSON.parse(prizes);
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid JSON format in prizes', error: parseError });
      }
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      {
        ...(name && { name }),
        ...(type && { type }),
        ...(isPremium !== undefined && { isPremium }),
        ...(parameters && { parameters: parsedParameters }),
        ...(prizes && { prizes: parsedPrizes }),
        ...(status && { status }),
        ...(image && { image }),
        ...(description && { description }),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedTournament);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update tournament', error });
  }
};

export const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tournaments', error });
  }
};

export const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tournament', error });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;
    const tournament = await Tournament.findByIdAndDelete(tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.status(200).json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete tournament', error });
  }
};

export const joinTournament = async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;
    const userId = req.user._id;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    if (tournament.participants.includes(userId)) {
      return res.status(400).json({ message: 'You have already joined this tournament' });
    }

    tournament.participants.push(userId);
    await tournament.save();

    res.status(200).json({ message: 'Successfully joined the tournament' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to join tournament', error });
  }
};

export const getTournamentParticipants = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId).populate('participants', 'name email');
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    res.status(200).json(tournament.participants);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch participants', error });
  }
};
