# EMSI programėlė – prototipas

Mobiliosios programėlės prototipas EMSI degalinių tinklui (iOS ir Android).
**Visi duomenys, SMS, mokėjimai ir integracijos yra demonstraciniai (mock).** Tikrų mokėjimų nėra, asmens duomenys niekur nesiunčiami – viskas laikoma tik telefone.

Technologijos: Expo SDK 58 (React Native) · TypeScript · expo-router · zustand · react-native-maps · i18next (LT/EN).

---

## 1. Kaip paleisti per Expo Go

### Ko reikia
- Kompiuterio su **Node.js 20+** (rekomenduojama 24 LTS) – <https://nodejs.org>.
- Telefone – programėlės **Expo Go** (App Store / Google Play). Ji turi palaikyti **SDK 58** (naujausia Expo Go versija palaiko).
- Telefonas ir kompiuteris – **tame pačiame Wi-Fi tinkle**.

### Paleidimas
```bash
cd emsi-app
npm install          # tik pirmą kartą
npx expo start
```
Terminale atsiras QR kodas:
- **iPhone** – nuskenuokite QR kodą kamera.
- **Android** – nuskenuokite QR kodą Expo Go programėle.

Jei telefonas neprisijungia (pvz., įmonės Wi-Fi blokuoja), naudokite tunelį:
```bash
npx expo start --tunnel
```

> Šiame kompiuteryje Node.js įdiegtas į `~/.local/node`. Prieš komandas terminale paleiskite
> `export PATH="$HOME/.local/node/bin:$PATH"` (arba įdiekite Node.js įprastai).

### Patikrinimas
```bash
npx tsc --noEmit     # tipų patikra
npx expo-doctor      # projekto konfigūracijos patikra
```

### Web versija (be telefono)
Naujausia versija automatiškai skelbiama adresu **<https://propeleris07.github.io/emsi-app/>** – kiekvieną kartą įkėlus pakeitimus į `main` šaką (GitHub Actions: `.github/workflows/deploy-web.yml`).
Patogiausia atidaryti telefone arba siauriname naršyklės lange. Web versijoje žemėlapis ir telefono pranešimai nerodomi – tam naudokite Expo Go.

Kodas: <https://github.com/propeleris07/emsi-app>

---

## 2. Demonstraciniai prisijungimo duomenys

| Kas | Reikšmė |
|---|---|
| Telefono numeris | bet koks LT mobiliojo numeris, pvz. `612 34567` |
| SMS kodas | `1234` |
| Plastikinės kortelės numeris | bet kurie 16 skaitmenų |
| Studento LSP/ISIC numeris | bet kurie ≥ 6 simboliai |
| Ūkio registracijos numeris | bet kurie ≥ 5 skaitmenys |
| Verslo (Fleet) įmonės kodas / PIN | `304123456` / `1234` |

Naujai paskyrai automatiškai sugeneruojama ~5 mėnesių demonstracinė pirkimų istorija (kad būtų matoma statistika ir sutaupymai).
Norėdami pradėti iš naujo: **Daugiau → Nustatymai → Atsijungti** (arba **Privatumas → Ištrinti paskyrą**).

---

## 3. Kur ką keisti

