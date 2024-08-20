import { Buffer } from "buffer";

// Credenciais do cliente obtidas das variáveis de ambiente
const clientId = import.meta.env.VITE_MY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_MY_CLIENT_SECRET;

// Função para buscar o token de acesso do Spotify
async function getSpotifyToken() {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter token: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao obter token de acesso:", error);
    throw error;
  }
}

// Lista de artistas com seus respectivos IDs no Spotify
const artistList = [
  { name: "Ed Sheeran", id: "6eUKZXaKkcviH0Ku9w2n3V" },
  { name: "Queen", id: "1dfeR4HaWDbWqFHLkxsg1d" },
  { name: "Ariana Grande", id: "66CXWjxzNUsdJxJ2JdwvnR" },
  { name: "Maroon 5", id: "04gDigrS5kc9YWfZHwBETP" },
  { name: "Imagine Dragons", id: "53XhwfbYqKCa1cC15pYq2q" },
  { name: "Eminem", id: "7dGJo4pcD2V6oG8kP0tJRR" },
  { name: "Lady Gaga", id: "1HY2Jd0NmPuamShAr6KMms" },
  { name: "Coldplay", id: "4gzpq5DPGxSnKTe4SA8HAU" },
  { name: "Beyoncé", id: "6vWDO969PvNqNYHIOW5v0m" },
  { name: "Bruno Mars", id: "0du5cEVh5yTK9QJze8zA0C" },
  { name: "Rihanna", id: "5pKCCKE2ajJHZ9KAiaK11H" },
  { name: "Shakira", id: "0EmeFodog0BfCgMzAIvKQp" },
  { name: "Justin Bieber", id: "1uNFoZAHBGtllmzznpCI3s" },
  { name: "Demi Lovato", id: "6S2OmqARrzebs0tKUEyXyp" },
  { name: "Taylor Swift", id: "06HL4z0CvFAxyc27GXpf02" },
];

// Função para buscar informações de um artista específico
async function fetchArtistInfo(artistId, accessToken) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar informações do artista: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar informações do artista:", error);
    throw error;
  }
}

// Função para coletar informações de todos os artistas na lista
async function collectArtistData() {
  try {
    const tokenData = await getSpotifyToken();
    const accessToken = tokenData.access_token;

    const artistDataList = await Promise.all(
      artistList.map(async (artist) => {
        const artistProfile = await fetchArtistInfo(artist.id, accessToken);

        return {
          name: artistProfile.name,
          followers: artistProfile.followers.total,
          popularity: artistProfile.popularity,
          genres: artistProfile.genres,
        };
      })
    );

    return artistDataList;
  } catch (error) {
    console.error("Erro ao coletar dados dos artistas:", error);
    throw error;
  }
}

// Função principal para coletar e exibir os dados dos artistas
collectArtistData()
  .then((artistsData) => {
    const popArtists = sortArtists(artistsData);
    const genres = extractCommonGenres(popArtists);

    displayArtistsByFollowers(popArtists);
    displayCommonGenres(genres);
  })
  .catch((error) => {
    console.error("Erro ao processar dados dos artistas:", error);
  });

// Função para ordenar os artistas por número de seguidores
function sortArtists(artistsData) {
  const popArtists = artistsData.filter((artist) => artist.genres.includes("pop"));
  popArtists.sort((a, b) => b.followers - a.followers);
  return popArtists;
}

// Função para extrair os 5 gêneros mais comuns
function extractCommonGenres(artistsData) {
  const genreCount = {};

  artistsData.forEach((artist) => {
    artist.genres.forEach((genre) => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  });

  return Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

// Função para exibir os artistas ordenados por seguidores
function displayArtistsByFollowers(artists) {
  const block = document.getElementById("block1");

  artists.forEach((artist, index) => {
    const group = document.createElement("div");
    group.className = "group";

    const rank = document.createElement("h3");
    rank.textContent = `#${index + 1}`;

    const img = document.createElement("img");
    img.className = "img";
    img.src = `/${artist.name}.jpg`;

    const dataArtist = document.createElement("div");
    dataArtist.className = "dataArtist";

    const nameP = document.createElement("p");
    nameP.textContent = artist.name;

    const followersP = document.createElement("p");
    followersP.textContent = `Followers: ${artist.followers}`;

    const popularityP = document.createElement("p");
    popularityP.textContent = `Popularity: ${artist.popularity}%`;

    dataArtist.appendChild(nameP);
    dataArtist.appendChild(followersP);
    dataArtist.appendChild(popularityP);

    group.appendChild(rank);
    group.appendChild(img);
    group.appendChild(dataArtist);

    block.appendChild(group);
  });
}

// Função para exibir os gêneros mais comuns
function displayCommonGenres(genres) {
  const block = document.getElementById("block2");

  genres.forEach((genre, index) => {
    const group = document.createElement("div");
    group.className = "group";

    const rank = document.createElement("h3");
    rank.textContent = `#${index + 1}`;

    const genreInfo = document.createElement("div");
    genreInfo.className = "dataArtist";

    const nameP = document.createElement("p");
    nameP.textContent = genre[0];

    const frequencyP = document.createElement("p");
    frequencyP.textContent = `Frequency: ${genre[1]}`;

    genreInfo.appendChild(nameP);
    genreInfo.appendChild(frequencyP);

    group.appendChild(rank);
    group.appendChild(genreInfo);

    block.appendChild(group);
  });
}
