export const ArcadeGameId = Object.freeze({
  TARGET_RUSH: 'target-rush',
  GOALIE_REFLEX: 'goalie-reflex',
  BANK_SHOT: 'bank-shot',
});

export const ArcadeDifficulty = Object.freeze({
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
});

export const ArcadeScoreUnit = Object.freeze({
  POINTS: 'points',
  SAVES: 'saves',
  STARS: 'stars',
});

export const ARCADE_GAMES = [
  {
    id: ArcadeGameId.TARGET_RUSH,
    translationKey: 'targetRush',
    difficulty: ArcadeDifficulty.EASY,
    scoreUnit: ArcadeScoreUnit.POINTS,
    sessionSeconds: 60,
  },
  {
    id: ArcadeGameId.GOALIE_REFLEX,
    translationKey: 'goalieReflex',
    difficulty: ArcadeDifficulty.MEDIUM,
    scoreUnit: ArcadeScoreUnit.SAVES,
    sessionSeconds: null,
  },
  {
    id: ArcadeGameId.BANK_SHOT,
    translationKey: 'bankShot',
    difficulty: ArcadeDifficulty.HARD,
    scoreUnit: ArcadeScoreUnit.STARS,
    sessionSeconds: null,
  },
];

export const findArcadeGame = (gameId) =>
  ARCADE_GAMES.find((game) => game.id === gameId) ?? null;