| Ką keisti | Kur |
|---|---|
| **Logotipas** | `assets/logo.png` – pakeiskite failą tuo pačiu pavadinimu (rekomenduojama ~490×203 px, permatomas fonas). Jei proporcijos kitos – pataisykite `RATIO` faile `src/components/Logo.tsx`. |
| **Programėlės ikona ir užsklanda** | `assets/icon.png`, `assets/splash-icon.png`, `assets/android-icon-*.png`; pavadinimas – `app.json` (`expo.name`). |
| **Spalvos, šriftų dydžiai, tarpai, šešėliai** | `src/config/theme.ts` – prekės ženklo spalvos `brand` (žalia `#08783D`, geltona `#FFD21F`, šviesiai pilka `#F5F6F5`, tekstas `#202824`), šviesi (`light`, numatytoji) ir tamsi (`dark`, įjungiama nustatymuose) paletės, gradientai, apvalinimai (`radius`) ir šešėliai (`makeShadows`). |
| **Nuotraukos** (pradžios ekranas, pasiūlymai, kava, plovykla) | Failai `assets/images/`, susiejimas – `src/config/images.ts` (`OFFER_PHOTOS` – kuri nuotrauka kuriam pasiūlymui). |
| **Atributika** | Prekės – `src/data/merch.json`; nuotraukos – žr. skyrelį „Atributikos nuotraukos“ žemiau. |
| **Funkcijų jungikliai** | `src/config/featureFlags.ts` – pvz. `competitorPriceComparison: true` įjungia kainų palyginimą su konkurentais. |
| **Tekstai (LT / EN)** | `src/i18n/lt.json`, `src/i18n/en.json`. |
| **Degalinės** | `src/data/stations.json` – 50 tikrų EMSI degalinių adresų ir koordinačių (iš viešo sąrašo emsi.lt, 2026-11); `region` – apskritis žemėlapio filtrui. Darbo laikas, paslaugos, telefonai, kolonėlių skaičius ir kainų skirtumas `priceOffset` – demonstraciniai. |
| **Kainos** | `src/data/prices.json` – bazinės tinklo kainos €/l. |
| **Kortelių nuolaidos** | `src/data/cardRules.json` – bendra, studento, ūkininko, verslo. |
| **Pasiūlymai, kuponai, akcijų dienos** | `src/data/offers.json` (`validDays` – kiek dienų nuo šiandien galioja; `weekday` – akcijų diena; `en` – vertimas). |
| **Plovimo programos** | `src/data/carwash.json` |
| **Kavos / maisto meniu** | `src/data/menu.json` |
| **Abonementai** | `src/data/subscriptions.json` |
| **Demonstracinės mokėjimo kortelės** | `src/data/paymentMethods.json` |
| **Verslo (Fleet) paskyra** | `src/data/fleet.json` (įmonė, limitai, automobiliai, demo kodas/PIN). |
| **Konkurentų kainos** (jungiklis) | `src/data/competitors.json` – sugalvoti duomenys be tikrų prekių ženklų. |
| **Mokėti/pylimo greitis demonstracijoje** | `src/services/mock/fueling.ts` (`LITRES_PER_SECOND`). |
| **Pilno bako rezervacija** | `src/config/payments.ts` |

> Pastaba apie spalvas: pagrindinė žalia, geltona, pilka ir teksto spalva – pagal užsakovo nurodytus kodus; raudona ir mėlyna – iš viešo EMSI logotipo.

### Atributikos nuotraukos

Kol nuotraukos neįkeltos, atributikos kataloge rodomas žalias rezervinis paveikslėlis su ikona ir užrašu „Nuotrauka netrukus“.

1. Įkelkite nuotrauką į `assets/merch/` (geriausia kvadratinė, ~1000×1000 px, JPG ar PNG), pvz. `cap.jpg`.
2. Faile `src/config/merchImages.ts` pridėkite eilutę su prekės ID iš `src/data/merch.json`:
   ```ts
   'm-cap': require('../../assets/merch/cap.jpg'),
   ```
3. Išsaugokite – nuotrauka atsiras katalogo kortelėje, prekės puslapyje ir krepšelyje.

### Nuotraukų autoriai

