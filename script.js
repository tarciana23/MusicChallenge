import { Buffer } from "buffer";

// Credenciais do cliente obtidas das variáveis de ambiente
const clientId = import.meta.env.VITE_MY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_MY_CLIENT_SECRET;

//Objeto para requisição Post - Etapa 7
let payload = {};

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

// Função para buscar o token de acesso do Spotify
async function getSpotifyToken() {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter token: ${response.statusText}`);
    }

    return (await response.json()).access_token;
  } catch (error) {
    console.error("Erro ao obter token de acesso:", error);
    throw error;
  }
}

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
    const accessToken = await getSpotifyToken();

    const artistDataList = await Promise.all(
      artistList.map(async ({ id }) => {
        const { name, followers, popularity, genres } = await fetchArtistInfo(id, accessToken);
        return { name, followers: followers.total, popularity, genres };
      })
    );

    return artistDataList;
  } catch (error) {
    console.error("Erro ao coletar dados dos artistas:", error);
    throw error;
  }
}

// Função para ordenar os artistas por número de seguidores
function sortArtists(artists) {
  return artists
    .filter(({ genres }) => genres.includes("pop"))
    .sort((a, b) => b.followers - a.followers);
}

// Função para extrair os 5 gêneros mais comuns
function extractCommonGenres(artists) {
  const genreCount = {};

  artists.forEach(({ genres }) => {
    genres.forEach((genre) => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  });

  return Object.entries(genreCount)
    .sort(([, aCount], [, bCount]) => bCount - aCount)
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

    dataArtist.append(nameP, followersP, popularityP);
    group.append(rank, img, dataArtist);
    block.appendChild(group);
  });
}

// Função para exibir os gêneros mais comuns
function displayCommonGenres(genres) {
  const block = document.getElementById("block2");

  genres.forEach(([genre, frequency], index) => {
    const group = document.createElement("div");
    group.className = "group";

    const rank = document.createElement("h3");
    rank.textContent = `#${index + 1}`;

    const genreInfo = document.createElement("div");
    genreInfo.className = "dataArtist";

    const nameP = document.createElement("p");
    nameP.textContent = genre;

    const frequencyP = document.createElement("p");
    frequencyP.textContent = `Frequency: ${frequency}`;

    genreInfo.append(nameP, frequencyP);
    group.append(rank, genreInfo);
    block.appendChild(group);
  });
}

// Função principal para coletar e exibir os dados dos artistas
collectArtistData()
  .then((artistsData) => {
    const popArtists = sortArtists(artistsData);
    const genres = extractCommonGenres(popArtists);
    
    displayArtistsByFollowers(popArtists);
    displayCommonGenres(genres);

    // Montando objeto para fazer a requisição POST
    payload = {
      github_url: "https://github.com/tarciana23/MusicChallenge",
      name: "Tarciana Souza Oliveira",
      pop_ranking: popArtists.map(({ name, followers }) => ({
        artist_name: name,
        followers: followers.toString()
      })),
      genre_ranking: genres.map(([genre]) => genre)
    };

    console.log("Payload:", payload);
  })
  .catch((error) => {
    console.error("Erro ao processar dados dos artistas:", error);
  });



  //Etapa 7 

async function sendPostRequest() {
 try{
  const response = await fetch("https://psel-solution-automation-cf-ubqz773kaq-uc.a.run.app?access_token=bC2lWA5c7mt1rSPR", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  
    if(!response.ok){
      throw new Error(`Erro ao enviar os dados : ${response.statusText}`);
    }
    console.log(`Tudo certo ${response.statusText}`);

 }catch(error){
  console.error("Erro sendPost Request: ",error);
 }
}

sendPostRequest();