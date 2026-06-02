import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import { db } from "./index.js";
import { peopleTable } from "./schema/index.js";

const peopleData = [
  { number: 1, name: "Leleituagha Emmanuel Doubara" },
  { number: 2, name: "Romeo Samuel" },
  { number: 3, name: "Esite Brakemi Emmanuel" },
  { number: 4, name: "Makaraba Joyce Tonbrapa" },
  { number: 5, name: "Amos yerin favour" },
  { number: 6, name: "Morgan Racheal" },
  { number: 7, name: "Joseph Emmanuella Ebiakpor" },
  { number: 8, name: "Roland Freedom" },
  { number: 9, name: "Febaide Ephraim" },
  { number: 10, name: "Esosa Kelvin Obaseki" },
  { number: 11, name: "Simeon Victor Odimawei" },
  { number: 12, name: "Mamawei Izokumor Lucky" },
  { number: 13, name: "Igbunu Zilayefa Ghandi" },
  { number: 14, name: "pious oyeinmiesinde favour" },
  { number: 15, name: "ugochukwu anderson darlington" },
  { number: 16, name: "Mala Clement" },
  { number: 17, name: "Mala Roland" },
  { number: 18, name: "Kim essien ukpong" },
  { number: 19, name: "Aniefiok Aniekan Archibong" },
  { number: 20, name: "Tabita Emmanuel layefa" },
  { number: 21, name: "Igali Favoured Ayibamiedei" },
  { number: 22, name: "David Owi" },
  { number: 23, name: "Wisdom Edmond" },
  { number: 24, name: "Idoughe Ayibaditomini" },
  { number: 25, name: "Gbenebode Great" },
  { number: 26, name: "Timothy Sien" },
  { number: 27, name: "Orugbo Tombra Gift" },
  { number: 28, name: "Zipador Davis Tamaraebi" },
  { number: 29, name: "Omagbemi Jenkyns" },
  { number: 30, name: "Akpowaide Juliet" },
  { number: 31, name: "Billy Tamaraebido Christopher" },
  { number: 32, name: "Lawrence Zorbari" },
  { number: 33, name: "Ebebi peremoboere victory" },
  { number: 34, name: "Timiepere Aseri" },
  { number: 35, name: "Ebitebela Degbeye Eva" },
  { number: 36, name: "Ekpetipu Favour Mieyebi" },
  { number: 37, name: "Lemon Ediseimokumor Edith" },
  { number: 38, name: "Idibi Mirabel Ebiye" },
  { number: 39, name: "Jehff young JeClives" },
  { number: 40, name: "Timi salvation" },
  { number: 41, name: "Uroju sunshine ogelegbanwei" },
  { number: 42, name: "Tonlagha precious progress" },
  { number: 43, name: "Egone Omamoke Emonena" },
  { number: 44, name: "Ayemi Stella" },
  { number: 45, name: "Elijah Seiyefa" },
  { number: 46, name: "Tom Progress" },
  { number: 47, name: "Abednego Kehinde" },
  { number: 48, name: "Igarama Ayibapriye Godswill" },
  { number: 49, name: "Napoleon Jessica" },
  { number: 50, name: "Zahra Okechukwu" },
  { number: 51, name: "Tom Progress" },
  { number: 52, name: "Moses Fawari" },
  { number: 53, name: "Efetobore Joshua" },
  { number: 54, name: "eze philemon" },
  { number: 55, name: "Opuende Prince Clement" },
  { number: 56, name: "Alfred Seleke" },
  { number: 57, name: "Biye Timi Asaikpuka" },
  { number: 58, name: "Okpiri bright" },
  { number: 59, name: "Anenene Destiny" },
  { number: 60, name: "Governor Divine" },
  { number: 61, name: "Adagbra Efe" },
  { number: 62, name: "Fabor wisdom" },
  { number: 63, name: "Emmanuel Ekpemandu" },
  { number: 64, name: "Emmanuel Akpoebi Ogola" },
  { number: 65, name: "Amafaye Walter" },
  { number: 66, name: "Pius Tamarakro Blossom" },
  { number: 67, name: "Daniel Ibibo" },
];

async function seed() {
  console.log("Seeding people...");
  await db.insert(peopleTable).values(peopleData);
  console.log(`Seeded ${peopleData.length} people successfully!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