Visos nuotraukos – iš [Unsplash](https://unsplash.com), naudojamos pagal nemokamą [Unsplash License](https://unsplash.com/license) (leidžiamas komercinis naudojimas, autoriaus nurodyti nebūtina, bet mandagu):

| Failas | Autorius |
|---|---|
| `coffee.jpg` | Shannon Douglas |
| `coffee-leaf.jpg` | Alexandr Popadin |
| `coffee-togo.jpg` | Kelly Sikkema |
| `hotdog.jpg` | Ball Park Brand |
| `croissant.jpg` | Conor Brown |
| `drink.jpg` | Julia D'Alkmin |
| `carwash.jpg` | Clarence Tioh |
| `fuel.jpg` | engin akyurt |
| `station.jpg` (pradžios ekrano viršus – pakeiskite tikra EMSI degalinės nuotrauka) | engin akyurt |
| `road.jpg` | Anees Ur Rehman |

Žemėlapis naršyklėje – © [OpenStreetMap](https://www.openstreetmap.org/copyright) bendraautoriai (Leaflet biblioteka). Viešai programėlei su dideliu srautu reikėtų komercinio žemėlapių tiekėjo (OSM serverių naudojimo taisyklės riboja apkrovą).

---

## 4. Projekto struktūra

```
emsi-app/
├─ assets/                  logotipas, ikonos
│  ├─ images/               nuotraukos (Unsplash)
│  └─ merch/                čia įkelkite atributikos nuotraukas
├─ src/
│  ├─ app/                  ekranai (expo-router: kiekvienas failas – ekranas)
│  │  ├─ auth/              registracija: telefonas → SMS → sutikimai → kortelė
│  │  ├─ (tabs)/            5 skirtukai: Pradžia, Mokėti, Kortelė, Pasiūlymai, Daugiau
│  │  ├─ pay/               degalai ir kiekis → patvirtinimas → pylimas
│  │  ├─ receipt/ history/  kvitai, istorija, statistika
│  │  ├─ stations/ prices/  žemėlapis, degalinės, kainos, kainų signalai
│  │  ├─ carwash/ food/     plovykla, kava ir maistas
│  │  ├─ plate/ fleet/      mokėjimas pagal numerį, verslo režimas
│  │  ├─ merch/             atributika: katalogas, prekė, krepšelis
│  │  └─ settings/          profilis, kortelės, pranešimai, privatumas, pagalba, D.U.K.
│  ├─ components/           bendri UI komponentai
│  ├─ config/               tema, funkcijų jungikliai
│  ├─ data/                 demonstraciniai JSON duomenys
│  ├─ hooks/  store/        būsena (zustand)
│  ├─ i18n/                 LT ir EN tekstai
│  ├─ models/               duomenų modeliai (TypeScript tipai)
│  ├─ services/             PASLAUGŲ SLUOKSNIS
│  │  ├─ types.ts           sąsajos (interface), kurias naudoja ekranai
│  │  ├─ index.ts           VIENA vieta, kur parenkamos implementacijos
│  │  ├─ mock/              demonstracinės implementacijos
│  │  └─ device/            telefono funkcijos (vietiniai pranešimai)
│  └─ utils/                formatavimas, kainų skaičiavimas, PDF, brūkšninis kodas
└─ README.md
```

**Svarbiausias architektūros principas:** ekranai kreipiasi tik į `services` sąsajas (`src/services/types.ts`). Norint prijungti tikrą sistemą, parašoma nauja klasė (pvz. `EmsiApiFleetService implements FleetService`) ir pakeičiama viena eilutė `src/services/index.ts`. Ekranų keisti nereikia.

Demonstracijai skirti veiksmai („Demo: kaina krenta“, „Demo: atvažiuoti“, „Demo: nupirkta kava“) yra pažymėti „Demo:“ ir surinkti `DemoService` sąsajoje bei keliuose aiškiai pažymėtuose mygtukuose – tikroje versijoje jie pašalinami.

---

## 5. Demonstracijos scenarijus (≈ 8 min.)

**Prieš pristatymą (5 min.):** įjunkite telefono ekrano rodymą projektoriuje (AirPlay / ekrano kopijavimas), padidinkite ryškumą, įjunkite „Netrukdyti“ (bet leiskite Expo Go pranešimus). Jei norite parodyti registraciją – atsijunkite. Patikrinkite, kad veikia internetas.

| # | Laikas | Ką daryti | Ką pasakyti |
|---|---|---|---|
| 1 | 0:00 | **Pasveikinimo ekranas** → perjunkite **EN** ir atgal **LT**. Spauskite „Pradėti“. | „Programėlė dvikalbė, prisijungimas – tik telefono numeriu, be slaptažodžių.“ |
| 2 | 0:30 | Įveskite numerį → kodas **1234** → „Sutinku su visais“ (rodykite BDAR sutikimų sąrašą) → pasirinkite **Bendra kortelė** → „Gauti kortelę“. | „Kortelė aktyvi iš karto – nebereikia QR kodo degalinėje.“ |
| 3 | 1:30 | **Pradžia**: artimiausia degalinė su kainomis (didelė – su kortele, perbraukta – be), sutaupymų juosta, didelis mygtukas „Mokėti už kurą“. | „Vienos rankos naudojimui – svarbiausia matosi iš karto.“ |
| 4 | 2:00 | **Kortelė**: QR ↔ brūkšninis kodas, „Pridėti į Apple/Google Wallet“, sutaupymų skaitliukas. | „Išsprendžiame Wallet problemą be trečiųjų šalių programėlių.“ |
| 5 | 2:45 | **Pasiūlymai**: aktyvuokite kuponą **„–5 ct/l kelionei“**. Parodykite akcijų dienas ir segmentų pasiūlymus. | „Asmeniniai kuponai – aktyvuoji vienu paspaudimu.“ |
| 6 | 3:15 | **Mokėti** → kolonėlė 1 → Benzinas 95 → 30 € → patvirtinimo ekrane parodykite **dvi nuolaidas** (kortelė + kuponas) → „Patvirtinti ir atrakinti“. Pylimas (~15 s) → **e-kvitas** → „Atsisiųsti PDF“. | „Į kasą eiti nereikia. Nuolaidos taikomos automatiškai, kvitas – telefone.“ |
| 7 | 4:30 | **Pradžia → Pagal numerį** → „Pridėti“ → `KLM 482` → Išsaugoti → „Demo: atvažiuoti“ → „Atvažiuoti“. Palaukite pranešimo. | „Ateities funkcija: kamera atpažįsta numerį – nereikia net telefono.“ |
| 8 | 5:30 | **Plovykla** → Premium → Pirkti → kodas → „Persiųsti draugui“. Parodykite abonementą. | „Plovimą galima nupirkti bet kur ir padovanoti.“ |
| 9 | 6:00 | **Kava ir maistas**: du kartus „Demo: nupirkta kava“ → nemokamos kavos pranešimas. Meniu su kortelės kainomis. | „Skaitmeninė spaudukų kortelė – kas 6-a kava dovanų.“ |
| 10 | 6:30 | **Kainų signalai** → „Sukurti signalą“ → „Demo: kaina krenta“ → pranešimas. Parodykite 30 d. kainų grafiką. | „Klientas grįžta, kai kaina jam palanki.“ |
| 11 | 7:00 | **Daugiau → Verslui (Fleet)** → kodas `304123456`, PIN `1234` → limitai, automobiliai → **Ataskaitos vadovui** (PDF). Tada **Mokėti → Įmonės** → automobilis + rida. | „Verslo klientai – limitai, rida, ataskaitos, susiejimas su „Mano EMSI“.“ |
| 12 | 7:45 | **Daugiau → Pirkimų istorija → Išlaidų statistika**; **Nustatymai**: tamsi tema, privatumas (duomenų kopija, paskyros ištrynimas). | „Pilnas BDAR reikalavimų rinkinys jau numatytas.“ |

Pasirinktinai: `src/config/featureFlags.ts` → `competitorPriceComparison: true` – pradžios ekrane atsiranda „EMSI pigiau X ct/l nei artimiausia konkurento degalinė“.

---

## 6. Ką reikia padaryti, kad tai taptų tikra programa

Prototipas parodo produktą ir vartotojo kelią. Toliau – darbai, kad programėlė galėtų būti išleista.

### 6.1. EMSI sistemų integracija
- **Kasų (POS) sistema** – nuolaidų pritaikymas nuskenavus kortelės QR/brūkšninį kodą, spaudukų ir kuponų įskaitymas, e-kvitų perdavimas į programėlę. Reikia API arba integracijos per kasų sistemos tiekėją.
- **Kolonėlių valdiklis (forecourt controller)** – kolonėlių būsena realiu laiku, atrakinimas po lėšų rezervavimo, pylimo duomenys (litrai, suma), pylimo pabaiga. Tai sudėtingiausia ir svarbiausia integracija mokėjimui prie kolonėlės.
- **Lojalumo sistema** – kortelių išdavimas ir susiejimas, kortelių tipai (studentų LSP/ISIC ir ūkininkų tikrinimas), sutaupymų skaičiavimas, asmeniniai kuponai ir segmentai.
- **Kainų sistema** – kainos pagal degalines ir jų istorija, kainų signalų tikrinimas serveryje.
- **Plovyklos valdiklis** – vienkartinių kodų priėmimas, abonementų tikrinimas.
- **Numerių atpažinimas (ANPR)** – kamerų integracija ir sutikimas su BDAR (atskiras poveikio duomenų apsaugai vertinimas).
- **Backend** – reikalingas EMSI serveris (API sluoksnis tarp programėlės ir minėtų sistemų), autentifikacija (OAuth2 / OpenID Connect), žurnalai, stebėsena.

### 6.2. Mokėjimų tiekėjas
- Pasirinkti tiekėją, palaikantį **lėšų rezervavimą ir vėlesnį nuskaitymą (pre-authorization / capture)**, 3D Secure, **Apple Pay ir Google Pay**, kortelių tokenizavimą.
- Kortelių duomenys turi būti įvedami tik tiekėjo saugiame lange – tada programėlei nereikia pilno **PCI DSS** sertifikavimo.
- Apple Pay „Merchant ID“, Google Pay verslo profilis, grąžinimų ir ginčų procesai.
- Verslo kortelėms – sąskaitų išrašymas ir atsiskaitymas per „Mano EMSI“.

### 6.3. „Mano EMSI“ API
- Verslo paskyrų susiejimas (vietoje demo kodo ir PIN – saugus prisijungimas), vairuotojai ir automobiliai, limitai (dienos, mėnesio, leidžiami degalai), ridos įrašai, ataskaitos vadovams.
- Galimybė vartotojui susieti asmeninę „Mano EMSI“ paskyrą su programėle.

### 6.4. SMS ir paskyros
- SMS tiekėjas vienkartiniams kodams, apsauga nuo piktnaudžiavimo (kodų siuntimo ribojimas, CAPTCHA serveryje).
- Prisijungimo raktų saugojimas telefone su `expo-secure-store`.

### 6.5. Apple Wallet / Google Wallet
- Apple: „Pass Type ID“ sertifikatas, `.pkpass` failų generavimas ir pasirašymas serveryje, atnaujinimai (pvz. sutaupymų suma kortelėje), rodymas prie degalinių pagal vietą.
- Google: Google Wallet API „issuer“ paskyra ir „Save to Google Wallet“ nuorodos.

### 6.6. Push pranešimai
- Dabar pranešimai vietiniai (sukuriami pačiame telefone). Tikroje versijoje – **APNs** (Apple) ir **FCM** (Google) per Expo Push arba tiesiogiai.
- Reikalingas *development build* (Expo Go Android nepalaiko nuotolinių push), pranešimų siuntimas iš serverio (kainų signalai, kvitai, pasiūlymai), pranešimų tipų nustatymai (jau yra programėlėje).

### 6.7. BDAR ir teisė
- Privatumo politika ir naudojimosi taisyklės (programėlėje jau numatytos vietos), sutikimų žurnalas serveryje (kas, kada, kokiai versijai sutiko).
- Poveikio duomenų apsaugai vertinimas (ypač vietai ir numerių atpažinimui), duomenų saugojimo terminai, duomenų tvarkymo sutartys su tiekėjais.
- Duomenų kopijos išdavimas ir paskyros ištrynimas (programėlėje jau yra; reikia serverio dalies). Apple ir Google reikalauja, kad paskyrą būtų galima ištrinti programėlėje.
- Akcijų taisyklės, vartotojų teisių reikalavimai, konkurentų kainų palyginimo teisinis vertinimas (jei bus įjungtas).

### 6.8. Saugumas ir kokybė
- Saugumo testavimas (penetracinis testas), API apsauga, sertifikatų „pinning“, sukčiavimo prevencija (pvz. kolonėlės atrakinimas tik būnant prie degalinės – programėlėje jau rodomas įspėjimas).
- Automatiniai testai, klaidų stebėsena (pvz. Sentry), analitika (su sutikimu), prieinamumo (accessibility) patikra.

### 6.9. Publikavimas App Store ir Google Play
1. **Apple Developer Program** (99 USD/metus, registruojama EMSI kaip juridinio asmens vardu – reikia D-U-N-S numerio) ir **Google Play Console** (25 USD vienkartinis, organizacijos paskyra).
2. Galutinis pavadinimas, ikona, ekrano nuotraukos, aprašymai (LT/EN), kategorija, amžiaus reitingas.
3. Privatumo deklaracijos: Apple „App Privacy“ etiketės ir Google „Data safety“ forma.
4. Programėlės kūrimas debesyje: `npx eas-cli build --platform all`, pateikimas: `npx eas-cli submit`. Atnaujinimai be peržiūros – `eas update`.
5. Peržiūrai Apple ir Google pateikti demo paskyrą ir paaiškinimą, kaip veikia mokėjimas prie kolonėlės.
6. Rekomenduojama pradėti nuo uždaro testavimo (TestFlight / Google Play vidinis testavimas) su EMSI darbuotojais keliose degalinėse.

### 6.10. Siūloma eiga
1. **MVP (išleidimui):** paskyra, skaitmeninė kortelė + Wallet, degalinės ir kainos, pasiūlymai, istorija ir e-kvitai (iš kasos).
2. **Mokėjimas prie kolonėlės** – po kolonėlių valdiklio ir mokėjimų tiekėjo integracijos, iš pradžių keliose degalinėse.
3. **Plovykla, kava ir abonementai, Fleet** – su „Mano EMSI“ API.
4. **Mokėjimas pagal numerį** – bandomasis projektas vienoje degalinėje.

---

## 7. Žinomi prototipo apribojimai
- Duomenys demonstraciniai: kainos, meniu, atributika, konkurentai, degalinių darbo laikas ir paslaugos sugalvoti. Tikri tik degalinių adresai ir koordinatės.
- Duomenys laikomi tik telefone (AsyncStorage). Ištrynus Expo Go duomenis, jie dingsta.
- Pylimas pagreitintas (~2,6 l/s), kad nereikėtų laukti.
- Kvitų eilutės lietuviškos ir anglų kalbos režime, nes kvitas yra fiskalinis dokumentas.
- Naršyklėje (`npx expo start --web`) žemėlapis rodomas per OpenStreetMap; telefono pranešimai rodomi tik kaip naršyklės langeliai.
- Atributikos užsakymas – demonstracinis: pinigai nenuskaitomi, prekės niekur nesiunčiamos.
