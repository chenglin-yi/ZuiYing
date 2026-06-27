export type RootStackParamList = {
  Main: undefined
  Detail: { movieId: string; movie?: any }
  Player: { movieId: string; movie?: any; episode?: number; url?: string }
}

export type MainTabParamList = {
  Home: undefined
  Search: undefined
  Ranking: undefined
  Profile: undefined
}
