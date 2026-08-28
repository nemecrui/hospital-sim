// Amigos do costume — personagens que voltam, para as crianças reconhecerem.
// Os nomes têm de coincidir com os do backend (src/utils/content.js).
export const FRIENDS = {
  hospital: ['Zé Piloto', 'Mimi Bailarina', 'Tó Comilão', 'Vó Rosa', 'Nuno Trapalhão', 'Lena Saltitona'],
  vet: ['🐶 Bobi', '🐱 Mia', '🐰 Pipoca', '🐹 Kiko', '🐦 Piu', '🐢 Zeca']
};

export function isFriend(name, mode) {
  const list = FRIENDS[mode] || FRIENDS.hospital;
  return list.includes((name || '').trim());
}
